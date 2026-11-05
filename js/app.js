/* CELPIP Study Guide — client-side SPA. No build step, no backend; all state in localStorage. */

// LEARNING NOTE (for beginners): how this app is organised.
// It is a "single-page app": index.html is loaded once, and JavaScript swaps what is shown
// in the main area as you click around. The address bar changes only after the # (for
// example #/practice), which the "router" below watches: route("name", handler) registers a
// screen, and render() clears the page and runs the handler for the current address.
// Screens are built by pasting HTML text into the page with el(`...`). Anything typed by a
// user is passed through escapeHtml first, so it shows as text and cannot run as code.
// T-032: the big practice data is no longer loaded up front. js/loader.js fetches it when a route needs it (see route(), render() and
// withData() below); js/data/meta.js is the small always-loaded summary. SKILLS[i].overview is always there, SKILLS[i].data only after loading.
// Reading order: utilities, timer, speech and recording helpers, router, then one section per screen.
// The frame around the screens (menus, theme, focus mode) lives in js/shell.js, which loads first; this file calls it
// through the Shell object when a screen is drawn and when a practice run or the exam starts or ends.
// Small inline SVG icons (drawn with lines, so they follow the text colour and need no image files).
// LEARNING NOTE: SVG is a text format for drawings. "stroke=currentColor" means "use the colour of the surrounding text",
// so the same icon works in light and dark themes. aria-hidden hides it from screen readers because the word beside it says the same thing.
function skillIcon(id) {
  const p = {
    listening: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/>',
    reading: '<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>',
    writing: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    speaking: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
  }[id] || "";
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
}

// T-032: the big practice data (passages, prompts) is loaded on demand by js/loader.js, so `data` below is a getter that only
// works once a screen has asked for it (Loader.needData). `overview` (part names, tips) is always here, from the small
// js/data/meta.js. A screen that touches `.data` too early gets a clear error instead of a quiet blank.
// A "getter" (get data() {...}) is a property that runs a little function each time it is read.
function loadedData(skillId, data) {
  if (!data) throw new Error("Practice data for " + skillId + " is not loaded yet: call Loader.needData first");
  return data;
}
const SKILLS = [
  { id: "listening", name: "Listening", icon: skillIcon("listening"), overview: CELPIP_META.overview.listening, get data() { return loadedData("listening", typeof LISTENING_DATA !== "undefined" ? LISTENING_DATA : null); } },
  { id: "reading", name: "Reading", icon: skillIcon("reading"), overview: CELPIP_META.overview.reading, get data() { return loadedData("reading", typeof READING_DATA !== "undefined" ? READING_DATA : null); } },
  { id: "writing", name: "Writing", icon: skillIcon("writing"), overview: CELPIP_META.overview.writing, get data() { return loadedData("writing", typeof WRITING_DATA !== "undefined" ? WRITING_DATA : null); } },
  { id: "speaking", name: "Speaking", icon: skillIcon("speaking"), overview: CELPIP_META.overview.speaking, get data() { return loadedData("speaking", typeof SPEAKING_DATA !== "undefined" ? SPEAKING_DATA : null); } }
];
const skillById = id => SKILLS.find(s => s.id === id);

// ---------- Utilities ----------
// Shuffles a copy of a list: walk from the end, swapping each item with a random earlier one.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, Math.min(n, arr.length)); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtTime(totalSec) {
  totalSec = Math.max(0, Math.round(totalSec));
  const m = Math.floor(totalSec / 60), s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}
// A "template" element parses HTML text into real page elements without showing them yet.
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

// ---------- Simple countdown timer ----------
// Every live timer registers itself here so navigation can stop it — otherwise a
// stray setInterval keeps firing after its DOM is torn down and throws on every tick.
let activeTimers = [];
function stopAllTimers() { activeTimers.forEach(t => t.stop()); activeTimers = []; }

// Returns a timer object. The inner functions keep access to "remaining" (a closure),
// and setInterval(tick, 1000) calls tick once per second.
function Countdown(seconds, onTick, onDone) {
  let remaining = seconds;
  let handle = null;
  function tick() {
    onTick(remaining);
    if (remaining <= 0) { stop(); onDone(); return; }
    remaining -= 1;
  }
  function start() { tick(); handle = setInterval(tick, 1000); activeTimers.push(timer); }
  function stop() { if (handle) clearInterval(handle); handle = null; }
  const timer = { start, stop, addTime: sec => { remaining += sec; } };
  return timer;
}

// Shows a countdown's time in its box and marks the box when time runs low, so a glance is enough:
// "low" (a clock icon and the words "Low time") from the last quarter or last minute, whichever is shorter, and "critical" (a red pill with an alert icon) in the last
// 10 seconds or last tenth. The CSS reads data-state. For longer timers a screen reader also hears "1:00 left" once,
// through the hidden "announcer" box in index.html (aria-live means: read out changes to this box).
function paintTimer(target, remaining, total) {
  const node = typeof target === "string" ? document.getElementById(target) : target;
  if (!node) return;
  node.textContent = fmtTime(remaining);
  const state = remaining <= Math.min(10, total * 0.1) ? "critical" : remaining <= Math.min(60, total * 0.25) ? "low" : "";
  if ((node.dataset.state || "") === state) return;
  node.dataset.state = state;
  const say = document.getElementById("announcer");
  if (state && total >= 120 && say) say.textContent = fmtTime(remaining) + " left";
}

// The ring around the Speaking timer: a circle drawn with pathLength="100", so "how much of the line to hide"
// (stroke-dashoffset) is simply the percentage of time already used.
function paintRing(id, remaining, total) {
  const ring = document.getElementById(id);
  if (ring) ring.style.strokeDashoffset = String(100 - (100 * remaining) / total);
}
function ringTimerHtml(seconds) {
  return `<div class="ring-wrap">
    <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-track" cx="60" cy="60" r="54"/><circle class="ring-fill" id="ringFill" cx="60" cy="60" r="54" pathLength="100"/></svg>
    <div class="timer big" id="timerDisplay" role="timer">${fmtTime(seconds)}</div>
  </div>`;
}

// Counts how many questions in a form have an answer picked and writes "3 of 6 answered" into node.
// A question counts once however often you change your mind (a Set keeps each question name only once).
// onChange(n, names) is told the count and the Set of answered question names; the question dots in js/tools.js
// use it to repaint themselves, so there is one counter, not two.
function watchAnswered(form, node, total, onChange) {
  const update = () => {
    const names = new Set([...form.querySelectorAll("input:checked")].map(i => i.name));
    const n = names.size;
    node.textContent = `${n} of ${total} answered`;
    node.classList.toggle("all-done", n === total);
    if (onChange) onChange(n, names);
  };
  form.addEventListener("change", update);
  update();
}

// ---------- Speech synthesis (Listening playback) ----------
// Reads listening passages aloud using the browser's built-in speech synthesis (no audio files needed).
const SPEECH_RATE = 0.95;  // how fast the browser voice reads (1 is normal); also used to estimate the audio length for the progress bar
const Speech = (() => {
  let utter = null;
  let supported = "speechSynthesis" in window;
  // onprogress(charIndex) is called as the voice reaches each word ("boundary" event); not every voice sends them.
  function speak(text, { onend, onprogress, rate = SPEECH_RATE } = {}) {
    if (!supported) { if (onend) setTimeout(onend, 500); return; }
    window.speechSynthesis.cancel();
    utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    if (onprogress) utter.onboundary = e => onprogress(e.charIndex);
    utter.onend = () => onend && onend();
    utter.onerror = () => onend && onend();
    window.speechSynthesis.speak(utter);
  }
  function stop() { if (supported) window.speechSynthesis.cancel(); }
  return { speak, stop, get supported() { return supported; } };
})();

// ---------- Microphone recording (Speaking practice) ----------
// Records your microphone through the browser (it asks permission first). The audio stays on this computer.
const Recorder = (() => {
  let mediaRecorder = null, chunks = [], stream = null;
  async function start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("no-media-devices");
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.start();
  }
  function stop() {
    return new Promise(resolve => {
      if (!mediaRecorder) return resolve(null);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        resolve(URL.createObjectURL(blob));
      };
      mediaRecorder.stop();
    });
  }
  // Leaving the page mid-recording: stop and let go of the microphone (its light goes off), keep nothing.
  function cancel() {
    MicMeter.stop();
    try { if (mediaRecorder && mediaRecorder.state !== "inactive") { mediaRecorder.onstop = null; mediaRecorder.stop(); } } catch (e) {}
    if (stream) stream.getTracks().forEach(t => t.stop());
    mediaRecorder = null; stream = null; chunks = [];
  }
  return { start, stop, cancel, get stream() { return stream; } };
})();

// ---------- Live microphone level (Speaking practice) ----------
// Shows that the microphone is really hearing you: a row of bars that rise and fall with your voice.
// LEARNING NOTE: the Web Audio API lets a page look at sound as numbers. An "analyser" gives the current wave as a
// list of values around 128 (silence); how far they swing from 128 is the loudness (we take the RMS, a kind of average).
// Everything happens inside the browser; no sound leaves the device. requestAnimationFrame runs a function just before
// each screen repaint; we only update every 70 ms so the bars move at a calm pace.
const MicMeter = (() => {
  let ctx = null, raf = 0;
  function start(stream, node) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !stream || !node) return;
    stop();
    let analyser;
    try {
      ctx = new AC();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    } catch (e) { stop(); return; }
    const buf = new Uint8Array(analyser.fftSize);
    const bars = [...node.querySelectorAll("i")];
    const levels = new Array(bars.length).fill(0);
    let last = 0;
    node.classList.remove("hidden");
    const frame = t => {
      raf = requestAnimationFrame(frame);
      if (t - last < 70) return;
      last = t;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) { const d = (v - 128) / 128; sum += d * d; }
      levels.shift();
      levels.push(Math.min(1, Math.sqrt(sum / buf.length) * 5));  // newest level on the right, older ones slide left
      bars.forEach((b, i) => { b.style.transform = `scaleY(${(0.08 + levels[i] * 0.92).toFixed(3)})`; });
    };
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (ctx) { try { ctx.close(); } catch (e) {} }
    ctx = null;
  }
  return { start, stop };
})();

// ---------- Passage highlighter and notes: see js/tools.js (PassageTools) ----------

// ---------- Speech-to-text transcription (Speaking practice, opt-in) ----------
// Uses the browser's built-in speech recognition. In Chrome and Edge this SENDS THE AUDIO to an online speech
// service (Google's or Microsoft's) to turn it into text, so it is off unless the learner switches on
// "Speaking transcripts" in Settings (Board decision 2026-11-05: opt-in). The recording itself never leaves the device.
const Transcriber = (() => {
  const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null, finalText = "";
  const supported = !!Impl;
  function start() {
    if (!supported) return false;
    finalText = "";
    recognition = new Impl();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
      }
    };
    recognition.onerror = () => {};
    try { recognition.start(); return true; } catch (e) { return false; }
  }
  function stop() {
    return new Promise(resolve => {
      if (!recognition) return resolve("");
      // Some browsers never fire "end" (no connection, service down): give up after 3 seconds so the review still opens.
      const giveUp = setTimeout(() => resolve(finalText.trim()), 3000);
      recognition.onend = () => { clearTimeout(giveUp); resolve(finalText.trim()); };
      try { recognition.stop(); } catch (e) { clearTimeout(giveUp); resolve(finalText.trim()); }
    });
  }
  function abort() { if (recognition) { recognition.onend = null; try { recognition.abort(); } catch (e) {} recognition = null; } }
  return { start, stop, abort, get supported() { return supported; } };
})();

// ---------- Router ----------
const app = document.getElementById("app");
const routes = {};
// T-032: a route can say which data bundles it needs (names from js/loader.js). `needs` is a list, or a function that is given
// the rest of the address (for example ["reading"] for #/practice/reading) and returns a list. `label` is the words shown if
// loading is slow ("Loading practice..."). A route with no `needs` draws at once.
const routeNeeds = {};
function route(pattern, handler, opts) { routes[pattern] = handler; if (opts) routeNeeds[pattern] = opts; }
function navigate(hash) { window.location.hash = hash; }
function currentRoute() { return (window.location.hash || "#/dashboard").slice(1); }

// screenId goes up by one every time a new screen is drawn. Work that finishes later (speech ending, a recording being
// saved, a data file arriving) checks that the screen it belongs to is still showing (onScreen(id)) before it draws anything,
// so it can never take over a page you moved to.
let screenId = 0;
function onScreen(id) { return id === screenId; }

// The data a screen needs: always a list of names the Loader knows. A bad address (for example #/practice/__proto__) gives none.
function needsFor(name, rest) {
  const o = Object.hasOwn(routeNeeds, name) ? routeNeeds[name] : null;
  const list = o ? (typeof o.needs === "function" ? o.needs(rest) : o.needs) : [];
  return Array.isArray(list) ? list : [];
}
function labelFor(name) { return Object.hasOwn(routeNeeds, name) && routeNeeds[name].label ? routeNeeds[name].label : "Loading"; }
// What a skill's practice needs (its passages or prompts, plus the explanations or model answers shown after an answer).
function needsForSkill(id) { return Object.hasOwn(Loader.SKILL_NEEDS, id) ? Loader.SKILL_NEEDS[id] : []; }

// Run `fn` once the data is here. For a button on a screen that is already showing (a Home tile that starts a practice):
// if the data is loaded, `fn` runs at once; otherwise it runs when the data arrives, unless you have moved on by then.
// A failure shows an error toast; pressing the button again tries again.
function withData(needs, fn) {
  if (Loader.isLoaded(needs)) return fn();
  const myScreen = screenId;
  toast("Loading practice...", "info");
  Loader.needData(needs).then(() => { if (onScreen(myScreen)) fn(); },
    err => { if (onScreen(myScreen)) toast(err.message + " Press the button again to retry.", "error"); });
}

// The loading skeleton (shown only if loading takes more than 150 ms) and the error panel with Retry.
const LOADING_SKELETON_MS = 150;
function showSkeleton(label) {
  app.innerHTML = '<div class="loading-card" role="status"><span class="spinner" aria-hidden="true"></span><p>' + escapeHtml(label) + '...</p></div>';
}
function showLoadError(err) {
  app.innerHTML = '<h1>This page could not load</h1><div class="card load-error" role="alert"><p>' + escapeHtml(err && err.loadFailed ? err.message : "Something went wrong while loading this page.") +
    '</p><p class="muted small">Once you have opened it online, it is saved on this device and works offline.</p><button type="button" class="btn btn-primary" id="loadRetry">Retry</button></div>';
  document.getElementById("loadRetry").onclick = () => render();
}

function render() {
  const myScreen = ++screenId;
  Speech.stop();
  stopAllTimers();
  PassageTools.detach();         // the selection pop-up and note tip belong to the old screen
  Toast.clear();                 // so does a toast left over from the screen before
  Recorder.cancel();             // a microphone left recording is switched off
  Transcriber.abort();
  window.onbeforeunload = null;  // the "exam in progress" warning belongs to the exam screen only
  const path = currentRoute();
  lastRoute = path;
  const parts = path.split("/").filter(Boolean);
  const top = parts[0] || "dashboard";
  Shell.beforeRender(top);       // ends focus mode, closes the open menu, marks the current menu item
  const known = Object.hasOwn(routes, top);   // hasOwn: "#/__proto__" or "#/constructor" must not find the plain object's own members
  const name = known ? top : "dashboard", rest = known ? parts.slice(1) : [];
  app.innerHTML = "";            // the old screen goes now, so it can never be seen while new data loads
  app.removeAttribute("aria-busy");
  const draw = () => { routes[name](rest); Shell.afterRender(); window.scrollTo(0, 0); };   // afterRender marks the screen title, fills the theme switches
  const needs = needsFor(name, rest);
  if (Loader.isLoaded(needs)) return draw();   // nothing to wait for: draw in the same moment, as before
  app.setAttribute("aria-busy", "true");
  const slow = setTimeout(() => { if (onScreen(myScreen)) showSkeleton(labelFor(name)); }, LOADING_SKELETON_MS);
  Loader.needData(needs).then(() => {
    clearTimeout(slow);
    if (!onScreen(myScreen)) return;           // you went elsewhere while the files were coming: draw nothing
    app.removeAttribute("aria-busy"); app.innerHTML = ""; draw();
  }, err => {
    clearTimeout(slow);
    if (!onScreen(myScreen)) return;
    app.removeAttribute("aria-busy"); showLoadError(err); Shell.afterRender();
  });
}

// Screen changes use the View Transitions API: the browser fades the old screen out and the new one in (the CSS in
// style.css sets the timing). Where it is missing, or the person asked their device for reduced motion, or the route did
// not change (for example "Practice Again" on the same page), the screen is simply drawn as before.
let lastRoute = null;
function goToRoute() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced || lastRoute === null || currentRoute() === lastRoute) return render();
  if (typeof PageWipe !== "undefined" && PageWipe.running()) return render();   // the circle wipe is covering the screen: it IS the transition, so no second one (T-033 B2b)
  const html = document.documentElement;
  html.classList.add("vt-route");  // the CSS only animates the screen while this class is on
  const done = () => html.classList.remove("vt-route");
  const t = document.startViewTransition(() => { render(); });  // no return value: the fade must not wait for slow data
  t.finished.then(done, done);
  t.ready.catch(() => {});   // a newer change skips this one ("Transition was skipped"): that is fine, and must not be an uncaught error (T-033 B2b)
}
window.addEventListener("hashchange", goToRoute);
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#/"]');
  if (a && a.getAttribute("href") === window.location.hash) { e.preventDefault(); render(); }
});

// ---------- Shared score helpers ----------
function latestClbForSkill(history, skillId) {
  const attempts = history
    .filter(h => (h.type === "practice" && h.skill === skillId) || (h.type === "exam" && h.breakdown && h.breakdown[skillId]))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!attempts.length) return null;
  const last = attempts[attempts.length - 1];
  return last.type === "exam" ? last.breakdown[skillId].clb : last.clb;
}
function bestClbForSkill(history, skillId) {
  const attempts = history.filter(h => (h.type === "practice" && h.skill === skillId) || (h.type === "exam" && h.breakdown && h.breakdown[skillId]));
  const vals = attempts.map(a => a.type === "exam" ? a.breakdown[skillId].clb : a.clb);
  return vals.length ? Math.max(...vals) : null;
}

// ================= PRACTICE (mock quizzes) =================
route("practice", (rest) => {
  if (rest[0]) return renderPracticeSkill(rest[0]);
  app.appendChild(el(`
    <h1>Practice</h1>
    <p class="muted">Short, focused mock quizzes for each skill. Every attempt is scored and saved so you can watch your progress.</p>
    <section class="grid-4">
      ${SKILLS.map(s => `<a class="card cta" href="#/practice/${s.id}">
        <div class="stat-icon">${s.icon}</div><h3>${s.name}</h3>
        <p class="muted small">${s.id === "listening" || s.id === "reading" ? "Multiple choice, instantly scored" : "Timed response with self-assessment rubric"}</p>
      </a>`).join("")}
    </section>
  `));
}, { needs: rest => (rest[0] ? needsForSkill(rest[0]) : []), label: "Loading practice" });   // T-032: the chosen skill's passages or prompts, plus its model answers (Writing, Speaking)

// "Resume where you left off?" card (T-031 turn C): shown at the top of a practice screen when js/drafts.js holds a draft for it.
function draftCard(kind, label, onResume) {
  const d = Drafts.read(kind);
  if (!d) return;
  const when = new Date(d.savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const card = el(`<div class="card draft-card" id="draftCard" role="region" aria-label="Unfinished practice">
    <h2>Resume where you left off?</h2>
    <p class="muted">${escapeHtml(label(d))} Saved ${escapeHtml(when)}. Drafts stay only on this device.</p>
    <div class="cta-row-single"><button class="btn btn-primary" id="draftResume" type="button">Resume</button><button class="btn" id="draftFresh" type="button">Start fresh</button></div>
  </div>`);
  const back = app.querySelector(".back-link");
  if (back) back.after(card); else app.prepend(card);
  document.getElementById("draftResume").onclick = () => onResume(d);
  document.getElementById("draftFresh").onclick = () => { Drafts.discard(kind); document.getElementById("draftCard").remove(); toast("Draft removed", "info"); };
}

function renderPracticeSkill(id) {
  const skill = skillById(id);
  if (!skill) return navigate("#/practice");
  if (id === "listening" || id === "reading") return renderMcqPracticeIntro(skill);
  return renderProductivePracticeIntro(skill);
}

// --- MCQ practice (listening/reading) ---
function renderMcqPracticeIntro(skill) {
  const passages = skill.data.passages;
  const parts = skill.data.overview.parts;
  const totalQ = passages.reduce((a, p) => a + p.questions.length, 0);

  app.appendChild(el(`
    <a href="#/practice" class="back-link">&larr; All practice</a>
    <h1>${skill.icon} ${skill.name} Practice</h1>
    <p class="muted">${passages.length} passages &middot; ${totalQ} questions in the pool. Every attempt pulls a fresh random selection, so you won't see the same set twice in a row.</p>
    <div class="grid-2">
      <div class="card">
        <h2 class="h3">Quick Practice</h2>
        <p class="muted">1 random passage from any part, ~5 minutes. Great for a daily warm-up.</p>
        <button class="btn btn-primary" id="quickBtn">Start Quick Practice</button>
      </div>
      <div class="card">
        <h2 class="h3">Timed Section</h2>
        <p class="muted">One passage per part with a running clock, ${skill.id === "listening" ? "about 47 minutes" : "about 55 minutes"} in total. When time is up the set ends. Good for the weekly timed mini-test.</p>
        <button class="btn" id="timedBtn">Start Timed Section</button>
      </div>
      <div class="card">
        <h2 class="h3">Section Mock</h2>
        <p class="muted">One passage per official part (${parts.length} parts), back to back — mirrors the full real ${skill.name} section's variety and length.</p>
        <button class="btn" id="sectionBtn">Start Section Mock</button>
      </div>
    </div>
    <h2 class="mt">Practice by Part</h2>
    <p class="muted">Drill one specific part until it clicks.</p>
    <div class="grid-2">
      ${parts.map((p, i) => {
        const partNum = i + 1;
        const count = passages.filter(ps => ps.partNum === partNum).length;
        return `<div class="card">
          <span class="tag">${p.name}</span>
          <p class="muted small">${p.desc}</p>
          <p class="muted small">${count} passages available</p>
          <button class="btn" data-part="${partNum}" ${count === 0 ? "disabled" : ""}>Practice this part</button>
        </div>`;
      }).join("")}
    </div>
  `));

  draftCard(skill.id, d => `${skill.name} practice, passage ${Math.min(d.pIndex + 1, d.passageIds.length)} of ${d.passageIds.length}${d.timeLimitSec ? ", timed" : ""}.`, d => {
    runMcqPractice(skill, d.passageIds.map(id => passages.find(p => p.id === id)), d.timeLimitSec ? { timeLimitSec: d.timeLimitSec } : {}, d);
  });
  document.getElementById("quickBtn").onclick = () => runMcqPractice(skill, sample(passages, 1));
  document.getElementById("timedBtn").onclick = () => {
    const set = parts.map((p, i) => sample(passages.filter(ps => ps.partNum === i + 1), 1)[0]).filter(Boolean);
    runMcqPractice(skill, set, { timeLimitSec: (skill.id === "listening" ? 47 : 55) * 60 });
  };
  document.getElementById("sectionBtn").onclick = () => {
    const set = parts.map((p, i) => sample(passages.filter(ps => ps.partNum === i + 1), 1)[0]).filter(Boolean);
    runMcqPractice(skill, set);
  };
  app.querySelectorAll("[data-part]").forEach(btn => {
    btn.onclick = () => {
      const partNum = parseInt(btn.dataset.part);
      const pool = passages.filter(ps => ps.partNum === partNum);
      runMcqPractice(skill, sample(pool, Math.min(3, pool.length)));
    };
  });
}

// opts.timeLimitSec turns on a running clock for the whole set (v2). When it reaches zero the passage on screen is
// checked as it stands and the rest are skipped, like a real timed section.
function runMcqPractice(skill, passageList, opts = {}, resume = null) {
  Shell.focusMode.enter({ name: skill.name + (opts.timeLimitSec ? " timed section" : " practice"), draft: true });  // menus away, Exit button shown
  // resume (T-031 turn C) is a cleaned draft from js/drafts.js: where the learner stopped, the answers so far and the time used.
  let pIndex = resume ? resume.pIndex : 0;
  let clock = null, clockLeft = resume ? resume.clockLeft : (opts.timeLimitSec || 0), timeUp = false;
  const userAnswers = resume ? resume.done.map(d => ({ passageId: d.passageId, answers: d.answers, secs: d.secs })) : []; // { passageId, answers: [selectedIndex,...] }
  let live = null;   // the passage on screen: { qs, form } (null on a review screen)
  const draft = Drafts.watch(skill.id, () => {
    const done = userAnswers.map(u => ({ passageId: u.passageId, answers: u.answers, secs: u.secs }));
    let current = null;
    if (live) {
      const p = passageList[pIndex];
      const answers = p.questions.map((q, i) => { const c = live.form.querySelector(`input[name="q${i}"]:checked`); return c ? parseInt(c.value) : null; });
      if (!done.length && answers.every(a => a === null)) return null;    // nothing done yet: no draft
      current = { answers, flags: live.qs.flags.slice(), secs: live.qs.timer.all() };
    }
    return { kind: skill.id, passageIds: passageList.map(p => p.id), pIndex: live ? pIndex : done.length, timeLimitSec: opts.timeLimitSec || 0, clockLeft, done, current };
  });
  activeTimers.push(draft);   // the router calls stop() on every screen change: that saves the draft one last time

  function renderPassage() {
    const passage = passageList[pIndex];
    const answers = new Array(passage.questions.length).fill(null);
    const back = resume && resume.current && resume.pIndex === pIndex ? resume.current : null;   // first screen after "Resume"
    resume = null;
    const isListening = skill.id === "listening";
    // Question tools for this passage: the seconds spent per question, and which questions are flagged (js/tools.js).
    const qs = { timer: QTimer(passage.questions.length), flags: new Array(passage.questions.length).fill(false) };
    if (back) { qs.timer.load(back.secs); qs.flags = back.flags.slice(); }

    app.innerHTML = "";
    app.appendChild(el(`
      <div class="run-header">
        <span class="tag">${passage.part}</span>
        <span class="muted small">Passage ${pIndex + 1} of ${passageList.length}</span>
        <span class="answered muted small" id="answeredCount" aria-live="polite"></span>
        ${opts.timeLimitSec ? `<span><span class="timer-label">Time left</span><span class="timer" id="mcqTimer" role="timer">${fmtTime(clockLeft)}</span></span>` : ""}
      </div>
      <h2>${passage.title}</h2>
      ${isListening ? `
        <div class="audio-box">
          ${Speech.supported ? `
            <button class="btn" id="playBtn">Play audio</button>
            <span class="muted small" id="audioStatus">Not played yet</span>
            ${listenBarHtml()}
          ` : `<p class="muted">Your browser doesn't support text-to-speech playback. Read the transcript below instead:</p><p class="transcript">${escapeHtml(passage.script)}</p>`}
        </div>
      ` : ""}
      ${isListening ? "" : `<div class="split"><div class="split-passage" tabindex="0" role="region" aria-label="Passage">${PassageTools.barHtml()}<div class="passage-text">${escapeHtml(passage.text).replace(/\n/g, "<br>")}</div></div><div class="split-questions">`}
      <form id="qForm">
        ${passage.questions.map((q, qi) => `
          <div class="question-block">
            <p class="q-text"><strong>${qi + 1}.</strong> ${escapeHtml(q.q)}</p>
            <div class="options">
              ${q.options.map((opt, oi) => `
                <label class="option">
                  <input type="radio" name="q${qi}" value="${oi}">
                  <span>${escapeHtml(opt)}</span>
                </label>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </form>
      <div class="run-footer">
        <button class="btn btn-primary" id="submitPassage">Check Answers</button>
      </div>
      ${isListening ? "" : `</div></div>`}
    `));
    if (back) back.answers.forEach((v, i) => { if (v !== null) { const r = document.querySelector(`#qForm input[name="q${i}"][value="${v}"]`); if (r) r.checked = true; } });
    live = { qs, form: document.getElementById("qForm") };
    // Dots, Flag buttons and the "This question" clock; the answered counter repaints the dots too.
    const qt = mountQuestionTools(document.getElementById("qForm"), qs, { aids: !realismOn(), header: app.querySelector(".run-header") });
    activeTimers.push(qt);  // the router stops it when the screen changes
    watchAnswered(document.getElementById("qForm"), document.getElementById("answeredCount"), passage.questions.length, (n, names) => qt.sync(names));
    if (!isListening) PassageTools.attach(app.querySelector(".split-passage"), PassageTools.newState());

    if (isListening && Speech.supported) {
      const playBtn = document.getElementById("playBtn");
      const status = document.getElementById("audioStatus");
      const bar = ListenBar(document.getElementById("listenBar"), passage.script, SPEECH_RATE);
      activeTimers.push(bar);
      playBtn.onclick = () => {
        playBtn.disabled = true;
        status.textContent = "Playing...";
        bar.start();
        Speech.speak(passage.script, {
          rate: SPEECH_RATE, onprogress: ci => bar.boundary(ci),
          onend: () => {
            bar.end();
            // With "Practise like the real test" on, the audio plays once, as on test day.
            if (realismOn()) status.textContent = "Finished playing (once, like the real test)";
            else { status.textContent = "Finished playing (click again to replay)"; playBtn.disabled = false; }
          }
        });
      };
    }

    if (opts.timeLimitSec && !clock) {
      clock = Countdown(clockLeft || opts.timeLimitSec, r => { clockLeft = r; paintTimer("mcqTimer", r, opts.timeLimitSec); },
        () => { timeUp = true; document.getElementById("submitPassage") && document.getElementById("submitPassage").click(); });
      clock.start();
    }
    document.getElementById("submitPassage").onclick = () => {
      const form = document.getElementById("qForm");
      passage.questions.forEach((q, qi) => {
        const val = form.querySelector(`input[name="q${qi}"]:checked`);
        answers[qi] = val ? parseInt(val.value) : null;
      });
      qt.stop();  // stop counting; the review screen does not count as time on a question
      userAnswers.push({ passageId: passage.id, answers, secs: qs.timer.all() });
      live = null;   // on the review screen a saved draft resumes at the NEXT passage
      showReview(passage, answers, qs.flags);
    };
  }

  // LEARNING NOTE (T-031 turn B): questions the learner flagged for review are listed FIRST on this screen, with a "Flagged" word
  // (not just a colour or position). Everything else keeps its original order, so the printed question numbers (1., 2., ...) still
  // match the test. Array.sort is stable in modern browsers: items that compare equal stay in their original order.
  function showReview(passage, answers, flags) {
    flags = flags || [];
    const order = passage.questions.map((q, i) => i).sort((a, b) => (flags[b] ? 1 : 0) - (flags[a] ? 1 : 0));
    if (window.Study) Study.recordMcq(skill.id, passage, answers, "practice");
    const correctCount = passage.questions.filter((q, i) => answers[i] === q.answer).length;
    // T-032: the explanations (a big file) are fetched now, when the learner checks answers, not when the practice starts.
    // The review is drawn at once with an empty slot under each question; the slots are filled when the file has arrived.
    const explainReady = Loader.isLoaded(["explanations"]);
    app.innerHTML = "";
    app.appendChild(el(`
      <h2>${passage.title} — Review</h2>
      <p class="score-line">${correctCount} / ${passage.questions.length} correct</p>
      ${explainReady ? "" : '<p class="explain-status" id="explainStatus" role="status">Loading explanations...</p>'}
      ${order.map(qi => {
        const q = passage.questions[qi];
        const correct = answers[qi] === q.answer;
        return `<div class="question-block review ${correct ? "correct" : "incorrect"}${flags[qi] ? " was-flagged" : ""}">
          ${flags[qi] ? `<p class="flag-label">Flagged</p>` : ""}
          <p class="q-text"><strong>${qi + 1}.</strong> ${escapeHtml(q.q)}</p>
          <div class="options">
            ${q.options.map((opt, oi) => {
              let cls = "";
              if (oi === q.answer) cls = "right-answer";
              else if (oi === answers[qi]) cls = "wrong-answer";
              return `<div class="option static ${cls}">${escapeHtml(opt)}</div>`;
            }).join("")}
          </div>
          <div class="explain-slot" data-qi="${qi}">${explainReady && window.Study ? Study.explanationHtml(passage, qi, correct) : ""}</div>
        </div>`;
      }).join("")}
      <div class="run-footer">
        ${explainReady ? "" : '<p class="explain-status" id="explainStatusEnd" role="status">Loading explanations...</p>'}
        <button class="btn btn-primary" id="nextPassage">${pIndex + 1 < passageList.length && !timeUp ? "Next Passage" : "Finish & See Score"}</button>
      </div>
    `));
    if (!explainReady) fillExplanations(passage, answers);
    document.getElementById("nextPassage").onclick = () => {
      pIndex++;
      if (pIndex < passageList.length && !timeUp) renderPassage();
      else finishPractice();
    };
  }

  // Loads the explanations file, then fills the slots under the questions. If you pressed Next Passage before it arrived, the slots are
  // gone and nothing is drawn. The status line appears twice, near the score at the top and beside the Next / Finish button, so a
  // failure is seen wherever the learner has scrolled to. On failure both say so and offer Retry; the answers and score stay as they are.
  // (This runs after the review is drawn, so time running out never waits for it: the score and "Finish & See Score" are already there.)
  function fillExplanations(passage, answers) {
    const lines = () => [...app.querySelectorAll(".explain-status")];
    Loader.needData(["explanations"]).then(() => {
      lines().forEach(l => l.remove());
      app.querySelectorAll(".explain-slot").forEach(slot => {
        const qi = parseInt(slot.dataset.qi);
        if (window.Study) slot.innerHTML = Study.explanationHtml(passage, qi, answers[qi] === passage.questions[qi].answer);
      });
    }, err => {
      lines().forEach(l => {
        l.classList.add("explain-failed");
        l.textContent = err.message + " ";
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn btn-sm"; b.textContent = "Retry";
        b.onclick = () => { lines().forEach(x => { x.classList.remove("explain-failed"); x.textContent = "Loading explanations..."; }); fillExplanations(passage, answers); };
        l.appendChild(b);
      });
    });
  }

  function finishPractice() {
    draft.finish();   // finished: no draft kept
    if (clock) clock.stop();
    Shell.focusMode.exit();  // the result screen shows the menus again
    let totalCorrect = 0, totalQuestions = 0;
    userAnswers.forEach(ua => {
      const passage = passageList.find(p => p.id === ua.passageId);
      totalQuestions += passage.questions.length;
      totalCorrect += passage.questions.filter((q, i) => ua.answers[i] === q.answer).length;
    });
    // In a timed section, passages the clock cut off count as unanswered (wrong), like a real test.
    if (opts.timeLimitSec) passageList.forEach(p => { if (!userAnswers.some(u => u.passageId === p.id)) totalQuestions += p.questions.length; });
    const pct = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const clb = clbFromPercent(pct);
    // timing: seconds per question, in passage order; a passage the clock cut off counts as zeros (see buildTiming in tools.js).
    const timing = buildTiming(passageList.map(p => { const u = userAnswers.find(x => x.passageId === p.id); return u ? u.secs : new Array(p.questions.length).fill(0); }));
    const attempt = Storage.saveAttempt({
      type: "practice", skill: skill.id, mode: opts.timeLimitSec ? "mcq-timed" : "mcq",
      passageIds: passageList.map(p => p.id),
      correct: totalCorrect, total: totalQuestions, pct, clb, timing
    });
    app.innerHTML = "";
    app.appendChild(el(`
      <div class="card result-card">
        <h1>Practice Complete</h1>
        <div class="big-score">${pct}%</div>
        <p>${totalCorrect} / ${totalQuestions} correct &middot; estimated CLB <strong>${clb}</strong></p>
        <p class="muted">Saved to your history on ${fmtDate(attempt.date)}.</p>
        <div class="cta-row-single">
          <a class="btn btn-primary" href="#/practice/${skill.id}">Practice Again</a>
          <a class="btn" href="#/history">View History</a>
        </div>
      </div>
    `));
  }

  if (pIndex >= passageList.length) finishPractice(); else renderPassage();
}

// --- Productive practice (writing/speaking) ---
function renderProductivePracticeIntro(skill) {
  return skill.id === "writing" ? renderWritingIntro(skill) : renderSpeakingIntro(skill);
}

function renderWritingIntro(skill) {
  const prompts = skill.data.prompts;
  const emailPrompts = prompts.filter(p => p.taskType === "email");
  const surveyPrompts = prompts.filter(p => p.taskType === "survey");
  app.appendChild(el(`
    <a href="#/practice" class="back-link">&larr; All practice</a>
    <h1>${skill.icon} Writing Practice</h1>
    <p class="muted">${prompts.length} scenarios in the pool. You'll get a real countdown timer, then self-assess using the official-style rubric.</p>
    <div class="grid-2">
      <div class="card">
        <span class="tag">Task 1</span>
        <h2 class="h3">Writing an Email</h2>
        <p class="muted small">${emailPrompts.length} scenarios &middot; 27 min &middot; 150-200 words</p>
        <button class="btn btn-primary" id="emailBtn" ${emailPrompts.length === 0 ? "disabled" : ""}>Random Email Task</button>
      </div>
      <div class="card">
        <span class="tag">Task 2</span>
        <h2 class="h3">Survey Response</h2>
        <p class="muted small">${surveyPrompts.length} scenarios &middot; 26 min &middot; 150-200 words</p>
        <button class="btn btn-primary" id="surveyBtn" ${surveyPrompts.length === 0 ? "disabled" : ""}>Random Survey Task</button>
      </div>
    </div>
    <h2 class="h3 mt">Or pick a specific scenario</h2>
    <div class="scenario-list">
      ${prompts.map(p => `<button class="scenario-item" data-id="${p.id}"><span class="tag">${p.taskType === "email" ? "Email" : "Survey"}</span>${escapeHtml(p.title || p.task)}</button>`).join("")}
    </div>
  `));
  draftCard("writing", d => `Writing practice, ${wordCount(d.text)} words written, ${fmtTime(d.timeLeftSec)} left.`, d => runWritingTask(skill, prompts.find(p => p.id === d.promptId), false, undefined, d));
  if (emailPrompts.length) document.getElementById("emailBtn").onclick = () => runWritingTask(skill, sample(emailPrompts, 1)[0], false);
  if (surveyPrompts.length) document.getElementById("surveyBtn").onclick = () => runWritingTask(skill, sample(surveyPrompts, 1)[0], false);
  app.querySelectorAll(".scenario-item").forEach(btn => {
    btn.onclick = () => runWritingTask(skill, prompts.find(p => p.id === btn.dataset.id), false);
  });
}

function renderSpeakingIntro(skill) {
  const prompts = skill.data.prompts;
  const taskNums = [...new Set(prompts.map(p => p.taskNum))].sort((a, b) => a - b);
  app.appendChild(el(`
    <a href="#/practice" class="back-link">&larr; All practice</a>
    <h1>${skill.icon} Speaking Practice</h1>
    <p class="muted">${prompts.length} scenarios across the 8 official task types. Pick one to drill, or let it surprise you.</p>
    <div class="grid-2">
      ${taskNums.map(tn => {
        const group = prompts.filter(p => p.taskNum === tn);
        return `<div class="card">
          <span class="tag">${group[0].task}</span>
          <p class="muted small">${group.length} scenarios &middot; ${group[0].prepSec}s prep / ${group[0].responseSec}s response</p>
          <button class="btn btn-primary" data-tasknum="${tn}">Random for this task</button>
        </div>`;
      }).join("")}
      <div class="card">
        <h2 class="h3">Surprise Me</h2>
        <p class="muted">Fully random across all 8 task types.</p>
        <button class="btn" id="randomBtn">Start Random</button>
      </div>
    </div>
  `));
  app.querySelectorAll("[data-tasknum]").forEach(btn => {
    btn.onclick = () => {
      const tn = parseInt(btn.dataset.tasknum);
      runSpeakingTask(skill, sample(prompts.filter(p => p.taskNum === tn), 1)[0], false);
    };
  });
  document.getElementById("randomBtn").onclick = () => runSpeakingTask(skill, sample(prompts, 1)[0], false);
}

function runWritingTask(skill, prompt, isExam, onComplete, resume) {
  Shell.focusMode.enter({ name: "Writing practice", exam: isExam, draft: !isExam });  // inside the exam this keeps the exam's settings
  let timer = null, timeUp = false;
  app.innerHTML = "";
  app.appendChild(el(`
    <div class="run-header"><span class="tag">${prompt.task}</span><span class="timer" id="timerDisplay" role="timer">${fmtTime(prompt.timeLimitMin * 60)}</span></div>
    <h2>${prompt.title || prompt.task}</h2>
    <div class="prompt-box">${escapeHtml(prompt.prompt).replace(/\n/g, "<br>")}</div>
    <textarea id="writingArea" rows="12" placeholder="Start writing here..."></textarea>
    ${wordBarHtml(prompt.wordTarget)}
    <div class="run-footer">
      <span class="muted small" id="wordCountLabel">0 words</span>
      <button class="btn btn-primary" id="submitWriting">Submit</button>
    </div>
  `));
  const textarea = document.getElementById("writingArea");
  const wcLabel = document.getElementById("wordCountLabel");
  textarea.addEventListener("input", () => {
    const wc = wordCount(textarea.value);
    wcLabel.textContent = `${wc} word${wc === 1 ? "" : "s"} (target ${prompt.wordTarget[0]}-${prompt.wordTarget[1]})`;
    paintWordBar(wc);
  });
  if (resume) { textarea.value = resume.text; textarea.dispatchEvent(new Event("input")); } else paintWordBar(0);
  // The Timed Exam never keeps a draft; practice does (js/drafts.js).
  let draft = null;
  if (!isExam) {
    let left = resume ? resume.timeLeftSec : prompt.timeLimitMin * 60;
    draft = Drafts.watch("writing", () => (textarea.value.trim() ? { promptId: prompt.id, text: textarea.value, timeLeftSec: left } : null));
    activeTimers.push(draft);
    textarea.addEventListener("input", () => draft.flush());
    var setLeft = r => { left = r; };
  }

  timer = Countdown(resume ? resume.timeLeftSec : prompt.timeLimitMin * 60,
    remaining => { if (draft) setLeft(remaining); paintTimer("timerDisplay", remaining, prompt.timeLimitMin * 60); },
    () => { timeUp = true; submit(); }
  );
  timer.start();

  document.getElementById("submitWriting").onclick = () => submit();

  function submit() {
    timer.stop();
    if (draft) draft.finish();   // handed in: no draft kept
    const text = textarea.value;
    showWritingChecklist(skill, prompt, text, isExam, onComplete);
  }
}

function renderSubscoreBars(subscores) {
  const labels = { vocabulary: "Vocabulary", readability: "Readability", structure: "Structure", coherence: "Coherence" };
  return Object.entries(subscores).map(([k, v]) => `
    <div class="subscore-row">
      <span class="subscore-label">${labels[k] || k}</span>
      <div class="subscore-bar"><div class="subscore-fill" style="width:${v}%"></div></div>
      <span class="subscore-val">${v}</span>
    </div>
  `).join("");
}

function showWritingChecklist(skill, prompt, text, isExam, onComplete) {
  const heuristic = analyzeText(text);

  app.innerHTML = "";
  app.appendChild(el(`
    <h2>Self-Assessment</h2>
    <p class="muted">The panel below is an automated <strong>heuristic</strong> estimate (free, local, objective metrics only) — it cannot judge whether your ideas make sense or your argument holds together, which is what real CELPIP raters assess. Use the checklist for that judgment call yourself.</p>
    <div class="grid-2">
      <div class="card">
        <h3>Your response</h3>
        <p class="muted small">${wordCount(text)} words</p>
        <div class="passage-text">${escapeHtml(text).replace(/\n/g, "<br>") || "<em>(empty)</em>"}</div>
      </div>
      <div class="card">
        <h3>Checklist (Task Fulfillment — you judge this)</h3>
        <form id="checklistForm">
          ${prompt.checklist.map((c, i) => `<label class="check-item"><input type="checkbox" name="c${i}"> ${escapeHtml(c)}</label>`).join("")}
        </form>
      </div>
    </div>
    <div class="card">
      <h3>Heuristic Analysis <span class="muted small">(automated, local)</span></h3>
      ${heuristic.insufficientData ? '<p class="muted">Too little text to analyze meaningfully.</p>' : `
        ${renderSubscoreBars(heuristic.subscores)}
        <p class="muted small mt">${heuristic.sentenceCount} sentences &middot; avg ${heuristic.avgSentenceLength} words/sentence${heuristic.fleschReadingEase !== null ? ` &middot; readability score ${heuristic.fleschReadingEase}` : ""}</p>
      `}
      <p class="muted small">Heuristic estimate: <strong>${heuristic.compositePct}%</strong> &rarr; CLB <strong>${heuristic.clb}</strong></p>
    </div>
    ${window.Study ? Study.modelHtml("writing", prompt) : ""}
    <div class="card">
      <h4>Final self-rating (estimated CLB)</h4>
      <input type="range" min="1" max="12" value="${heuristic.clb}" id="clbSlider">
      <div class="muted small">Selected: <strong id="clbSliderVal">${heuristic.clb}</strong> / 12 <span class="muted">(defaults to heuristic estimate — adjust if you disagree, or if you got AI feedback)</span></div>
    </div>
    <div class="run-footer">
      <button class="btn btn-primary" id="saveWriting">Save Result</button>
    </div>
  `));
  const slider = document.getElementById("clbSlider");
  slider.oninput = () => document.getElementById("clbSliderVal").textContent = slider.value;

  document.getElementById("saveWriting").onclick = () => {
    const form = document.getElementById("checklistForm");
    const checked = prompt.checklist.filter((c, i) => form.querySelector(`[name="c${i}"]`).checked).length;
    const selfClb = parseInt(slider.value);
    const result = {
      promptId: prompt.id, wordCount: wordCount(text), checklistScore: checked, checklistTotal: prompt.checklist.length,
      selfClb, text, heuristicClb: heuristic.clb, heuristicPct: heuristic.compositePct
    };
    if (isExam) { onComplete(result); return; }
    const attempt = Storage.saveAttempt({ type: "practice", skill: skill.id, mode: "writing", ...result, clb: selfClb });
    Shell.focusMode.exit();
    app.innerHTML = "";
    app.appendChild(el(`
      <div class="card result-card">
        <h1>Practice Saved</h1>
        <div class="big-score">${selfClb}</div>
        <p>Estimated CLB &middot; ${checked}/${prompt.checklist.length} checklist items met</p>
        <p class="muted">Saved on ${fmtDate(attempt.date)}.</p>
        <div class="cta-row-single">
          <a class="btn btn-primary" href="#/practice/writing">Practice Again</a>
          <a class="btn" href="#/history">View History</a>
        </div>
      </div>
    `));
  };
}

function runSpeakingTask(skill, prompt, isExam, onComplete) {
  Shell.focusMode.enter({ name: "Speaking practice", exam: isExam });
  const myScreen = screenId;  // this task's screen; see onScreen()
  app.innerHTML = "";
  app.appendChild(el(`
    <div class="run-header"><span class="tag">${prompt.task}</span></div>
    <div class="prompt-box">${escapeHtml(prompt.prompt).replace(/\n/g, "<br>")}</div>
    <div class="phase-box">
      <div class="phase-label" id="phaseLabel">Preparation</div>
      ${ringTimerHtml(prompt.prepSec)}
      <p class="muted small" id="phaseHint">Jot down 2-3 key points mentally. Speaking starts automatically when prep ends.</p>
      <div id="recIndicator" class="rec-indicator hidden">Recording...</div>
      <div id="micMeter" class="mic-meter hidden" role="img" aria-label="Microphone level: the bars move when the microphone hears you">${"<i></i>".repeat(24)}</div>
    </div>
    <div class="run-footer" id="skipRow">
      <button class="btn" id="skipPrep">Skip to Response</button>
    </div>
  `));

  let recordingUrl = null;
  document.getElementById("skipPrep").onclick = () => { prepTimer.stop(); startResponse(); };

  const prepTimer = Countdown(prompt.prepSec,
    r => { paintTimer("timerDisplay", r, prompt.prepSec); paintRing("ringFill", r, prompt.prepSec); },
    () => startResponse()
  );
  prepTimer.start();

  async function startResponse() {
    document.getElementById("phaseLabel").textContent = "Response";
    document.querySelector(".ring-wrap").classList.add("responding");
    paintRing("ringFill", prompt.responseSec, prompt.responseSec);
    document.getElementById("phaseHint").textContent = "Speak your answer out loud now.";
    document.getElementById("skipRow").innerHTML = `<button class="btn btn-primary" id="finishEarly">Finish Response</button>`;
    const recIndicator = document.getElementById("recIndicator");

    let recorderActive = false;
    try {
      await Recorder.start();
      if (!onScreen(myScreen)) { Recorder.cancel(); return; }  // you left while the microphone was starting
      recorderActive = true;
      recIndicator.classList.remove("hidden");
      MicMeter.start(Recorder.stream, document.getElementById("micMeter"));
    } catch (e) {
      recIndicator.classList.remove("hidden");
      recIndicator.textContent = "Mic unavailable — speak out loud; timer only (no recording).";
    }
    const transcribing = Storage.getSettings().speechToText ? Transcriber.start() : false;  // opt-in, see Transcriber

    document.getElementById("finishEarly").onclick = () => { respTimer.stop(); finish(recorderActive); };
    const respTimer = Countdown(prompt.responseSec,
      r => { paintTimer("timerDisplay", r, prompt.responseSec); paintRing("ringFill", r, prompt.responseSec); },
      () => finish(recorderActive)
    );
    respTimer.start();

    async function finish(wasRecording) {
      if (!onScreen(myScreen)) return;
      MicMeter.stop();
      if (wasRecording) { try { recordingUrl = await Recorder.stop(); } catch (e) { recordingUrl = null; } }
      let transcript = "";
      if (transcribing) { try { transcript = await Transcriber.stop(); } catch (e) { transcript = ""; } }
      if (onScreen(myScreen)) showSpeakingReview(transcript);
    }
  }

  function showSpeakingReview(transcript) {
    const heuristic = transcript && transcript.length > 0 ? analyzeText(transcript, { durationSec: prompt.responseSec }) : null;
    const defaultClb = heuristic && !heuristic.insufficientData ? heuristic.clb : 7;

    app.innerHTML = "";
    app.appendChild(el(`
      <h2>Self-Assessment</h2>
      <p class="muted">Listen back to your response if it was recorded, then rate yourself honestly.</p>
      <div class="grid-2">
        <div class="card">
          <h3>Your recording</h3>
          ${recordingUrl ? `<audio controls src="${recordingUrl}"></audio>` : `<p class="muted">No recording available for this attempt (microphone unavailable or skipped).</p>`}
          ${transcript ? `<h4 class="mt">Transcript (auto-generated, may contain errors)</h4><div class="passage-text">${escapeHtml(transcript)}</div>` : `<p class="muted small mt">${!Storage.getSettings().speechToText ? 'Transcripts are off. You can turn them on in <a href="#/settings">Settings</a>; this sends your spoken answer to an online speech service, so it is your choice.' : "No transcript available" + (Transcriber.supported ? " for this attempt." : ": this browser cannot turn speech into text.")}</p>`}
        </div>
        <div class="card">
          <h3>Self-rating (estimated CLB)</h3>
          <input type="range" min="1" max="12" value="${defaultClb}" id="clbSlider">
          <div class="muted small">Selected: <strong id="clbSliderVal">${defaultClb}</strong> / 12</div>
          <ul class="tips-list mt">
            <li>Did you address the full prompt?</li>
            <li>Did you speak for most/all of the response time?</li>
            <li>Was your speech organized with clear linking words?</li>
          </ul>
        </div>
      </div>
      ${heuristic && !heuristic.insufficientData ? `
        <div class="card">
          <h3>Heuristic Analysis <span class="muted small">(automated, local, based on transcript)</span></h3>
          ${renderSubscoreBars(heuristic.subscores)}
          <p class="muted small mt">${heuristic.wordCount} words &middot; ~${heuristic.wpm} words/min${heuristic.fillerCount ? ` &middot; ${heuristic.fillerCount} filler word(s) detected` : ""}</p>
          <p class="muted small">Heuristic estimate: <strong>${heuristic.compositePct}%</strong> &rarr; CLB <strong>${heuristic.clb}</strong></p>
        </div>
      ` : ""}
      ${window.Study ? Study.modelHtml("speaking", prompt) : ""}
      <div class="run-footer">
        <button class="btn btn-primary" id="saveSpeaking">Save Result</button>
      </div>
    `));
    const slider = document.getElementById("clbSlider");
    slider.oninput = () => document.getElementById("clbSliderVal").textContent = slider.value;

    document.getElementById("saveSpeaking").onclick = () => {
      const selfClb = parseInt(slider.value);
      const result = {
        promptId: prompt.id, selfClb, hasRecording: !!recordingUrl, hasTranscript: !!transcript,
        heuristicClb: heuristic && !heuristic.insufficientData ? heuristic.clb : null
      };
      if (isExam) { onComplete(result); return; }
      const attempt = Storage.saveAttempt({ type: "practice", skill: skill.id, mode: "speaking", ...result, clb: selfClb });
      Shell.focusMode.exit();
      app.innerHTML = "";
      app.appendChild(el(`
        <div class="card result-card">
          <h1>Practice Saved</h1>
          <div class="big-score">${selfClb}</div>
          <p>Estimated CLB</p>
          <p class="muted">Saved on ${fmtDate(attempt.date)}.</p>
          <div class="cta-row-single">
            <a class="btn btn-primary" href="#/practice/speaking">Practice Again</a>
            <a class="btn" href="#/history">View History</a>
          </div>
        </div>
      `));
    };
  }
}

// ================= TIMED EXAM =================
// Sample exactly one item per official part/task, mirroring the real exam's fixed structure —
// used for both the exam preview estimate and the actual run, so each attempt draws fresh content.
// Picks one random item for each numbered part, mirroring the real exam's fixed structure.
function sampleOnePerPart(pool, numParts) {
  return Array.from({ length: numParts }, (_, i) => sample(pool.filter(p => p.partNum === i + 1), 1)[0]).filter(Boolean);
}
function sampleOnePerSpeakingTask(pool) {
  return Array.from({ length: 8 }, (_, i) => sample(pool.filter(p => p.taskNum === i + 1), 1)[0]).filter(Boolean);
}
function sampleExamWriting(pool) {
  const email = sample(pool.filter(p => p.taskType === "email"), 1)[0];
  const survey = sample(pool.filter(p => p.taskType === "survey"), 1)[0];
  return [email, survey].filter(Boolean);
}

route("exam", (rest) => {
  if (rest[0] === "run") return startFullExam();
  const listeningParts = skillById("listening").overview.parts.length;   // from the always-loaded summary (T-032)
  const readingParts = skillById("reading").overview.parts.length;
  const speakingSample = sampleOnePerSpeakingTask(SPEAKING_DATA.prompts);
  const totalMin = Math.round(
    50 + // listening (official ~47-55 min)
    55 + // reading (official ~55-60 min)
    53 + // writing (27 + 26 min)
    speakingSample.reduce((a, p) => a + (p.prepSec + p.responseSec) / 60, 0)
  );
  app.appendChild(el(`
    <h1>Full Timed Exam</h1>
    <p class="muted">A single continuous simulation across all four skills, using real CELPIP-style timing and question counts (Listening: ${listeningParts} parts, Reading: ${readingParts} parts, Writing: 2 tasks, Speaking: 8 tasks). Content is randomly sampled from the full practice pool each time, so no two attempts are identical. Once started, sections auto-advance just like the real test. Estimated total time: <strong>~${totalMin} minutes</strong>.</p>
    <div class="grid-4">
      ${SKILLS.map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-name">${s.name}</div></div>`).join("")}
    </div>
    <div class="card">
      <h3>Before you start</h3>
      <ul class="tips-list">
        <li>Find a quiet space and, for Speaking, allow microphone access when prompted (optional — the timer still works without it).</li>
        <li>Sections play automatically. You cannot pause once a section begins, just like the real exam.</li>
        <li>Your final report is saved to History automatically when you finish.</li>
      </ul>
      <div class="cta-row-single"><a class="btn btn-primary" href="#/exam/run">Begin Full Exam</a></div>
    </div>
  `));
}, { needs: rest => (rest[0] === "run" ? Loader.ALL_PRACTICE : ["speaking"]), label: "Loading the exam" });   // T-032: the intro only samples Speaking prompts to add up the time; the run needs everything

function startFullExam() {
  const results = { listening: null, reading: null, writing: [], speaking: [] };
  const mcqSecs = { listening: [], reading: [] };  // seconds per question, one list per passage (goes into the attempt's timing)
  const examListening = sampleOnePerPart(LISTENING_DATA.passages, LISTENING_DATA.overview.parts.length);
  const examWriting = sampleExamWriting(WRITING_DATA.prompts);
  const examSpeaking = sampleOnePerSpeakingTask(SPEAKING_DATA.prompts);

  // Closing the tab or reloading asks first through this browser warning. Leaving with the Exit button asks through
  // the "Leave the exam?" box (Shell.focusMode.ask); both end up in render(), which switches this warning off again.
  window.onbeforeunload = () => "An exam is in progress. Leaving now will lose your progress.";
  Shell.focusMode.enter({ name: "Timed Exam", exam: true, back: "#/exam" });

  runListeningSection(0, { correct: 0, total: 0 });

  function runListeningSection(index, tally) {
    Shell.focusMode.setSection("Listening");   // the task bar shows "Timed Exam" over the part that is running
    if (index >= examListening.length) {
      results.listening = tally;
      return runReadingSection();
    }
    const passage = examListening[index];
    let phase = "preview";
    app.innerHTML = "";
    app.appendChild(el(`
      <div class="exam-banner">EXAM IN PROGRESS &middot; Listening &middot; Passage ${index + 1} of ${examListening.length}</div>
      <h2>${passage.title}</h2>
      <p class="tag">${passage.part}</p>
      <div id="examListeningBody"></div>
    `));
    renderPreview();

    function renderPreview() {
      const body = document.getElementById("examListeningBody");
      body.innerHTML = `
        <div class="phase-box">
          <div class="phase-label">Preview — read the questions</div>
          <div class="timer big" id="timerDisplay" role="timer">${fmtTime(12)}</div>
        </div>
        <div class="questions-preview">
          ${passage.questions.map((q, i) => `<p class="muted small">${i + 1}. ${escapeHtml(q.q)}</p>`).join("")}
        </div>
      `;
      Countdown(12, r => paintTimer("timerDisplay", r, 12), renderPlaying).start();
    }

    function renderPlaying() {
      const body = document.getElementById("examListeningBody");
      body.innerHTML = `
        <div class="phase-box">
          <div class="phase-label">Playing audio (once)</div>
          <div class="rec-indicator">Listen carefully...</div>
          ${listenBarHtml()}
        </div>
      `;
      const bar = ListenBar(document.getElementById("listenBar"), passage.script, SPEECH_RATE);
      activeTimers.push(bar);
      bar.start();
      let done = false;
      const myScreen = screenId;
      const fallbackMs = Math.max(6000, (passage.script.split(/\s+/).length / 2.2) * 1000 + 3000);
      const fallback = setTimeout(() => { if (!done && onScreen(myScreen)) { done = true; renderAnswering(); } }, fallbackMs);
      Speech.speak(passage.script, { rate: SPEECH_RATE, onprogress: ci => bar.boundary(ci), onend: () => { bar.end(); if (!done && onScreen(myScreen)) { done = true; clearTimeout(fallback); renderAnswering(); } } });
    }

    function renderAnswering() {
      const body = document.getElementById("examListeningBody");
      const answerTime = passage.questions.length * 20;
      body.innerHTML = `
        <div class="run-header"><span class="phase-label">Answer the questions</span><span class="answered muted small" id="answeredCount" aria-live="polite"></span><span class="timer" id="timerDisplay" role="timer">${fmtTime(answerTime)}</span></div>
        <form id="qForm">
          ${passage.questions.map((q, qi) => `
            <div class="question-block">
              <p class="q-text"><strong>${qi + 1}.</strong> ${escapeHtml(q.q)}</p>
              <div class="options">
                ${q.options.map((opt, oi) => `<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${escapeHtml(opt)}</span></label>`).join("")}
              </div>
            </div>
          `).join("")}
        </form>
        <div class="run-footer"><button class="btn btn-primary" id="nextBtn">Next Passage</button></div>
      `;
      // Dots (no flags or "This question" clock in the exam: realismOn() is true there) and time per question.
      const qs = { timer: QTimer(passage.questions.length), flags: [] };
      const qt = mountQuestionTools(document.getElementById("qForm"), qs, { aids: !realismOn(), header: body.querySelector(".run-header") });
      activeTimers.push(qt);
      watchAnswered(document.getElementById("qForm"), document.getElementById("answeredCount"), passage.questions.length, (n, names) => qt.sync(names));
      const timer = Countdown(answerTime, r => paintTimer("timerDisplay", r, answerTime), () => finishPassage());
      timer.start();
      document.getElementById("nextBtn").onclick = () => { timer.stop(); finishPassage(); };

      function finishPassage() {
        qt.stop();
        mcqSecs.listening.push(qs.timer.all());
        const form = document.getElementById("qForm");
        let correct = 0;
        const examAnswers = [];
        passage.questions.forEach((q, qi) => {
          const val = form.querySelector(`input[name="q${qi}"]:checked`);
          examAnswers.push(val ? parseInt(val.value) : null);
          if (val && parseInt(val.value) === q.answer) correct++;
        });
        if (window.Study) Study.recordMcq("listening", passage, examAnswers, "exam");
        tally.correct += correct;
        tally.total += passage.questions.length;
        runListeningSection(index + 1, tally);
      }
    }
  }

  function runReadingSection() {
    Shell.focusMode.setSection("Reading");
    const passages = sampleOnePerPart(READING_DATA.passages, READING_DATA.overview.parts.length);
    let activeIdx = 0;
    const allAnswers = passages.map(p => new Array(p.questions.length).fill(null));
    // Per passage, kept while you switch tabs: highlights and notes (PassageTools state), flags and the question clock.
    const tools = passages.map(p => ({ pt: PassageTools.newState(), qs: { timer: QTimer(p.questions.length), flags: new Array(p.questions.length).fill(false) } }));
    let activeQt = null;  // the dots/clock of the tab on screen
    const totalQ = passages.reduce((a, p) => a + p.questions.length, 0);
    const answeredIn = i => allAnswers[i].filter(a => a !== null).length;

    app.innerHTML = "";
    app.appendChild(el(`
      <div class="exam-banner">EXAM IN PROGRESS &middot; Reading &middot; ${passages.length} passages, one timer</div>
      <div class="run-header"><span class="answered muted small" id="answeredTotal" aria-live="polite"></span><span class="timer" id="timerDisplay" role="timer">${fmtTime(55 * 60)}</span></div>
      <div class="tabs" id="readingTabs">
        ${passages.map((p, i) => `<button class="tab-btn ${i === 0 ? "active" : ""}" data-i="${i}">${i + 1}. ${p.part.split(":")[0]} <span class="tab-count" id="tabCount${i}">0/${p.questions.length}</span></button>`).join("")}
      </div>
      <div id="readingBody"></div>
      <div class="run-footer"><button class="btn btn-primary" id="submitReading">Submit Reading Section</button></div>
    `));

    // Updates "12 of 38 answered" above the tabs and the small "3/11" on each tab.
    function paintCounts() {
      const done = passages.reduce((a, p, i) => a + answeredIn(i), 0);
      const total = document.getElementById("answeredTotal");
      total.textContent = `${done} of ${totalQ} answered`;
      total.classList.toggle("all-done", done === totalQ);
      passages.forEach((p, i) => { const c = document.getElementById("tabCount" + i); c.textContent = `${answeredIn(i)}/${p.questions.length}`; c.classList.toggle("all-done", answeredIn(i) === p.questions.length); });
    }

    function renderActive() {
      if (activeQt) { activeQt.stop(); }  // the tab we are leaving stops counting (its seconds are kept)
      const p = passages[activeIdx];
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", parseInt(b.dataset.i) === activeIdx));
      document.getElementById("readingBody").innerHTML = `
        <h2>${p.title}</h2>
        <div class="split">
          <div class="split-passage" tabindex="0" role="region" aria-label="Passage">${PassageTools.barHtml()}<div class="passage-text">${escapeHtml(p.text).replace(/\n/g, "<br>")}</div></div>
          <div class="split-questions"><form id="qForm">
          ${p.questions.map((q, qi) => `
            <div class="question-block">
              <p class="q-text"><strong>${qi + 1}.</strong> ${escapeHtml(q.q)}</p>
              <div class="options">
                ${q.options.map((opt, oi) => `<label class="option"><input type="radio" name="q${qi}" value="${oi}" ${allAnswers[activeIdx][qi] === oi ? "checked" : ""}><span>${escapeHtml(opt)}</span></label>`).join("")}
              </div>
            </div>
          `).join("")}
          </form></div>
        </div>
      `;
      const idx = activeIdx;
      const qt = mountQuestionTools(document.getElementById("qForm"), tools[idx].qs, { aids: !realismOn(), header: document.querySelector(".run-header") });
      activeQt = qt; activeTimers.push(qt);
      const names = () => new Set(allAnswers[idx].map((a, i) => a !== null ? "q" + i : null).filter(Boolean));
      qt.sync(names());
      document.getElementById("qForm").addEventListener("change", e => {
        const match = e.target.name.match(/^q(\d+)$/);
        if (match) allAnswers[idx][parseInt(match[1])] = parseInt(e.target.value);
        paintCounts();
        qt.sync(names());
      });
      // The passage's marks and notes live in tools[idx].pt, so switching tabs and coming back keeps them.
      PassageTools.attach(document.querySelector("#readingBody .split-passage"), tools[idx].pt);
    }
    document.querySelectorAll(".tab-btn").forEach(b => b.onclick = () => { activeIdx = parseInt(b.dataset.i); renderActive(); });
    renderActive();
    paintCounts();

    const timer = Countdown(55 * 60, r => paintTimer("timerDisplay", r, 55 * 60), () => submit());
    timer.start();
    document.getElementById("submitReading").onclick = () => { timer.stop(); submit(); };

    function submit() {
      if (activeQt) activeQt.stop();
      tools.forEach(t => mcqSecs.reading.push(t.qs.timer.all()));
      let correct = 0, total = 0;
      passages.forEach((p, pi) => {
        total += p.questions.length;
        p.questions.forEach((q, qi) => { if (allAnswers[pi][qi] === q.answer) correct++; });
        if (window.Study) Study.recordMcq("reading", p, allAnswers[pi], "exam");
      });
      results.reading = { correct, total };
      runWritingSection(0);
    }
  }

  function runWritingSection(index) {
    Shell.focusMode.setSection("Writing");
    if (index >= examWriting.length) return runSpeakingSection(0);
    runWritingTask(skillById("writing"), examWriting[index], true, (result) => {
      results.writing.push(result);
      runWritingSection(index + 1);
    });
    prependExamBanner(`Writing &middot; Task ${index + 1} of ${examWriting.length}`);
  }

  function runSpeakingSection(index) {
    Shell.focusMode.setSection("Speaking");
    if (index >= examSpeaking.length) return finishExam();
    runSpeakingTask(skillById("speaking"), examSpeaking[index], true, (result) => {
      results.speaking.push(result);
      runSpeakingSection(index + 1);
    });
    prependExamBanner(`Speaking &middot; Task ${index + 1} of ${examSpeaking.length}`);
  }

  function prependExamBanner(text) {
    const banner = el(`<div class="exam-banner">EXAM IN PROGRESS &middot; ${text}</div>`);
    app.prepend(banner);
  }

  function finishExam() {
    window.onbeforeunload = null;
    Shell.focusMode.exit();
    const listeningPct = results.listening.total ? Math.round((results.listening.correct / results.listening.total) * 100) : 0;
    const readingPct = results.reading.total ? Math.round((results.reading.correct / results.reading.total) * 100) : 0;
    const writingClb = Math.round(results.writing.reduce((a, r) => a + r.selfClb, 0) / (results.writing.length || 1));
    const speakingClb = Math.round(results.speaking.reduce((a, r) => a + r.selfClb, 0) / (results.speaking.length || 1));
    const breakdown = {
      listening: { pct: listeningPct, clb: clbFromPercent(listeningPct), correct: results.listening.correct, total: results.listening.total },
      reading: { pct: readingPct, clb: clbFromPercent(readingPct), correct: results.reading.correct, total: results.reading.total },
      writing: { clb: writingClb, tasks: results.writing.length },
      speaking: { clb: speakingClb, tasks: results.speaking.length }
    };
    const overall = Math.round((breakdown.listening.clb + breakdown.reading.clb + breakdown.writing.clb + breakdown.speaking.clb) / 4);
    // timing covers the multiple-choice sections only (Listening passages, then Reading passages): seconds per question.
    const attempt = Storage.saveAttempt({ type: "exam", breakdown, overall, timing: buildTiming([...mcqSecs.listening, ...mcqSecs.reading]) });

    app.innerHTML = "";
    app.appendChild(el(`
      <div class="card result-card">
        <h1>Exam Complete</h1>
        <div class="big-score">${overall}</div>
        <p>Estimated overall CLB level</p>
        <div class="grid-4 mt">
          ${SKILLS.map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-name">${s.name}</div><div class="stat-value">${breakdown[s.id].clb}</div></div>`).join("")}
        </div>
        <p class="muted mt">Saved to your history on ${fmtDate(attempt.date)}.</p>
        <div class="cta-row-single">
          <a class="btn btn-primary" href="#/history">View Full History</a>
          <a class="btn" href="#/dashboard">Back to Home</a>
        </div>
      </div>
    `));
  }
}
// render() is called at the end of js/study.js, after every screen is registered.
