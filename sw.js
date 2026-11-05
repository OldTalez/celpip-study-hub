/* LEARNING NOTE: the offline helper ("service worker") for the online copy of the app. The browser runs it beside the
   page. On the first visit it saves every file the app needs; after that, each file is fetched fresh when there is a
   connection (so updates arrive) and taken from the saved copy when there isn't (so the app works on a plane).
   It only runs when the app is opened from a website (https), not when index.html is opened as a file.
   When a file is added to the app, add it to FILES too, and change CACHE's version number so phones fetch the list again.
   v3 (T-029 turn A, 2026-11-05): added js/shell.js and the three font files in fonts/ (the new look works offline).
   v4 (T-029 turn B, 2026-11-05): added js/tools.js (question dots, notes, toasts, progress bars).
   v5 (T-030 turn 1, 2026-11-05): added js/prescription.js (the My plan engine).
   v6 (T-030 turn 2, 2026-11-05): added js/calendar.js (the .ics calendar file builder). */
const CACHE = "celpip-v6";
const FILES = [
  "./", "index.html", "css/style.css", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "js/shell.js", "js/storage.js", "js/prescription.js", "js/calendar.js", "js/scoring.js", "js/tools.js", "js/app.js", "js/study.js",
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
