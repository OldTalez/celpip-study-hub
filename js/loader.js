/*
LEARNING NOTE (T-032): the data loader. The practice material (passages, questions, explanations, model answers, words, grammar,
lessons) is about 1 MB of script files. Loading all of it before the first screen made the first visit heavy, so index.html no
longer lists those files. Instead each screen says what it needs and this file fetches only that.

How to use it:  Loader.needData(["reading", "explanations"]).then(() => draw the screen)
- needData returns a Promise. It adds a <script> tag for each file that is not loaded yet, in the right order, and settles when all
  of them have run. Asking twice for the same thing never loads a file twice ("dedupe"): a file already loading hands back the
  same Promise.
- If a file cannot be fetched (no connection and not saved offline yet) the Promise rejects with an Error whose message is
  plain English. The failed file is forgotten, so asking again (the Retry button) tries again.
- Loader.isLoaded(names) answers yes or no at once, so a screen whose data is already here is drawn without waiting.

Safety rule: script addresses come ONLY from the two tables below (FILES and BUNDLES), which are fixed in this file. A name that is
not in BUNDLES is refused. Nothing from the page address (the part after #) or from saved data ever becomes a script address.

Offline: sw.js still saves every one of these files when the app is first opened from a website, and answers script requests
from that saved copy when there is no connection, so loading on demand works offline too.

The table of bundles (one bundle = one name you can ask for):
  name          files (in the order they must run)                                          global names they define
  listening     listening_pool_1, _2, _3, then listening.js                                  LISTENING_PART1..6, LISTENING_DATA
  reading       reading_pool_1, _2, then reading.js                                          READING_PART1..4, READING_DATA
  writing       writing_speaking_pool, then writing.js                                       WRITING_POOL, WRITING_DATA
  speaking      writing_speaking_pool (shared with writing, loaded once), then speaking.js   SPEAKING_POOL, SPEAKING_DATA
  explanations  new/explanations.js                                                          CELPIP_EXPL (answer explanations)
  wmodels       new/writing_models.js                                                        CELPIP_WMODEL
  smodels       new/speaking_models.js                                                       CELPIP_SMODEL
  vocab         new/vocab.js                                                                 CELPIP_VOCAB
  grammar       new/grammar.js                                                               CELPIP_GRAMMAR
  lessons       new/lessons.js                                                               CELPIP_LESSONS
The small always-loaded summary is js/data/meta.js (CELPIP_META), see tools/build-meta.js.
*/
const Loader = (function () {
  "use strict";
  const D = "js/data/";
  // Every file this loader may ever add, with the files that must have run before it ("after"). A "gatherer" (listening.js and
  // friends) joins the pool lists together when it runs, so its pools come first.
  const FILES = {
    listening_pool_1: { src: D + "listening_pool_1.js" },
    listening_pool_2: { src: D + "listening_pool_2.js" },
    listening_pool_3: { src: D + "listening_pool_3.js" },
    reading_pool_1: { src: D + "reading_pool_1.js" },
    reading_pool_2: { src: D + "reading_pool_2.js" },
    writing_speaking_pool: { src: D + "writing_speaking_pool.js" },
    listening: { src: D + "listening.js", after: ["listening_pool_1", "listening_pool_2", "listening_pool_3"] },
    reading: { src: D + "reading.js", after: ["reading_pool_1", "reading_pool_2"] },
    writing: { src: D + "writing.js", after: ["writing_speaking_pool"] },
    speaking: { src: D + "speaking.js", after: ["writing_speaking_pool"] },
    explanations: { src: D + "new/explanations.js" },
    wmodels: { src: D + "new/writing_models.js" },
    smodels: { src: D + "new/speaking_models.js" },
    vocab: { src: D + "new/vocab.js" },
    grammar: { src: D + "new/grammar.js" },
    lessons: { src: D + "new/lessons.js" }
  };
  // What a name you can ask for means. Today each bundle is one gatherer file (its pools come from "after").
  const BUNDLES = {
    listening: ["listening"], reading: ["reading"], writing: ["writing"], speaking: ["speaking"],
    explanations: ["explanations"], wmodels: ["wmodels"], smodels: ["smodels"],
    vocab: ["vocab"], grammar: ["grammar"], lessons: ["lessons"]
  };
  // What each skill's practice needs: the passages or prompts, plus the model answers for Writing and Speaking. The Listening and Reading explanations are NOT here: app.js loads them when answers are checked (fillExplanations).
  const SKILL_NEEDS = {
    listening: ["listening"], reading: ["reading"],
    writing: ["writing", "wmodels"], speaking: ["speaking", "smodels"]
  };
  // The full exam. No explanations: the exam never shows them. (Practice loads them when you check answers; Review loads them itself.)
  const ALL_PRACTICE = ["listening", "reading", "writing", "speaking", "wmodels", "smodels"];

  const done = new Set();      // file keys that have run
  const inFlight = new Map();  // file key -> Promise, while loading

  function inject(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;   // always a fixed string from FILES above
      s.onload = () => resolve();
      s.onerror = () => { s.remove(); reject(new Error("Could not load " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadFile(key) {
    if (done.has(key)) return Promise.resolve();
    if (inFlight.has(key)) return inFlight.get(key);
    const f = FILES[key];
    const p = Promise.all((f.after || []).map(loadFile)).then(() => inject(f.src)).then(
      () => { done.add(key); inFlight.delete(key); },
      err => { inFlight.delete(key); throw err; });   // forget the failure so Retry tries again
    inFlight.set(key, p);
    return p;
  }
  function keysFor(names) {
    const keys = [];
    (names || []).forEach(n => {
      if (typeof n !== "string" || !Object.hasOwn(BUNDLES, n)) throw new Error("Unknown data bundle: " + String(n).slice(0, 40));
      BUNDLES[n].forEach(k => { if (!keys.includes(k)) keys.push(k); });
    });
    return keys;
  }
  function filesFor(key) { return [key].concat((FILES[key].after || []).flatMap(filesFor)); }
  function isLoaded(names) {
    return keysFor(names).every(k => filesFor(k).every(f => done.has(f)));
  }
  function needData(names) {
    let keys;
    try { keys = keysFor(names); } catch (e) { return Promise.reject(e); }
    return Promise.all(keys.map(loadFile)).then(() => undefined, err => {
      const e = new Error("The practice material could not be loaded. " + (navigator.onLine === false ? "You look offline, and this part has not been saved on this device yet." : "Check your connection."));
      e.cause = err; e.loadFailed = true;
      throw e;
    });
  }
  return { needData, isLoaded, SKILL_NEEDS, ALL_PRACTICE, files: () => Object.keys(FILES).map(k => FILES[k].src) };
})();
