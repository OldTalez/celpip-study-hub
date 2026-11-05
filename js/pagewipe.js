/*
 * LEARNING NOTE (for beginners): this file is the "circle wipe" page change (T-033 B2b). When you press a page in the MENU (the side menu,
 * the icon rail, the open menu panel or the phone drawer), a teal disc grows out of the spot you pressed until it covers the screen
 * (about a quarter of a second), the page changes underneath it, and the disc shrinks away to the middle (a little longer).
 *
 * Where it plays, and where it does not (Board ruling D8):
 *   - It plays only for links inside the menu. The phone's bottom bar keeps the quick fade from js/app.js (it is used all day).
 *   - It never plays during practice or the exam (focus mode), when the learner turned "Page transition" off in Settings,
 *     or when the device asks for reduced motion. Then the page simply changes the way it always did.
 * Ideas used here:
 *   - The disc is one empty <div id="pagewipe"> (see index.html). Only its clip-path (the visible area) is animated, which is cheap.
 *   - We do not change the page ourselves. We hold the click back, grow the disc, THEN set the address (location.hash) so js/app.js
 *     draws the new page exactly as it does for every other change. While the disc runs, js/app.js skips its own fade (running() below)
 *     so two transitions never overlap.
 *   - The Settings switch lives in localStorage under "celpip_pagewipe" ("on" or "off"). It is device-wide, not per learner. The value is
 *     checked on read: only the exact word "off" turns the wipe off; anything else (a hand-edited or broken value) counts as "on".
 *   - Focus (the keyboard/screen-reader position) is moved to the new page's heading when the page has changed, so a screen reader says where you are.
 */
const PageWipe = (function () {
  "use strict";
  const KEY = "celpip_pagewipe";
  const GROW_MS = 240, SHRINK_MS = 280;
  let busy = false;

  // Allow-list: "off" is the only stored word that switches the wipe off; every other value (or no value, or a refusing browser) means on.
  function isOn() { try { return localStorage.getItem(KEY) !== "off"; } catch (e) { return true; } }
  function setOn(on) { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {} }
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const inFocusMode = () => typeof Shell !== "undefined" && Shell.focusMode.active;
  const disc = () => document.getElementById("pagewipe");

  // The farthest corner from the pressed point: the disc must grow at least this big to cover the whole window.
  const farthest = (x, y) => Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)));

  function focusHeading() {
    const app = document.getElementById("app"), h = app && app.querySelector("h1");
    if (!h) return false;
    h.setAttribute("tabindex", "-1");
    h.focus({ preventScroll: true });
    return document.activeElement === h;
  }

  function play(link) {
    const d = disc(), href = link.getAttribute("href");
    const r = link.getBoundingClientRect();
    const x = r.width || r.height ? r.left + r.width / 2 : innerWidth / 2, y = r.width || r.height ? r.top + r.height / 2 : innerHeight / 2;
    const R = farthest(x, y), at = x + "px " + y + "px";
    busy = true; d.hidden = false; d.style.pointerEvents = "auto";   // while it runs the disc catches stray taps; a second wipe cannot start (flashes stay under three a second)
    const finish = () => { d.getAnimations().forEach(a => a.cancel()); d.hidden = true; d.style.pointerEvents = ""; busy = false; };
    const failsafe = setTimeout(finish, 3000);   // whatever goes wrong, the disc never stays on the screen
    const grow = d.animate([{ clipPath: "circle(0px at " + at + ")" }, { clipPath: "circle(" + R + "px at " + at + ")" }],
      { duration: GROW_MS, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    grow.onfinish = () => {
      let shrunk = false;
      const shrink = () => {   // runs once, right after js/app.js has drawn the new page
        if (shrunk) return; shrunk = true;
        focusHeading();
        const s = d.animate([{ clipPath: "circle(" + R + "px at " + at + ")" }, { clipPath: "circle(0px at 50% 50%)" }],
          { duration: SHRINK_MS, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
        s.onfinish = () => { clearTimeout(failsafe); if (!document.activeElement || document.activeElement.tagName !== "H1") focusHeading(); finish(); };
      };
      window.addEventListener("hashchange", shrink, { once: true });   // registered after app.js's own listener, so the page is drawn first
      location.hash = href;
      setTimeout(shrink, 120);   // the address did not change after all: shrink anyway
    };
  }

  // Capture phase: we see the click before the menu's own code and decide whether to take it over.
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || !a.closest("#sidebar, #rail")) return;              // only the menu; the bottom bar and page links are left alone
    if (busy) { e.preventDefault(); return; }                      // a second tap while the disc runs is ignored
    if (!isOn() || reduced() || inFocusMode() || !disc() || !disc().animate) return;
    if (a.getAttribute("href") === location.hash) return;          // same page: nothing to wipe
    e.preventDefault();
    play(a);
  }, true);

  return { KEY, isOn, setOn, running: () => busy };
})();
