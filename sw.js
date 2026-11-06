/* LEARNING NOTE: the offline helper ("service worker") for the online copy of the app. The browser runs it beside the
   page. On the first visit it saves every file the app needs; after that, each file is fetched fresh when there is a
   connection (so updates arrive) and taken from the saved copy when there isn't (so the app works on a plane).
   It only runs when the app is opened from a website (https), not when index.html is opened as a file.
   When a file is added to the app, add it to FILES too, and change CACHE's version number so phones fetch the list again.
   v3 (T-029 turn A, 2026-11-05): added js/shell.js and the three font files in fonts/ (the new look works offline).
   v4 (T-029 turn B, 2026-11-05): added js/tools.js (question dots, notes, toasts, progress bars).
   v5 (T-030 turn 1, 2026-11-05): added js/prescription.js (the My plan engine).
   v6 (T-030 turn 2, 2026-11-05): added js/calendar.js (the .ics calendar file builder).
   v7 (T-031 turn A, 2026-11-05): added js/appfeel.js (install button, update notice, offline label, storage safety, badge) and the new teal icons.
   v8 (T-031 turn B, 2026-11-05): added js/shortcuts.js (keyboard shortcuts, tap buzz); js/profiles.js and js/profile-ui.js (learner profiles), js/transfer.js (share file, QR transfer), and the two QR libraries in js/vendor/ (qrcode.js to show codes, jsQR.js to read them where the browser has no BarcodeDetector).
   v9 (T-031 turn C, 2026-11-05): added js/drafts.js (practice drafts).
   v10 (T-032, 2026-11-05): added js/loader.js and js/data/meta.js. The big practice data files are no longer in index.html (js/loader.js adds them when a screen needs them), but they stay in FILES below, so they are all saved on the first visit and every route still works offline.
   v13 (T-033 B2b, 2026-11-05): added js/pagewipe.js (the circle wipe page change).
   v15 (T-035, 2026-11-06): the phone top bar plays its idle logo (js/shell.js, css/style.css); no new files.
   When a new version takes over, the page hears "controllerchange" and offers a Refresh button; it never reloads by itself. */
const CACHE = "celpip-v15";
const FILES = [
  "./", "index.html", "css/style.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon-180.png", "favicon.svg",
  "js/shell.js", "js/pagewipe.js", "js/loader.js", "js/data/meta.js", "js/storage.js", "js/prescription.js", "js/calendar.js", "js/appfeel.js", "js/shortcuts.js", "js/profiles.js", "js/profile-ui.js", "js/transfer.js", "js/vendor/qrcode.js", "js/vendor/jsQR.js", "js/vendor/jsQR-LICENSE.txt", "js/drafts.js", "js/scoring.js", "js/tools.js", "js/app.js", "js/study.js",
  "fonts/PlusJakartaSans-latin.woff2", "fonts/AtkinsonHyperlegible-Regular-latin.woff2", "fonts/AtkinsonHyperlegible-Bold-latin.woff2", "fonts/OFL.txt",
  "js/data/listening.js", "js/data/listening_pool_1.js", "js/data/listening_pool_2.js", "js/data/listening_pool_3.js",
  "js/data/reading.js", "js/data/reading_pool_1.js", "js/data/reading_pool_2.js",
  "js/data/writing.js", "js/data/speaking.js", "js/data/writing_speaking_pool.js",
  "js/data/new/explanations.js", "js/data/new/grammar.js", "js/data/new/lessons.js",
  "js/data/new/speaking_models.js", "js/data/new/vocab.js", "js/data/new/writing_models.js"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const key = url.origin + url.pathname; // saved without "?…", so a refresh still finds it offline
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return r; })
    .catch(() => caches.match(key).then(r => r || (e.request.mode === "navigate" ? caches.match(new URL("index.html", location).href) : undefined))));
});
