/*
 * LEARNING NOTE (for beginners): this file lets several people share one device, each with their own progress. It is the app's
 * "who is studying?" book-keeping, and it loads BEFORE js/storage.js because storage asks it for key names.
 *
 * How it works, in plain words:
 *   - localStorage is one shared box of labelled notes. Before this file, every note had one fixed label, such as
 *     "celpip_history_v1". Now each learner's notes get the learner's id in the label: "celpip_p_k3x9a2bq_history_v1".
 *     Two learners therefore never touch each other's notes, with no extra work in the screens: they all ask Storage, and Storage
 *     asks Profiles.key() for the right label.
 *   - A small list of profiles lives under one device-wide label, "celpip_profiles_v1": the names, the ids, which one is
 *     active, and whether to ask "Who's studying?" when the app opens. The theme ("celpip_theme") and the sidebar fold
 *     ("celpip_sidebar") are NOT per learner: they stay device-wide, so switching profile never changes how the app looks.
 *   - Migration: the first time this version runs, notes saved by the older single-learner version are MOVED (copied, checked,
 *     then removed) into a first profile. The profile is named from the saved first name, or "Me". It is safe to run twice: a note
 *     already moved is never overwritten, and the index is written first so a crash half-way is finished on the next load.
 *   - Profile names are typed by a person, so they are cleaned here (control characters removed, at most 40 characters) and the
 *     rest of the app only ever puts them on the page with textContent, never as HTML.
 * Nothing here uses the network.
 */
const Profiles = (function () {
  "use strict";
  const INDEX_KEY = "celpip_profiles_v1";
  const NAME_MAX = 40, MAX_PROFILES = 8;
  const ID_RE = /^[a-z0-9]{4,12}$/;
  // The per-learner notes (old fixed labels). Anything NOT in this list stays device-wide.
  const LEGACY = ["celpip_history_v1", "celpip_settings_v1", "celpip_mistakes_v1", "celpip_partstats_v1", "celpip_vocab_v1",
    "celpip_grammar_v1", "celpip_log_v1", "celpip_studytime_v1", "celpip_persist_v1", "celpip_backup_v1", "celpip_checkin_v1", "celpip_drafts_v1"];
  const listeners = [];
  let state = null;   // { list: [{id, name, createdAt}], active: id, ask: boolean, legacyDone: boolean }

  // ---------- Names ----------
  // Turns anything into a safe display name: text only, no control characters, spaces tidied, at most 40 characters.
  function cleanName(v) {
    if (typeof v !== "string") return "";
    const s = v.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, " ").replace(/\s+/g, " ").trim();
    return Array.from(s).slice(0, NAME_MAX).join("").trim();  // Array.from counts whole characters, so an emoji is never cut in half
  }
  function newId(taken) {
    for (let tries = 0; tries < 50; tries++) {
      let id = "";
      if (window.crypto && crypto.getRandomValues) { const a = new Uint8Array(8); crypto.getRandomValues(a); a.forEach(n => { id += (n % 36).toString(36); }); }
      else { for (let i = 0; i < 8; i++) id += Math.floor(Math.random() * 36).toString(36); }
      if (!taken.includes(id)) return id;
    }
    return "p" + Date.now().toString(36);
  }

  // ---------- The index (the list of profiles) ----------
  // Rebuilds the index from whatever is stored, keeping only fields and shapes we expect. A damaged index is treated as missing.
  function cleanIndex(raw) {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.list)) return null;
    const seen = [], list = [];
    raw.list.slice(0, MAX_PROFILES).forEach(p => {
      if (!p || typeof p !== "object" || typeof p.id !== "string" || !ID_RE.test(p.id) || seen.includes(p.id)) return;
      seen.push(p.id);
      const created = typeof p.createdAt === "string" && !isNaN(Date.parse(p.createdAt)) ? p.createdAt.slice(0, 30) : "";
      list.push({ id: p.id, name: cleanName(p.name) || "Learner", createdAt: created });
    });
    if (!list.length) return null;
    return { list, active: list.some(p => p.id === raw.active) ? raw.active : list[0].id, ask: raw.ask === true, legacyDone: raw.legacyDone === true };
  }
  function readIndex() { try { return cleanIndex(JSON.parse(localStorage.getItem(INDEX_KEY))); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(INDEX_KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }
  function keyFor(id, legacy) { return "celpip_p_" + id + "_" + legacy.replace(/^celpip_/, ""); }

  // ---------- Migration from the single-learner version ----------
  function moveLegacy(id) {
    let allMoved = true;
    LEGACY.forEach(old => {
      try {
        const v = localStorage.getItem(old);
        if (v === null) return;
        const nk = keyFor(id, old);
        if (localStorage.getItem(nk) === null) localStorage.setItem(nk, v);   // never overwrite a note that is already there
        if (localStorage.getItem(nk) !== null) localStorage.removeItem(old); else allMoved = false;
      } catch (e) { allMoved = false; }
    });
    return allMoved;
  }
  function init() {
    state = readIndex();
    if (!state) {
      let name = "";
      try { const s = JSON.parse(localStorage.getItem("celpip_settings_v1")); if (s && typeof s === "object") name = cleanName(s.name); } catch (e) { name = ""; }
      const id = newId([]);
      state = { list: [{ id, name: name || "Me", createdAt: new Date().toISOString() }], active: id, ask: false, legacyDone: false };
      save();                                   // the index first: a crash while moving is finished on the next load
    }
    if (!state.legacyDone) { if (moveLegacy(state.list[0].id)) { state.legacyDone = true; save(); } }
  }
  init();

  // ---------- Public helpers ----------
  const notify = why => listeners.slice().forEach(fn => { try { fn(why); } catch (e) {} });
  function active() { return state.list.find(p => p.id === state.active) || state.list[0]; }
  function removeKeys(id) { try { LEGACY.forEach(old => localStorage.removeItem(keyFor(id, old))); } catch (e) {} }

  return {
    NAME_MAX, MAX_PROFILES, INDEX_KEY, LEGACY, cleanName,
    key: legacy => keyFor(state.active, legacy),   // the label for the ACTIVE learner's copy of a note
    keyFor,                                        // the label for any learner's copy (used when adding a profile from a transfer)
    list: () => state.list.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt })),
    active: () => ({ id: active().id, name: active().name }),
    get activeId() { return active().id; },
    get ask() { return state.ask; },
    setAsk(v) { state.ask = v === true; save(); },
    onChange(fn) { listeners.push(fn); },
    // Adds a profile and returns it, or null when the name is empty or the limit of 8 is reached, or false when the device could not save the list (storage full). It does not switch to it.
    create(name) {
      const n = cleanName(name);
      if (!n || state.list.length >= MAX_PROFILES) return null;
      const p = { id: newId(state.list.map(x => x.id)), name: n, createdAt: new Date().toISOString() };
      state.list.push(p);
      if (!save()) { state.list.pop(); return false; }   // not saved: take it back out so the screen and the disk agree
      notify("create");
      return { id: p.id, name: p.name };
    },
    rename(id, name) {
      const n = cleanName(name), p = state.list.find(x => x.id === id);
      if (!p || !n) return false;
      p.name = n; save(); notify("rename");
      return true;
    },
    // Deletes a profile and ALL of its notes. The last profile cannot be deleted.
    remove(id) {
      if (state.list.length <= 1 || !state.list.some(p => p.id === id)) return false;
      const wasActive = state.active === id;
      state.list = state.list.filter(p => p.id !== id);
      removeKeys(id);
      if (wasActive) state.active = state.list[0].id;
      save(); notify(wasActive ? "switch" : "remove");
      return true;
    },
    switchTo(id) {
      if (!state.list.some(p => p.id === id)) return false;
      if (state.active !== id) { state.active = id; save(); notify("switch"); }
      return true;
    },
    // Another tab changed the list: read it again. Returns true when the active learner is now a different one.
    reload() { const before = state.active, fresh = readIndex(); if (fresh) state = fresh; return state.active !== before; },
    removeKeys
  };
})();
