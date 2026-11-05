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
    history.push(attempt);
    write(HISTORY_KEY, history);
    return attempt;
  }

  function deleteAttempt(id) { write(HISTORY_KEY, getHistory().filter(a => a.id !== id)); }
  function clearHistory() { try { localStorage.removeItem(HISTORY_KEY); } catch (e) {} }

  // Defaults first, then whatever was saved over the top (Object.assign merges them).
  function getSettings() {
    const defaults = { targetCLB: 9, name: "", hoursPerWeek: 8, examDate: "", sessionMin: 75, speechToText: false }; // speechToText: opt-in, sends audio to an online service
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
  function importAll(obj) {
    if (!obj || typeof obj !== "object") return false;
    if (Array.isArray(obj.history)) write(HISTORY_KEY, obj.history);
    if (obj.settings && typeof obj.settings === "object") { delete obj.settings.apiKey; write(SETTINGS_KEY, obj.settings); }
    Object.keys(KEYS).forEach(k => { if (obj[k] !== undefined && obj[k] !== null) set(k, obj[k]); });
    return true;
  }
  function resetAll() {
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }

  return { getHistory, saveAttempt, deleteAttempt, clearHistory, getSettings, saveSettings, get, set, exportAll, importAll, resetAll };
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
