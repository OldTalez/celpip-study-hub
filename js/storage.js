// Local persistence for attempt history, settings and study data. Everything lives in the browser (localStorage).
// LEARNING NOTE (for beginners): this file is the app's memory.
// localStorage is a small box of text that the browser keeps for this website, even after you close it.
// Values are saved as JSON text (JSON.stringify) and read back (JSON.parse).
// "(() => { ... })()" is a function that runs immediately and returns only the helpers listed at the bottom,
// so the key names below stay private.
// The "_v1" in the key names lets a future version change the format without colliding with old saved data.
// v2 keeps the SAME history and settings keys as version 1, so anything saved by the old app still works here.
const Storage = (() => {
  // LEARNING NOTE (T-031 turn B): several learners can share one device. These two names are the OLD fixed labels; the real label
  // in localStorage now carries the active learner's id, which js/profiles.js adds (Profiles.key). The label is worked out at the
  // moment of each read or write (that is why these are small functions), so switching profile changes where everything goes.
  const HISTORY_KEY_NAME = "celpip_history_v1", SETTINGS_KEY_NAME = "celpip_settings_v1";
  const histKey = () => Profiles.key(HISTORY_KEY_NAME);
  const setKey = () => Profiles.key(SETTINGS_KEY_NAME);

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
    const s = read(setKey(), null);
    if (s && Object.prototype.hasOwnProperty.call(s, "apiKey")) {
      delete s.apiKey;
      write(setKey(), s);
    }
  })();

  function getHistory() { return read(histKey(), []); }

  function saveAttempt(attempt) {
    const history = getHistory();
    attempt.id = "a_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    attempt.date = new Date().toISOString();
    // If the learner started a diagnostic for this skill, mark the attempt so the plan can use it.
    if (window.Study && Study.takeDiagnosticFlag && Study.takeDiagnosticFlag(attempt.skill)) attempt.diagnostic = true;
    // Reading and Listening attempts also carry attempt.timing = { totalSec, perQuestionSec, perPassageSec } (see js/tools.js).
    history.push(attempt);
    write(histKey(), history);
    return attempt;
  }

  function deleteAttempt(id) { write(histKey(), getHistory().filter(a => a.id !== id)); }
  function clearHistory() { try { localStorage.removeItem(histKey()); } catch (e) {} }

  // Defaults first, then whatever was saved over the top (Object.assign merges them).
  function getSettings() {
    const defaults = { targetCLB: 9, name: "", hoursPerWeek: 8, examDate: "", sessionMin: 75, speechToText: false, examRealism: false, studyDays: [], studyTime: "", studyTimes: {}, vibrate: true }; // studyDays: preferred weekdays (0 = Sunday ... 6 = Saturday); studyTime: preferred time "HH:MM" or "" (T-030); speechToText: opt-in, sends audio to an online service; examRealism: hide highlighter, notes and flags in Practice
    return Object.assign({}, defaults, read(setKey(), {}));
  }
  function saveSettings(settings) { write(setKey(), settings); }

  // ----- v2 study stores. Each one is a plain object or list kept under its own key. -----
  const KEYS = {
    mistakes: "celpip_mistakes_v1",   // questions answered wrongly, with their review schedule (spaced review)
    partStats: "celpip_partstats_v1", // right/total per skill and part, for the weak-spot view
    vocab: "celpip_vocab_v1",         // word cards: box (how well known) and the next due date
    grammar: "celpip_grammar_v1",     // best score per grammar topic
    log: "celpip_log_v1",             // the study log: date, minutes, skill, notes
    navLayout: "celpip_navlayout_v1", // the Arrange menu layout (T-033 B2a): { v: 1, order: [11 page ids], bar: [4 page ids] }; checked by NavLayout.validate on read and on import
    studyTime: "celpip_studytime_v1"  // minutes studied: { days: { "2026-11-05": { reading: 12.5, general: 20 } }, manual: [ added-by-hand entries ] } (T-030)
  };
  // The layout has its own checked reader and writer in NavLayout: going around them would let an unchecked value in (or out), so route there.
  function get(name, fallback) { if (name === "navLayout") return NavLayout.stored() || fallback; return read(Profiles.key(KEYS[name]), fallback); }
  function set(name, value) { if (name === "navLayout") return NavLayout.save(value); return write(Profiles.key(KEYS[name]), value); }

  // Everything the learner owns, for backup/export and for a full reset.
  function exportAll() {
    const out = { exportedAt: new Date().toISOString(), profileName: Profiles.active().name, history: getHistory(), settings: getSettings() };
    Object.keys(KEYS).forEach(k => { out[k] = get(k, null); });
    out.navLayout = NavLayout.stored();   // never export a value that would not pass the check: a hand-edited note is left out, so the default applies
    return out;
  }
  // LEARNING NOTE: a backup file is typed-in data we do not control, and screens print some of its values into the page.
  // So on import we force numbers to be numbers inside a sensible range, accept only ids that look like the ones we make
  // ("a_" + digits + "_" + letters/digits), and drop any history entry that is missing what the History screen needs.
  const SKILL_IDS = ["listening", "reading", "writing", "speaking"];
  function num(v, lo, hi, fallback) { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback; }
  // Copies a parsed object's own fields but leaves out "__proto__", "constructor" and "prototype", so a crafted file cannot use those names
  // to change how the copy behaves (Object.assign would run the __proto__ setter). Used by every cleaner that keeps unknown fields.
  const SAFE_FIELD = /^[A-Za-z][A-Za-z0-9_]{0,40}$/;
  function plain(src) { const o = {}; for (const k of Object.keys(src)) { if (k !== "__proto__" && k !== "constructor" && k !== "prototype" && SAFE_FIELD.test(k)) o[k] = src[k]; } return o; }  // only plain word-like field names are kept: a field called <img src=x onerror=...> is dropped
  function cleanAttempt(h) {
    if (!h || typeof h !== "object" || !/^a_\d{1,16}_[a-z0-9]{1,12}$/.test(String(h.id))) return null;
    if (h.type !== "practice" && h.type !== "exam") return null;
    if (isNaN(new Date(h.date))) return null;
    const out = plain(h);
    ["pct", "clb", "overall", "correct", "total", "checklistScore", "checklistTotal"].forEach(k => {
      if (out[k] !== undefined) { const n = num(out[k], 0, 1000, null); if (n === null) delete out[k]; else out[k] = n; }
    });
    if (h.type === "practice") { if (!SKILL_IDS.includes(h.skill)) return null; out.clb = h.clb === undefined || h.clb === null ? null : num(h.clb, 0, 12, null); } // a missing level stays null ("no score"), never 0
    if (h.type === "exam") {
      if (!h.breakdown || typeof h.breakdown !== "object") return null;
      out.breakdown = {};
      for (const id of SKILL_IDS) { if (!h.breakdown[id]) return null; out.breakdown[id] = Object.assign(plain(h.breakdown[id]), { clb: h.breakdown[id].clb === undefined || h.breakdown[id].clb === null ? null : num(h.breakdown[id].clb, 0, 12, null) }); }
      out.overall = h.overall === undefined || h.overall === null ? null : num(h.overall, 0, 12, null);
    }
    return out;
  }
  // LEARNING NOTE (T-030): the new settings are checked the same way. Preferred days must be whole numbers 0 to 6 (kept once each),
  // the preferred time must look like "07:30", the test date must look like "2026-12-01", and the switches must be true or false.
  function cleanSettings(st) {
    const out = plain(st);
    delete out.apiKey;
    if (out.targetCLB !== undefined) out.targetCLB = num(out.targetCLB, 4, 12, 9);
    if (out.hoursPerWeek !== undefined) out.hoursPerWeek = num(out.hoursPerWeek, 2, 30, 8);
    if (out.sessionMin !== undefined) out.sessionMin = num(out.sessionMin, 20, 240, 75);
    if (out.name !== undefined) out.name = typeof out.name === "string" ? out.name.slice(0, 60) : "";
    if (out.examDate !== undefined) out.examDate = /^\d{4}-\d{2}-\d{2}$/.test(String(out.examDate)) && !isNaN(new Date(out.examDate + "T12:00:00")) ? out.examDate : "";
    if (out.studyDays !== undefined) out.studyDays = Array.isArray(out.studyDays) ? Array.from(new Set(out.studyDays.filter(d => Number.isInteger(d) && d >= 0 && d <= 6))) : [];
    if (out.studyTime !== undefined) out.studyTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(out.studyTime)) ? out.studyTime : "";
    // T-031 turn C: studyTimes = a time for single weekdays, { "1": "07:00", "3": "18:30" }. Only weekdays 0 to 6 with a real HH:MM are kept; a day with none uses studyTime.
    if (out.studyTimes !== undefined) {
      const clean = {};
      if (isObj(out.studyTimes)) Object.keys(out.studyTimes).forEach(k => { if (/^[0-6]$/.test(k) && /^([01]\d|2[0-3]):[0-5]\d$/.test(String(out.studyTimes[k]))) clean[k] = out.studyTimes[k]; });
      out.studyTimes = clean;
    }
    ["speechToText", "examRealism", "vibrate"].forEach(k => { if (out[k] !== undefined) out[k] = out[k] === true; });
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
      const v = keyOk.test(k) && k !== "__proto__" && k !== "constructor" && k !== "prototype" ? valueFn(src[k]) : null;  // these three names are refused as keys, so a lookup like words[id] can never hit Object's own members
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
  // Study time (T-030). "days" maps a date to minutes per skill ("general" = review, words, grammar, exam); "manual" lists the entries
  // typed in by hand, with an optional note of at most 140 characters. Every number is clamped; every date and id must match its pattern.
  const TIME_KEYS = SKILL_IDS.concat("general");
  const mins = (v, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(0, Math.round(n * 10) / 10)) : null; };
  function cleanStudyTime(src) {
    const out = { days: {}, manual: [] };
    if (!isObj(src)) return out;
    if (isObj(src.days)) {
      for (const d of Object.keys(src.days)) {
        const row = src.days[d];
        if (!DAY.test(d) || !isObj(row)) { skipped++; continue; }
        const clean = {};
        TIME_KEYS.forEach(k => { const m = mins(row[k], 1440); if (m) clean[k] = m; });
        out.days[d] = clean;
      }
      // Keep only the newest 400 days, as the app itself does (MAX_TIME_DAYS in study.js), so a crafted file cannot fill storage.
      Object.keys(out.days).sort().slice(0, Math.max(0, Object.keys(out.days).length - 400)).forEach(d => { delete out.days[d]; });
    }
    if (Array.isArray(src.manual)) {
      src.manual.slice(0, 500).forEach(e => {
        const m = isObj(e) ? mins(e.minutes, 600) : null;
        if (!isObj(e) || !/^m_\d{1,16}$/.test(String(e.id)) || !DAY.test(String(e.date)) || !TIME_KEYS.includes(e.skill) || !m) { skipped++; return; }
        out.manual.push({ id: e.id, date: e.date, skill: e.skill, minutes: m, note: typeof e.note === "string" ? e.note.slice(0, 140) : "" });
      });
    }
    return out;
  }
  // The Arrange layout: a valid copy, or undefined (the field is then simply left out of the cleaned bundle, so a bad value never reaches storage).
  const cleanNavLayout = src => NavLayout.validate(src) || undefined;
  const CLEANERS = { navLayout: cleanNavLayout, partStats: cleanPartStats, mistakes: cleanMistakes, vocab: cleanVocab, grammar: cleanGrammar, log: cleanLog, studyTime: cleanStudyTime };
  // LEARNING NOTE (T-031 turn B): every way data can arrive (a backup file, a QR transfer, a shared file) goes through cleanBundle.
  // It rebuilds the data field by field with the cleaners above and returns a NEW object; nothing from the outside is stored as it came.
  // The history list is capped at 5000 entries so a crafted file cannot fill the device.
  function cleanBundle(obj) {
    skipped = 0;
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
    // Positive evidence: a real backup has at least one of the keys we write (history, settings or one of the study stores). "{}" or {"a":1} is not a backup.
    if (!(Array.isArray(obj.history) || isObj(obj.settings) || Object.keys(KEYS).some(k => k !== "navLayout" && obj[k] !== undefined && obj[k] !== null))) return null;   // a layout alone is not a backup
    const out = {};
    if (Array.isArray(obj.history)) { out.history = obj.history.slice(0, 5000).map(cleanAttempt).filter(Boolean); skipped += obj.history.length - out.history.length; }
    if (obj.settings && typeof obj.settings === "object" && !Array.isArray(obj.settings)) out.settings = cleanSettings(obj.settings);
    Object.keys(KEYS).forEach(k => { if (obj[k] !== undefined && obj[k] !== null) { const c = CLEANERS[k](obj[k]); if (c !== undefined) out[k] = c; } });  // k comes from KEYS (our own list), never from the file
    out.profileName = Profiles.cleanName(obj.profileName);
    return out;
  }
  // Writes a cleaned bundle under one learner's labels (id), not necessarily the active one. Answers true only when EVERY write worked
  // (a full device throws "quota exceeded"; the old code ignored that and showed a success message).
  function putBundle(id, b) {
    let ok = true;
    const w = (legacy, v) => { try { localStorage.setItem(Profiles.keyFor(id, legacy), JSON.stringify(v)); } catch (e) { ok = false; } };
    if (b.history) w(HISTORY_KEY_NAME, b.history);
    if (b.settings) w(SETTINGS_KEY_NAME, b.settings);
    Object.keys(KEYS).forEach(k => { if (b[k] !== undefined) w(KEYS[k], b[k]); });
    return ok;
  }
  // LEARNING NOTE (T-031 turn C): "write safely". Before changing anything we copy what is there (a snapshot). If any write fails,
  // we put the snapshot back, so a full device never leaves a half-written or empty profile. wipe = true also erases the profile first (Replace).
  function writeSafely(id, b, wipe) {
    const snap = Profiles.LEGACY.map(old => { const k = Profiles.keyFor(id, old); let v = null; try { v = localStorage.getItem(k); } catch (e) { v = undefined; } return [k, v]; });   // undefined = could not be read: unknown, so a rollback leaves that key alone
    if (wipe && snap.some(([, v]) => v === undefined)) return false;   // a note could not even be read: do not erase what cannot be put back
    if (wipe) Profiles.removeKeys(id);
    if (putBundle(id, b)) return true;
    snap.forEach(([k, v]) => { if (v === undefined) return; try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { console.warn("Could not restore " + k, e); } });
    return false;
  }
  // Backup file: keys present in the file replace the active learner's copy; keys missing from the file are left alone. True when saved.
  function importAll(obj) {
    const b = cleanBundle(obj);
    if (!b) return false;
    const ok = writeSafely(Profiles.activeId, b, false);
    if (ok) NavLayout.refresh();   // an imported layout shows in the menus at once
    return ok;
  }
  // Transfer: "Replace this profile" erases the active learner's data and writes the bundle; if the write fails the old data comes back. True when saved.
  function replaceActive(obj) {
    const b = cleanBundle(obj);
    if (!b) return false;
    const ok = writeSafely(Profiles.activeId, b, true);
    if (ok) NavLayout.refresh();
    return ok;
  }
  // Transfer: "Add as new profile". Returns the new profile; null when the limit of 8 profiles is reached or the data is not a backup;
  // false when the device could not store it (the half-made profile is removed again).
  function addAsProfile(obj) {
    const b = cleanBundle(obj);
    if (!b) return null;
    const p = Profiles.create(b.profileName || (b.settings && b.settings.name) || "Imported");
    if (p === false) return false;
    if (!p) return null;
    if (!putBundle(p.id, b)) { Profiles.remove(p.id); return false; }
    return p;
  }
  // A few counts to show before the learner decides (numbers only, no text from the file). hasData is false when the received
  // backup holds nothing at all, which is when "Replace" would only erase.
  function summary(obj) {
    const b = cleanBundle(obj);
    if (!b) return null;
    const st = b.studyTime || { days: {}, manual: [] };
    const hasData = !!((b.history || []).length || (b.settings && Object.keys(b.settings).length) || Object.keys(b.vocab || {}).length || (b.log || []).length ||
      Object.keys(b.mistakes || {}).length || Object.keys(b.partStats || {}).length || Object.keys(b.grammar || {}).length || Object.keys(st.days).length || st.manual.length);
    return { attempts: (b.history || []).length, words: Object.keys(b.vocab || {}).length, notes: (b.log || []).length, name: b.profileName || "", skipped, hasData };
  }
  function importSkipped() { return skipped; } // how many entries the last import left out
  // Reset erases the ACTIVE learner's notes only (history, settings, the study stores and the small app notes). Other profiles,
  // the theme and the sidebar fold are not touched.
  function resetAll() { Profiles.removeKeys(Profiles.activeId); NavLayout.refresh(); }

  return { getHistory, saveAttempt, deleteAttempt, clearHistory, getSettings, saveSettings, get, set, exportAll, importAll, cleanBundle, replaceActive, addAsProfile, summary, importSkipped, resetAll };
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
