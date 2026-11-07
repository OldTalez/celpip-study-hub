/*
 * LEARNING NOTE (for beginners): this file gives every button, link, card and row a soft, "honey" feel: when you press something it squashes a little
 * and springs back with a small bounce; when a mouse hovers over it, it leans gently toward the pointer; and when you scroll fast, cards and rows
 * lag a few pixels behind and then settle. (T-040, 2026-11-06; the Board approved the demo "honey.html" and the numbers below come from it.)
 *
 * The big ideas:
 *   - A SPRING. Imagine a ball on a rubber band. Pull it and let go: it rushes back, overshoots a bit and wobbles until it rests. We simulate that
 *     with two numbers per channel: STIFFNESS (how hard the band pulls) and DAMPING (how much friction stops the wobble). Many wobbles = low damping.
 *     OVERSHOOT is how far past the resting place it swings. THICKNESS is the one setting that picks stiffness and damping together (1 = bouncy and
 *     quick, 10 = slow and plump). The Board chose 4 and there is no slider for students.
 *   - Five CHANNELS per element: move right, move down, stretch wide, stretch tall, turn. Each channel has its own spring.
 *   - Only the separate CSS properties `translate`, `scale` and `rotate` are written, never `transform`. The app's own animations use `transform`,
 *     so the two cannot overwrite each other, and nothing changes the layout (no element gets bigger in the page, it only looks bigger).
 *   - ONE place writes the two CSS variables --h-ease and --h-dur (writeEase below). They hold the same spring drawn as a CSS easing curve
 *     (the CSS function linear(...)) and how long it takes to settle. The menu, the page change and the switches in css/style.css use them.
 *   - Focus mode (a practice run or the exam, body[data-mode="focus"]): only a slight press squash, stiff and with no bounce. No hover lean, no trail.
 *   - Reduced motion (the device setting): all of it is off. Nothing is written to any element, and the easing becomes a short plain fade.
 *
 * Cost: one pointer listener on the whole page (event delegation: we look at what was touched instead of attaching a listener to every button).
 * The size of an element is read only when a hover or a press starts, never on every frame. The scroll trail uses a list of the page's cards and rows
 * that is rebuilt only when the page content changes, and it moves only the ones on screen.
 *
 * Public: Honey.thickness, Honey.timing(), Honey.state() (used by tests/tools/e2e-test.cjs).
 */
const Honey = (function () {
  "use strict";

  // ---------- The few numbers that are easy to change ----------
  const THICKNESS = 4;                    // Board, 2026-11-06: "thickness of 4". Fixed; there is no slider for students.
  const FOCUS_SPRING = { K: 420, z: 0.95, depth: 0.5 };   // focus mode: stiff, nearly no bounce, light squash
  const TAP_MIN_MS = 90;                  // a very short tap still shows the squash for this long
  const TRAIL_MAX_PX = 14, TRAIL_STRETCH = 0.022;   // the most a card lags, and the most it stretches taller, while scrolling fast
  const REDUCED_EASE_MS = 160;            // reduced motion: moves become a plain fade this long
  // What counts as "clickable". The innermost one under the finger or pointer wins (closest() starts from the touched element and walks outward).
  const CLICKABLE = 'a[href], button, summary, label, select, input[type="checkbox"], input[type="radio"], [role="button"], [role="tab"], [role="option"], .option, .scenario-item';
  const TRAIL_SELECTOR = ".card, .stat-card, .option, .scenario-item, .plan-row, .check-row, .check-item, .quick";   // cards and rows that lag behind a fast scroll

  const root = document.documentElement;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const inFocusMode = () => !!document.body && document.body.getAttribute("data-mode") === "focus";
  const honeyOn = () => !reducedQuery.matches;

  // ---------- 1. Thickness: the spring numbers, and the CSS easing curve built from them ----------
  const cfg = { K: 200, C: 14, depth: 1, lag: 1, z: 0.5 };   // K = stiffness, C = damping, z = damping ratio (below 1 = it overshoots)
  let easeInfo = { css: "", ms: 0 };
  // Step response of the spring (how far it has travelled at time t when told "go to 1"), sampled to 36 points and written as linear(...).
  function buildEase(K, z) {
    const w = Math.sqrt(K), wd = w * Math.sqrt(1 - z * z);
    const f = t => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
    let T = 0.25;
    for (let t = 0.05; t < 2; t += 0.01) if (Math.abs(1 - f(t)) > 0.012) T = t;   // the last moment it is still more than 1.2% away
    T = clamp(T + 0.02, 0.3, 1.5);
    const N = 36, pts = [];
    for (let i = 0; i <= N; i++) { const v = i === N ? 1 : +f(i / N * T).toFixed(3); pts.push(i === 0 ? "0" : v + " " + (i / N * 100).toFixed(1) + "%"); }
    return { css: "linear(" + pts.join(",") + ")", ms: Math.round(T * 1000) };
  }
  // The ONE place that writes --h-ease and --h-dur. Called at start, when focus mode starts or ends, and when the reduced-motion setting changes.
  function writeEase() {
    const focus = inFocusMode(), t = THICKNESS;
    const z = focus ? FOCUS_SPRING.z : 0.38 + 0.025 * t, K = focus ? FOCUS_SPRING.K : 340 - 28 * t;
    cfg.z = z; cfg.K = K; cfg.C = 2 * z * Math.sqrt(K);
    cfg.depth = focus ? FOCUS_SPRING.depth : 0.6 + 0.08 * t;
    cfg.lag = 0.4 + 0.12 * t;
    easeInfo = buildEase(K, z);
    const ok = window.CSS && CSS.supports && CSS.supports("animation-timing-function", easeInfo.css);
    const ease = ok ? easeInfo.css : "cubic-bezier(.2,.9,.25,1.1)";   // browsers without linear(): a similar soft curve with a small overshoot
    if (reducedQuery.matches) { root.style.setProperty("--h-ease", "linear"); root.style.setProperty("--h-dur", REDUCED_EASE_MS + "ms"); }
    else { root.style.setProperty("--h-ease", ease); root.style.setProperty("--h-dur", easeInfo.ms + "ms"); }
    root.setAttribute("data-honey", honeyOn() ? "1" : "0");   // css/style.css switches the old press shrink off while honey does the squash
  }

  // ---------- 2. The spring engine ----------
  // Per element: p = positions of the 5 channels [x, y, scaleX, scaleY, rotation], v = their speeds, hv = pointer position while hovering (or null),
  // pr = pressed, ext = [extra y, extra scaleY] from the scroll trail, cx, cy, w, h = the element's centre and size, measured when a hover or press starts.
  const H = new Map(), active = new Set();
  let running = false, last = 0, hoverEl = null, pressEl = null, pressT = 0;
  const now = () => performance.now();
  function hs(el) { let s = H.get(el); if (!s) { s = { p: [0, 0, 1, 1, 0], v: [0, 0, 0, 0, 0], hv: null, pr: false, ext: [0, 1], cx: 0, cy: 0, w: 1, h: 1 }; H.set(el, s); } return s; }
  function wake(el) { active.add(el); if (!running) { running = true; last = now(); requestAnimationFrame(frame); } }
  function measure(el, s) {   // the only layout read; the current spring offset is taken out so a moving element is measured where it really is
    const r = el.getBoundingClientRect();
    s.w = Math.max(20, r.width / s.p[2]); s.h = Math.max(20, r.height / s.p[3]);
    s.cx = r.left + r.width / 2 - s.p[0]; s.cy = r.top + r.height / 2 - s.p[1];
  }
  // Where each channel is being pulled to right now.
  function target(s) {
    const t = [0, 0, 1, 1, 0], d = cfg.depth, focus = inFocusMode();
    if (s.hv && !focus) {   // mouse hover: swell about 5px, lean up to 3px toward the pointer, tilt a little on narrow things
      const nx = clamp((s.hv.x - s.cx) / (s.w / 2), -1, 1), ny = clamp((s.hv.y - s.cy) / (s.h / 2), -1, 1);
      t[0] = nx * 3; t[1] = ny * 3 - 1; t[2] = 1 + Math.min(0.05, 5 / s.w); t[3] = 1 + Math.min(0.05, 5 / s.h); t[4] = nx * Math.min(1.6, 160 / s.w);
    }
    if (s.pr) { t[2] = 1 + Math.min(0.04, 2.4 * d / s.w); t[3] = 1 - Math.min(0.12, 3.2 * d / s.h); t[1] += 1.5 * d; t[4] = 0; }   // press: squash, swell wide, sink
    if (!focus) { t[1] += s.ext[0]; t[3] *= s.ext[1]; }
    return t;
  }
  // Scroll trail: scroll speed (px per ms) fades after scrolling stops, and the on-screen cards and rows lag behind it.
  let sv = 0, svT = 0, trailOn = false, trail = [], trailIO = null;
  const visible = new Set();
  function frame(tm) {
    const dt = Math.min(0.033, (tm - last) / 1000); last = tm;
    if (!inFocusMode() && honeyOn()) {
      if (tm - svT > 50) sv *= Math.pow(0.03, dt);
      if (Math.abs(sv) > 0.003) {
        trailOn = true;
        let i = 0;
        visible.forEach(el => { const s = hs(el); s.ext = [clamp(sv * 7 * cfg.lag * (1 + 0.1 * (i++ % 6)), -TRAIL_MAX_PX, TRAIL_MAX_PX), 1 + Math.min(TRAIL_STRETCH, Math.abs(sv) * 0.01 * cfg.lag)]; active.add(el); });
      } else if (trailOn) { trailOn = false; H.forEach((s, el) => { if (s.ext[0] !== 0 || s.ext[1] !== 1) { s.ext = [0, 1]; active.add(el); } }); }
    }
    active.forEach(el => {
      const s = H.get(el); if (!s) { active.delete(el); return; }
      const tg = target(s), n = Math.ceil(dt / 0.008) || 1, h = dt / n;   // 8 ms sub-steps keep the spring stable
      let still = true;
      for (let k = 0; k < n; k++) for (let i = 0; i < 5; i++) { s.v[i] += (cfg.K * (tg[i] - s.p[i]) - cfg.C * s.v[i]) * h; s.p[i] += s.v[i] * h; }
      for (let i = 0; i < 5; i++) if (Math.abs(tg[i] - s.p[i]) > 0.0008 || Math.abs(s.v[i]) > 0.01) still = false;
      const rest = !s.hv && !s.pr && s.ext[0] === 0 && s.ext[1] === 1;
      if (still) { s.p = tg.slice(); s.v = [0, 0, 0, 0, 0]; active.delete(el); }
      if (still && rest) { el.style.translate = el.style.scale = el.style.rotate = ""; H.delete(el); }   // at rest the element is left exactly as the CSS made it
      else { el.style.translate = s.p[0].toFixed(2) + "px " + s.p[1].toFixed(2) + "px"; el.style.scale = s.p[2].toFixed(4) + " " + s.p[3].toFixed(4); el.style.rotate = s.p[4].toFixed(2) + "deg"; }
    });
    if (active.size || Math.abs(sv) > 0.003) requestAnimationFrame(frame); else running = false;
  }
  function clearEngine() { H.forEach((s, el) => { el.style.translate = el.style.scale = el.style.rotate = ""; }); H.clear(); active.clear(); hoverEl = pressEl = null; }

  // ---------- 3. Pointer events (delegated: one listener each on the whole page) ----------
  function pickable(e) {
    const el = e.target && e.target.closest ? e.target.closest(CLICKABLE) : null;
    if (!el || el.closest("[inert]") || el.disabled || el.getAttribute("aria-disabled") === "true" || el.closest(".no-honey")) return null;
    return el;
  }
  document.addEventListener("pointerdown", e => {
    if (!honeyOn()) return;
    const el = pickable(e); if (!el) return;
    const s = hs(el); if (!s.hv) measure(el, s);
    s.pr = true; pressEl = el; pressT = now(); wake(el);
  }, { passive: true, capture: true });
  function release() {
    if (!pressEl) return;
    const el = pressEl; pressEl = null;
    setTimeout(() => { const s = H.get(el); if (s) { s.pr = false; wake(el); } }, Math.max(0, TAP_MIN_MS - (now() - pressT)));   // a quick tap still shows the squash
  }
  ["pointerup", "pointercancel"].forEach(n => document.addEventListener(n, release, { passive: true, capture: true }));
  document.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || !honeyOn() || inFocusMode()) return;
    const el = pickable(e);
    if (el !== hoverEl) {
      if (hoverEl && H.has(hoverEl)) { hs(hoverEl).hv = null; wake(hoverEl); }
      hoverEl = el;
      if (el) measure(el, hs(el));
    }
    if (el) { hs(el).hv = { x: e.clientX, y: e.clientY }; wake(el); }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { if (hoverEl && H.has(hoverEl)) { hs(hoverEl).hv = null; wake(hoverEl); } hoverEl = null; });

  // ---------- 4. Scroll trail ----------
  let lastY = window.scrollY, lastYT = 0;
  window.addEventListener("scroll", () => {
    if (!honeyOn() || inFocusMode()) return;
    const y = window.scrollY, t = now(), dtm = t - lastYT;
    if (dtm < 100 && dtm > 0) sv = sv * 0.5 + ((y - lastY) / dtm) * 0.5;
    svT = t; lastY = y; lastYT = t;
    if (hoverEl && H.has(hoverEl)) { hs(hoverEl).hv = null; wake(hoverEl); hoverEl = null; }   // hover is let go as soon as scrolling starts
    if (!running && visible.size) { running = true; last = now(); requestAnimationFrame(frame); }
  }, { passive: true });
  // The cached list of this page's cards and rows. Rebuilt only when the page's content changes (a new page, a new list), at most every 150 ms.
  function rebuildTrail() {
    if (trailIO) trailIO.disconnect();
    visible.clear();
    const app = document.getElementById("app");
    trail = app ? [...app.querySelectorAll(TRAIL_SELECTOR)] : [];
    if (!("IntersectionObserver" in window)) { trail.forEach(el => visible.add(el)); return; }
    trailIO = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) visible.add(en.target);
      else { visible.delete(en.target); const s = H.get(en.target); if (s && (s.ext[0] || s.ext[1] !== 1)) { s.ext = [0, 1]; wake(en.target); } }
    }), { rootMargin: "120px 0px" });
    trail.forEach(el => trailIO.observe(el));
  }
  let trailTimer = 0;
  function trailSoon() { clearTimeout(trailTimer); trailTimer = setTimeout(rebuildTrail, 150); }
  function watchPage() {
    const app = document.getElementById("app");
    if (app) new MutationObserver(trailSoon).observe(app, { childList: true, subtree: true });
    trailSoon();
  }

  // ---------- 5. Keep up with focus mode and reduced motion ----------
  function sync() { clearEngine(); writeEase(); }
  if (reducedQuery.addEventListener) reducedQuery.addEventListener("change", sync); else if (reducedQuery.addListener) reducedQuery.addListener(sync);
  function watchMode() { if (document.body) new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["data-mode"] }); }

  writeEase();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { watchMode(); watchPage(); }); else { watchMode(); watchPage(); }

  return {
    thickness: THICKNESS,
    timing: () => ({ K: cfg.K, C: cfg.C, z: cfg.z, depth: cfg.depth, settleMs: easeInfo.ms, ease: root.style.getPropertyValue("--h-ease"), dur: root.style.getPropertyValue("--h-dur") }),
    state: () => ({ engaged: H.size, active: active.size, visibleTrail: visible.size, trail: trail.length })
  };
})();
