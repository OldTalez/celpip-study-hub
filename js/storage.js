// Local persistence for attempt history, settings and study data. Everything lives in the browser (localStorage).
// LEARNING NOTE (for beginners): this file is the app's memory.
// localStorage is a small box of text that the browser keeps for this website, even after you close it.
// Values are saved as JSON text (JSON.stringify) and read back (JSON.parse).
// "(() => { ... })()" is a function that runs immediately and returns only the helpers listed at the bottom,
// so the key names below stay private.
// The "_v1" in the key names lets a future version change the format without colliding with old saved data.
// v2 keeps the SAME history and settings keys as version 1, so anything saved by the old app still works here.
const Storage = (() => {
  const HISTORY_KEY = "celpip_history_v1";
  const SETTINGS_KEY = "celpip_settings_v1";

  // A tiny helper pair so every store reads and writes the same safe way.
  // try/catch: localStorage can be blocked (private window) or hold broken text; we fall back to a default.
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  // v1 stored an optional AI-grading key in plain text inside the settings. v2 removed that feature, so on load
  // we erase any key that an earlier version left behind. (Plain-text keys in a browser are a security risk.)
  (function removeOldApiKey() {
    const s = read(SETTINGS_KEY, null);
    if (s && Object.prototype.hasOwnProperty.call(s, "apiKey")) {
      delete s.apiKey;
      write(SETTINGS_KEY, s);
    }
  })();

  function getHistory() { return read(HISTORY_KEY, []); }

  function saveAttempt(attempt) {
    const history = getHistory();
    attempt.id = "a_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    attempt.date = new Date().toISOString();
    // If the learner started a diagnostic for this skill, mark the attempt so the plan can use it.
    if (window.Study && Study.takeDiagnosticFlag && Study.takeDiagnosticFlag(attempt.skill)) attempt.diagnostic = true;
    // Reading and Listening attempts also carry attempt.timing = { totalSec, perQuestionSec, perPassageSec } (see js/tools.js).
    history.push(attempt);
    write(HISTORY_KEY, history);
    return attempt;
  }

  function deleteAttempt(id) { write(HISTORY_KEY, getHistory().filter(a => a.id !== id)); }
  function clearHistory() { try { localStorage.removeItem(HISTORY_KEY); } catch (e) {} }

  // Defaults first, then whatever was saved over the top (Object.assign merges them).
  function getSettings() {
    const defaults = { targetCLB: 9, name: "", hoursPerWeek: 8, examDate: "", sessionMin: 75, speechToText: false, examRealism: false }; // speechToText: opt-in, sends audio to an online service; examRealism: hide highlighter, notes and flags in Practice
    return Object.assign({}, defaults, read(SETTINGS_KEY, {}));
  }
  function saveSettings(settings) { write(SETTINGS_KEY, settings); }

  // ----- v2 study stores. Each one is a plain object or list kept under its own key. -----
  const KEYS = {
    mistakes: "celpip_mistakes_v1",   // questions answered wrongly, with their review schedule (spaced review)
    partStats: "celpip_partstats_v1", // right/total per skill and part, for the weak-spot view
    vocab: "celpip_vocab_v1",         // word cards: box (how well known) and the next due date
    grammar: "celpip_grammar_v1",     // best score per grammar topic
    log: "celpip_log_v1"              // the study log: date, minutes, skill, notes
  };
  function get(name, fallback) { return read(KEYS[name], fallback); }
  function set(name, value) { return write(KEYS[name], value); }

  // Everything the learner owns, for backup/export and for a full reset.
  function exportAll() {
    const out = { exportedAt: new Date().toISOString(), history: getHistory(), settings: getSettings() };
    Object.keys(KEYS).forEach(k => { out[k] = get(k, null); });
    return out;
  }
  // LEARNING NOTE: a backup file is typed-in data we do not control, and screens print some of its values into the page.
  // So on import we force numbers to be numbers inside a sensible range, accept only ids that look like the ones we make
  // ("a_" + digits + "_" + letters/digits), and drop any history entry that is missing what the History screen needs.
  const SKILL_IDS = ["listening", "reading", "writing", "speaking"];
  function num(v, lo, hi, fallback) { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback; }
  function cleanAttempt(h) {
    if (!h || typeof h !== "object" || !/^a_\d{1,16}_[a-z0-9]{1,12}$/.test(String(h.id))) return null;
    if (h.type !== "practice" && h.type !== "exam") return null;
    if (isNaN(new Date(h.date))) return null;
    const out = Object.assign({}, h);
    ["pct", "clb", "overall", "correct", "total", "checklistScore", "checklistTotal"].forEach(k => {
      if (out[k] !== undefined) { const n = num(out[k], 0, 1000, null); if (n === null) delete out[k]; else out[k] = n; }
    });
    if (h.type === "practice") { if (!SKILL_IDS.includes(h.skill)) return null; out.clb = h.clb === undefined || h.clb === null ? null : num(h.clb, 0, 12, null); } // a missing level stays null ("no score"), never 0
    if (h.type === "exam") {
      if (!h.breakdown || typeof h.breakdown !== "object") return null;
      out.breakdown = {};
      for (const id of SKILL_IDS) { if (!h.breakdown[id]) return null; out.breakdown[id] = Object.assign({}, h.breakdown[id], { clb: h.breakdown[id].clb === undefined || h.breakdown[id].clb === null ? null : num(h.breakdown[id].clb, 0, 12, null) }); }
      out.overall = h.overall === undefined || h.overall === null ? null : num(h.overall, 0, 12, null);
    }
    return out;
  }
  function cleanSettings(st) {
    const out = Object.assign({}, st);
    delete out.apiKey;
    if (out.targetCLB !== undefined) out.targetCLB = num(out.targetCLB, 4, 12, 9);
    if (out.hoursPerWeek !== undefined) out.hoursPerWeek = num(out.hoursPerWeek, 2, 30, 8);
    if (out.sessionMin !== undefined) out.sessionMin = num(out.sessionMin, 20, 240, 75);
    return out;
  }
  // The other stores (turn C, after Inyene's review): each is rebuilt entry by entry from known shapes. An entry that does not
  // fit is skipped and counted, so the Settings screen can say how many were left out.
  const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/, DAY = /^\d{4}-\d{2}-\d{2}$/;
  let skipped = 0;
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  function cleanMap(src, keyOk, valueFn) {
    const out = {};
    if (!isObj(src)) return out;
    for (const k of Object.keys(src)) {
      const v = keyOk.test(k) ? valueFn(src[k]) : null;
      if (v === null || v === undefined) skipped++; else out[k] = v;
    }
    return out;
  }
  const cleanPartStats = src => cleanMap(src, /^(listening|reading)\|[1-9]$/, v => {
    if (!isObj(v)) return null;
    const total = num(v.total, 0, 100000, null), right = num(v.right, 0, 100000, null);
    return total === null || right === null || right > total ? null : { right, total };
  });
  const cleanMistakes = src => cleanMap(src, /^[a-z]+\|[A-Za-z0-9_-]{1,60}\|\d{1,3}$/, v => {
    if (!isObj(v) || !SKILL_IDS.includes(v.skill) || !SAFE_ID.test(String(v.pid)) || !DAY.test(String(v.due))) return null;
    return { skill: v.skill, pid: String(v.pid), qi: num(v.qi, 0, 200, 0), part: num(v.part, 1, 9, 1), box: num(v.box, 0, 6, 0), due: v.due, wrong: num(v.wrong, 0, 1000, 1) };
  });
  const cleanVocab = src => cleanMap(src, SAFE_ID, v => (isObj(v) && DAY.test(String(v.due)) ? { box: num(v.box, 0, 6, 0), due: v.due } : null));
  const cleanGrammar = src => cleanMap(src, SAFE_ID, v => num(v, 0, 100, null));
  function cleanLog(src) {
    if (!Array.isArray(src)) return [];
    const text = v => (typeof v === "string" ? v.slice(0, 2000) : "");
    return src.map(e => {
      if (!isObj(e) || !/^n_\d{1,16}$/.test(String(e.id)) || !DAY.test(String(e.date))) { skipped++; return null; }
      return { id: e.id, date: e.date, minutes: num(e.minutes, 0, 1000, 0), skill: text(e.skill).slice(0, 40), learned: text(e.learned), unclear: text(e.unclear), next: text(e.next) };
    }).filter(Boolean);
  }
  const CLEANERS = { partStats: cleanPartStats, mistakes: cleanMistakes, vocab: cleanVocab, grammar: cleanGrammar, log: cleanLog };
  function importAll(obj) {
    skipped = 0;
    if (!obj || typeof obj !== "object") return false;
    if (Array.isArray(obj.history)) { const kept = obj.history.map(cleanAttempt).filter(Boolean); skipped += obj.history.length - kept.length; write(HISTORY_KEY, kept); }
    if (obj.settings && typeof obj.settings === "object") write(SETTINGS_KEY, cleanSettings(obj.settings));
    Object.keys(KEYS).forEach(k => { if (obj[k] !== undefined && obj[k] !== null) set(k, CLEANERS[k] ? CLEANERS[k](obj[k]) : obj[k]); });
    return true;
  }
  function importSkipped() { return skipped; } // how many entries the last import left out
  function resetAll() {
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }

  return { getHistory, saveAttempt, deleteAttempt, clearHistory, getSettings, saveSettings, get, set, exportAll, importAll, importSkipped, resetAll };
})();

// Unofficial CLB estimate from a raw percentage score. For self-study orientation only.
// CLB = Canadian Language Benchmark, the 1-12 scale CELPIP reports. This turns a percentage
// into a rough level by comparing against cut-offs, highest first.
function clbFromPercent(pct) {
  if (pct >= 95) return 12;
  if (pct >= 90) return 11;
  if (pct >= 85) return 10;
  if (pct >= 78) return 9;
  if (pct >= 70) return 8;
  if (pct >= 62) return 7;
  if (pct >= 54) return 6;
  if (pct >= 46) return 5;
  if (pct >= 38) return 4;
  if (pct >= 28) return 3;
  return 2;
}
