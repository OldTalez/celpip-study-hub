/*
LEARNING NOTE (T-031 turn C): practice drafts. When you leave a Reading, Listening or Writing practice before finishing (Exit button,
another menu item, or closing the tab), this file keeps a "draft": the answers you chose, your flags, the text you wrote, and the time
used. It does NOT keep your private notes. Next time you open that practice, the page offers "Resume where you left off?" with
Resume and Start fresh. The Timed Exam never keeps a draft (the real test cannot be paused), and Speaking does not either (a
recording cannot be kept).
Where it lives: one note per learner (celpip_p_<id>_drafts_v1, see js/profiles.js). It is in the Reset list but NOT in the backup file or the
QR transfer. It is "cleaned on read": every time it is loaded it is rebuilt from known shapes, so a damaged or edited note can never
break a screen. Finishing a practice clears its draft.
How a screen uses it: Drafts.watch(kind, getSnapshot) saves a snapshot every few seconds, when the tab is hidden or closed, and when
the screen is left. Drafts.finish(kind) clears it. Drafts.read(kind) gives back the cleaned draft (or null).
*/
const Drafts = (function () {
  "use strict";
  const NOTE = "celpip_drafts_v1";
  const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/;
  const KINDS = ["reading", "listening", "writing"];
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const int = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : null; };

  function data(kind) { try { return skillById(kind).data; } catch (e) { return null; } }
  function cleanMcq(kind, d) {
    const dat = data(kind);
    if (!isObj(d) || !dat || !Array.isArray(d.passageIds) || d.passageIds.length < 1 || d.passageIds.length > 8) return null;
    const ids = d.passageIds.map(String);
    const ps = ids.map(id => (SAFE_ID.test(id) ? dat.passages.find(p => p.id === id) : null));
    if (ps.some(p => !p)) return null;                                   // a passage that no longer exists: the draft is dropped
    const pIndex = int(d.pIndex, 0, ids.length);
    const timeLimitSec = d.timeLimitSec ? int(d.timeLimitSec, 60, 7200) : 0;
    const done = Array.isArray(d.done) ? d.done.slice(0, ids.length) : [];
    if (pIndex === null || done.length !== pIndex) return null;
    const answersOf = (arr, p) => (Array.isArray(arr) && arr.length === p.questions.length ? arr.map((a, i) => { const n = a === null ? null : int(a, 0, p.questions[i].options.length - 1); return n; }) : null);
    const secsOf = (arr, p) => (Array.isArray(arr) && arr.length === p.questions.length ? arr.map(s => int(s, 0, 7200) || 0) : null);
    const cleanDone = [];
    for (let i = 0; i < done.length; i++) {
      const e = done[i], p = ps[i];
      const a = isObj(e) && e.passageId === ids[i] ? answersOf(e.answers, p) : null, s = isObj(e) ? secsOf(e.secs, p) : null;
      if (!a || !s) return null;
      cleanDone.push({ passageId: ids[i], answers: a, secs: s });
    }
    let current = null;
    if (d.current !== null && d.current !== undefined && pIndex < ids.length) {
      const p = ps[pIndex], c = d.current;
      const a = isObj(c) ? answersOf(c.answers, p) : null, s = isObj(c) ? secsOf(c.secs, p) : null;
      if (!a || !s || !Array.isArray(c.flags) || c.flags.length !== p.questions.length) return null;
      current = { answers: a, secs: s, flags: c.flags.map(f => f === true) };
    }
    return { kind, passageIds: ids, pIndex, timeLimitSec, clockLeft: timeLimitSec ? int(d.clockLeft, 0, timeLimitSec) : 0, done: cleanDone, current };
  }
  function cleanWriting(d) {
    const dat = data("writing");
    if (!isObj(d) || !dat || typeof d.promptId !== "string" || !SAFE_ID.test(d.promptId)) return null;
    const prompt = dat.prompts.find(p => p.id === d.promptId);
    if (!prompt || typeof d.text !== "string") return null;
    const full = prompt.timeLimitMin * 60;
    return { kind: "writing", promptId: prompt.id, text: d.text.slice(0, 20000), timeLeftSec: int(d.timeLeftSec, 0, full) === null ? full : int(d.timeLeftSec, 0, full) };
  }
  // Rebuilds the whole note from known shapes. Anything that does not fit is left out.
  function clean(raw) {
    const out = {};
    if (!isObj(raw)) return out;
    KINDS.forEach(k => {
      const e = raw[k];
      if (!isObj(e) || typeof e.savedAt !== "string" || isNaN(Date.parse(e.savedAt))) return;
      const c = k === "writing" ? cleanWriting(e) : cleanMcq(k, e);
      if (c) { c.savedAt = new Date(Date.parse(e.savedAt)).toISOString(); out[k] = c; }
    });
    return out;
  }
  function load(id) { try { return clean(JSON.parse(localStorage.getItem(Profiles.keyFor(id, NOTE)))); } catch (e) { return {}; } }
  const watchers = new Set();   // the practice screens being watched right now
  let lastFailed = false;   // true when the most recent draft save did not work (storage full)
  function store(id, all) { try { if (Object.keys(all).length) localStorage.setItem(Profiles.keyFor(id, NOTE), JSON.stringify(all)); else localStorage.removeItem(Profiles.keyFor(id, NOTE)); return true; } catch (e) { return false; } }

  function read(kind) { return load(Profiles.activeId)[kind] || null; }
  function save(id, kind, snap) {
    const all = load(id);
    snap.savedAt = new Date().toISOString();
    const c = clean({ [kind]: snap })[kind];
    if (!c) return true;
    all[kind] = c;
    return store(id, all);
  }
  function discard(kind, id) { const all = load(id || Profiles.activeId); delete all[kind]; store(id || Profiles.activeId, all); }

  // watch: starts saving a draft for one running practice. getSnapshot() answers the raw draft data, or null to skip. The returned object
  // goes into activeTimers, so the router calls stop() when the screen is left, and that saves one last time.
  function watch(kind, getSnapshot) {
    const id = Profiles.activeId;        // remembered now: leaving by switching profile must save into the profile that was studying
    let live = true, handle = 0;
    const flush = () => {
      if (!live) return;
      try {
        const s = getSnapshot();
        if (!s) return;
        const ok = save(id, kind, s);
        if (!ok && !lastFailed && typeof toast === "function") toast("Couldn't save your draft — this device's storage is full. Export a backup or free space.", "error");   // said once until a save works again
        lastFailed = !ok;
      } catch (e) { /* a draft must never break the screen */ }
    };
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    handle = setInterval(flush, 4000);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    const w = {
      flush,
      stop() { flush(); w.end(); },                                // screen left: one last save
      end() { live = false; watchers.delete(w); clearInterval(handle); window.removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", onHide); },
      finish() { w.end(); discard(kind, id); }                    // practice finished: no draft
    };
    watchers.add(w);
    return w;
  }
  // Saves every running practice now (used by the Exit question, so its wording is true). failed() says whether the last save failed.
  return { KINDS, read, discard: kind => discard(kind), watch, clean, NOTE, flushNow: () => watchers.forEach(w => w.flush()), failed: () => lastFailed };
})();
window.Drafts = Drafts;
