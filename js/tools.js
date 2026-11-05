/*
 * LEARNING NOTE (for beginners): this file holds the "practice tools", the small helpers that sit on top of the question
 * screens. Added 2026-11-05 (T-029 turn B, Agent: Nsikak). They follow Company/Work/2026-11-05 T-029 celpip-identity/
 * interaction-standard.md. T-031 turn A (2026-11-05): toast() can take a button ({ action: { label, onClick } }); such a toast stays until used (the update notice). Read it in this order:
 *   1. toast()            a small "Saved" message that fades away by itself
 *   2. realismOn()        the one yes/no question "should the study aids be hidden?" (Settings switch, always yes in the exam)
 *   3. QTimer             counts how many seconds you spend on each question
 *   4. mountQuestionTools the row of question dots, the Flag button and the "This question 0:48" clock
 *   5. PassageTools       highlight and notes on a Reading passage (selection pop-up, note editor, notes list)
 *   6. wordBar / ListenBar  the two progress bars (Writing word count, Listening audio)
 *
 * Ideas used again and again here:
 *  - Anything the learner types (a note) is put on the page with textContent, never innerHTML. textContent treats the
 *    text as plain letters, so "<img src=x onerror=alert(1)>" shows up as those exact characters and can never run.
 *  - Notes live only in a JavaScript variable for the screen you are on. They are not saved to localStorage, not put in
 *    your history and not in the backup file, and nothing here makes a network call.
 *  - Colour is never the only signal: dots differ by shape, flags have a badge and words, bars print a number and a word.
 */

// ---------- 1. Toast: a short status message ----------
// One at a time (a new one replaces the old). It sits in <div id="toastHost" role="status"> from index.html; that box
// exists from the start, which is what makes screen readers read out what appears in it. Errors use role="alert" and
// stay until dismissed; the rest fade after about 3 seconds, and wait while the pointer or keyboard is on them.
const Toast = (() => {
  let timer = 0, node = null, madeAt = 0;
  const SHOW_MS = 3000;
  const CARRY_MS = 300;  // a toast younger than this was raised by the action that caused the screen change, so it stays
  const ICONS = { ok: "check", error: "alert", info: "info" };
  function remove(t, quick) {
    if (!t || !t.parentNode) return;
    clearTimeout(timer);
    t.classList.remove("show");  // CSS fades it out over --dur-2 (0 with reduced motion)
    const gone = () => { if (t.parentNode) t.parentNode.removeChild(t); if (node === t) node = null; };
    if (quick) gone(); else setTimeout(gone, 200);
  }
  // opts (optional): { action: { label, onClick } } adds a button, and the toast then stays until it is used or replaced (the "New version ready" notice).
  function show(message, kind, opts) {
    const host = document.getElementById("toastHost");
    if (!host) return;
    kind = kind === "error" || kind === "info" ? kind : "ok";
    remove(node, true);  // one at a time
    const t = document.createElement("div");
    t.className = "toast toast-" + kind;
    if (kind === "error") t.setAttribute("role", "alert");
    const icon = document.createElement("span");
    icon.className = "toast-ico toast-ico-" + ICONS[kind];
    icon.setAttribute("aria-hidden", "true");
    const words = document.createElement("span");
    words.textContent = String(message);  // textContent: shown as plain text
    t.append(icon, words);
    const act = opts && opts.action;
    if (act) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-sm btn-quiet"; b.textContent = String(act.label);
      b.onclick = () => { act.onClick(); };
      t.appendChild(b);
      t.dataset.sticky = "1";
    }
    if (kind === "error") {
      const x = document.createElement("button");
      x.type = "button"; x.className = "btn btn-sm btn-quiet"; x.textContent = "Dismiss";
      x.onclick = () => remove(t, false);
      t.appendChild(x);
    }
    host.appendChild(t);
    node = t; madeAt = performance.now();
    void t.offsetWidth;  // lets the browser see the starting look before the "show" class starts the fade-in
    t.classList.add("show");
    if (kind !== "error" && !act) {
      const start = ms => { clearTimeout(timer); timer = setTimeout(() => remove(t, false), ms); };
      start(SHOW_MS);
      t.addEventListener("mouseenter", () => clearTimeout(timer));
      t.addEventListener("mouseleave", () => start(SHOW_MS / 2));
      t.addEventListener("focusin", () => clearTimeout(timer));
      t.addEventListener("focusout", () => start(SHOW_MS / 2));
    }
  }
  // Called by render() on every screen change: a toast left over from the screen before goes at once. One made in the last
  // moment (for example "Settings saved", raised just as the page changes) is kept so the learner still sees it.
  function clear() { if (node && !node.dataset.sticky && performance.now() - madeAt > CARRY_MS) remove(node, true); }
  return { show, clear };
})();
function toast(message, kind, opts) { Toast.show(message, kind, opts); }

// ---------- 2. "Practise like the real test" ----------
// ONE constant (Utibe's recommendation; the Board has not confirmed it yet): in the Timed Exam the study aids are always
// hidden.
// Set alwaysOn to false to let the Settings switch decide there too. It is an object property (not a plain constant) so
// the end-to-end test can switch it off for one run and check that marks, notes and flags survive tab changes in the exam.
const EXAM_REALISM = { alwaysOn: true };
// True when highlighter, notes, flags and the "This question" clock should NOT be shown.
function realismOn() {
  const inExam = typeof Shell !== "undefined" && Shell.focusMode.kind === "exam";  // (Shell is a top-level const, so it is not a property of window)
  return (EXAM_REALISM.alwaysOn && inExam) || !!Storage.getSettings().examRealism;
}

// ---------- 3. Time per question ----------
// METHOD (also written in LEARNING-GUIDE.md): the question you touched last is the "current" one. Touching means
// focusing it, clicking it, changing its answer or clicking its dot. Every second the current question is on screen is
// added to its total, using clock readings (Date.now) rather than counting ticks, so a slow tick cannot make it drift.
// Question 1 is current from the moment the passage appears. Counting pauses while the tab is hidden and while you are on
// another exam tab (pause/resume), and it stops when you check your answers.
const liveTimers = new Set();
document.addEventListener("visibilitychange", () => liveTimers.forEach(t => (document.hidden ? t.hold() : t.release())));
function QTimer(n) {
  const secs = new Array(n).fill(0);
  let cur = 0, since = null, wanted = false;  // wanted: should the clock be running when the tab is visible?
  function flush() { if (since !== null) { const now = Date.now(); secs[cur] += (now - since) / 1000; since = now; } }
  const api = {
    start() { wanted = true; if (!document.hidden && since === null) since = Date.now(); liveTimers.add(api); },  // safe to call twice: it never restarts a running clock
    resume() { api.start(); },
    pause() { flush(); since = null; wanted = false; },
    stop() { api.pause(); liveTimers.delete(api); },
    hold() { flush(); since = null; },                                  // tab hidden
    release() { if (wanted && since === null) since = Date.now(); },    // tab visible again
    enter(i) { if (i === cur || i < 0 || i >= n) return; flush(); cur = i; },
    get current() { return cur; },
    load(arr) { arr.forEach((v, i) => { if (i < n && Number.isFinite(v)) secs[i] = v; }); },   // put back seconds saved in a draft
    seconds(i) { flush(); return secs[i]; },
    all() { flush(); return secs.map(s => Math.round(s)); }             // whole seconds, one per question
  };
  return api;
}
// What a finished set of questions adds to an attempt in History: { totalSec, perQuestionSec, perPassageSec }.
// Parts is a list of per-passage arrays of seconds (a passage the clock cut off is a list of zeros).
function buildTiming(parts) {
  const perPassageSec = parts.map(p => p.reduce((a, b) => a + b, 0));
  return { totalSec: perPassageSec.reduce((a, b) => a + b, 0), perQuestionSec: [].concat(...parts), perPassageSec };
}

// ---------- 4. Question dots, Flag button, "This question" clock ----------
// state: { timer: QTimer, flags: [bool...] } kept by the caller, so the exam's tabs keep flags when you switch passages.
// opts.aids: true when flags and the clock may show (false when realism is on). opts.header: the .run-header to put the
// clock in. Returns { sync, stop }: sync(answeredNames) is called whenever an answer changes (watchAnswered does this).
function mountQuestionTools(form, state, opts) {
  const blocks = [...form.querySelectorAll(".question-block")];
  const n = blocks.length, aids = !!opts.aids;
  const wrap = document.createElement("div");
  wrap.className = "qnav";
  const list = document.createElement("ol");
  list.className = "dots";
  list.setAttribute("aria-label", "Questions");
  const dots = blocks.map((b, i) => {
    const li = document.createElement("li");
    const d = document.createElement("button");
    d.type = "button"; d.className = "dot"; d.dataset.q = String(i);
    d.textContent = String(i + 1);
    const badge = document.createElement("span");
    badge.className = "fl"; badge.setAttribute("aria-hidden", "true");
    d.appendChild(badge);
    li.appendChild(d); list.appendChild(li);
    b.dataset.qi = String(i);
    b.setAttribute("tabindex", "-1");  // so a dot can move keyboard focus to the question
    return d;
  });
  const key = document.createElement("p");
  key.className = "dot-key muted small";
  key.textContent = "Filled: answered. Plain ring: not yet. Outline: this question." + (aids ? " Flag badge: marked for review." : "");
  wrap.append(list, key);
  form.before(wrap);

  let answered = new Set();
  function paintDots() {
    dots.forEach((d, i) => {
      const done = answered.has("q" + i), flagged = aids && state.flags[i], cur = state.timer.current === i;
      d.classList.toggle("ans", done);
      d.classList.toggle("flagged", !!flagged);
      if (cur) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
      d.setAttribute("aria-label", `Question ${i + 1}, ${done ? "answered" : "not answered"}${flagged ? ", flagged for review" : ""}${cur ? ", current question" : ""}`);
    });
  }
  function setCurrent(i) { state.timer.enter(i); paintDots(); paintClock(); }

  // Flag buttons
  const flagBtns = [];
  if (aids) {
    blocks.forEach((b, i) => {
      const row = document.createElement("div");
      row.className = "q-tools";
      const f = document.createElement("button");
      f.type = "button"; f.className = "btn btn-sm flag-btn";
      const paint = () => { f.setAttribute("aria-pressed", String(!!state.flags[i])); f.textContent = state.flags[i] ? "Flagged" : "Flag for review"; };
      f.onclick = () => { state.flags[i] = !state.flags[i]; paint(); setCurrent(i); };
      paint();
      row.appendChild(f); b.appendChild(row); flagBtns.push(f);
    });
  }

  // Which question is current: whichever was last focused, clicked or answered.
  blocks.forEach((b, i) => {
    b.addEventListener("focusin", () => setCurrent(i));
    b.addEventListener("pointerdown", () => setCurrent(i));
  });
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  dots.forEach((d, i) => {
    d.onclick = () => {
      const b = blocks[i];
      b.scrollIntoView({ block: "start", behavior: reduced() ? "auto" : "smooth" });
      b.focus({ preventScroll: true });
      setCurrent(i);
    };
  });

  // "This question 0:48", next to the timer. Not a live region (it would chatter every second).
  let clock = null, clockVal = null, handle = 0;
  function paintClock() { if (clockVal) clockVal.textContent = fmtTime(state.timer.seconds(state.timer.current)); }
  if (aids && opts.header) {
    clock = document.createElement("span");
    clock.className = "qtime";
    const lab = document.createElement("span"); lab.className = "timer-label"; lab.textContent = "This question";
    clockVal = document.createElement("span"); clockVal.className = "qtime-val"; clockVal.id = "qTime";
    clock.append(lab, clockVal);
    opts.header.appendChild(clock);
    handle = setInterval(paintClock, 1000);
  }
  paintDots(); paintClock();
  state.timer.start();  // question 1 is current and the clock runs from now
  return {
    sync(names) { answered = names || new Set([...form.querySelectorAll("input:checked")].map(i => i.name)); paintDots(); },
    stop() { clearInterval(handle); handle = 0; state.timer.stop(); if (clock) { clock.remove(); clock = null; } }  // the seconds counted so far stay readable with state.timer.all()
  };
}

// ---------- 5. Highlight and notes on a passage ----------
// markRange / unmark: the highlighter's engine, moved here from app.js (unchanged in behaviour except that markRange now
// returns the list of <mark> elements it made, so the caller can give them an id).
// LEARNING NOTE: a "Range" is the browser's description of what is selected (where it starts and ends). We walk every
// piece of text inside the passage (a TreeWalker visits them in order), cut out the selected part of each piece with
// splitText, and wrap it in a <mark> element. Wrapping piece by piece works even when the selection crosses a line break.
function markRange(range, root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const pieces = [], marks = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!range.intersectsNode(n) || !n.nodeValue.trim() || n.parentElement.closest("mark.hl")) continue;
    const start = n === range.startContainer ? range.startOffset : 0;
    const end = n === range.endContainer ? range.endOffset : n.nodeValue.length;
    if (end > start) pieces.push([n, start, end]);
  }
  pieces.forEach(([n, start, end]) => {
    const middle = n.splitText(start);
    middle.splitText(end - start);
    const mark = document.createElement("mark");
    mark.className = "hl";
    middle.parentNode.insertBefore(mark, middle);
    mark.appendChild(middle);
    marks.push(mark);
  });
  return marks;
}
function unmark(mark) {
  const parent = mark.parentNode;
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
  parent.removeChild(mark);
  parent.normalize();  // join the text pieces back together
}

const PassageTools = (() => {
  const NOTE_MAX = 280;  // longest note, in characters
  let uid = 0, current = null;  // current: the tools that are live on screen right now (only one passage at a time)

  // One state object per passage, kept by the caller so a screen can be redrawn without losing marks.
  //   html: the passage text with <mark> tags (never any note text), notes: highlight id -> note text, seq: id counter.
  function newState() { return { html: null, notes: new Map(), seq: 0 }; }

  // The row of buttons above the passage. Returns "" when realism is on: then nothing is drawn, not even a hidden button.
  function barHtml() {
    if (realismOn()) return "";
    // Turn C: the selection pop-up is the main path. The bar keeps "Highlight selection" (the keyboard and switch route the
    // standard asks for) and one quiet "Clear highlights". The pen and the "Add note" button were dropped from the bar:
    // notes are added from the pop-up, or by Tab from the selected words.
    return `<div class="hl-bar" role="group" aria-label="Passage tools">
    <button type="button" class="btn btn-sm" data-hl-selection>Highlight selection</button>
    <button type="button" class="btn btn-sm btn-quiet" data-hl-clear>Clear highlights</button>
    <span class="muted small" data-hl-hint>Select words (or hold Shift and press the arrow keys), then press Tab to choose Highlight or Add note.</span>
  </div>`;
  }

  function detach() { if (current) { current.destroy(); current = null; } }

  // scope holds the bar and the .passage-text. onChange (optional) is told after each change (the passage html).
  function attach(scope, state, onChange) {
    detach();
    const text = scope.querySelector(".passage-text"), toggle = scope.querySelector("[data-hl-toggle]");  // no pen button any more (turn C); the pen code below only runs if one exists
    if (!text || !scope.querySelector("[data-hl-selection]")) return;  // no bar (realism on) means no tools at all
    uid += 1;
    if (state.html !== null) text.innerHTML = state.html;  // only ever our own earlier snapshot: escaped passage text plus <mark> tags

    // --- the pieces we add to the page ---
    // The pop-up and the note tip are children of <body>, with position: fixed, so they are placed against the window and
    // never clipped by the scrolling passage column.
    const pop = document.createElement("div");
    pop.className = "sel-pop"; pop.hidden = true;
    pop.setAttribute("role", "toolbar"); pop.setAttribute("aria-label", "Selection tools");
    const tip = document.createElement("div");
    tip.className = "note-tip"; tip.id = "noteTip" + uid; tip.hidden = true; tip.setAttribute("role", "tooltip");
    document.body.append(pop, tip);
    const panel = document.createElement("section");
    panel.className = "notes-panel";
    panel.setAttribute("aria-label", "Highlights and notes");
    const h = document.createElement("h3"); h.textContent = "Highlights and notes";
    const empty = document.createElement("p"); empty.className = "muted small";
    const ul = document.createElement("ul"); ul.className = "note-list";
    panel.append(h, empty, ul);
    scope.appendChild(panel);

    let pending = null;     // what the open pop-up is about: { range } for a new selection, { id } for an existing mark
    let mode = "closed";    // "menu" (Highlight / Add note), "editor" (the note box) or "closed"
    let opener = null;      // where keyboard focus goes back to when the pop-up closes

    // --- small helpers ---
    const marksOf = id => [...text.querySelectorAll(`mark.hl[data-h="${id}"]`)];
    const ids = () => [...new Set([...text.querySelectorAll("mark.hl[data-h]")].map(m => m.dataset.h))];  // in reading order
    function snippet(id) {
      const s = marksOf(id).map(m => m.textContent).join(" ").replace(/\s+/g, " ").trim();
      return s.length > 70 ? s.slice(0, 67) + "..." : s;
    }
    function snapshot() {
      const c = text.cloneNode(true);
      c.querySelectorAll("[aria-describedby]").forEach(n => n.removeAttribute("aria-describedby"));
      return c.innerHTML;
    }
    function changed() {
      state.html = snapshot();
      decorate(); refreshList();
      if (onChange) onChange(state.html);
    }
    // Marks with a note get a dotted underline (CSS: .has-note) and can be reached with Tab. No note text goes into
    // any attribute, so the saved html can never carry it.
    function decorate() {
      text.querySelectorAll("mark.hl").forEach(m => {
        const note = state.notes.get(m.dataset.h);
        m.classList.toggle("has-note", !!note);
        if (note) { m.setAttribute("tabindex", "0"); m.setAttribute("role", "button"); m.setAttribute("aria-label", "Highlight with a note. Press Enter to read or edit it."); }
        else { m.removeAttribute("tabindex"); m.removeAttribute("role"); m.removeAttribute("aria-label"); }
      });
    }
    function makeBtn(label, aria, onclick) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-sm btn-quiet"; b.textContent = label;
      b.setAttribute("aria-label", aria); b.onclick = onclick;
      return b;
    }
    // The list under the passage. Every string from the learner goes in through textContent.
    function refreshList() {
      ul.textContent = "";
      const all = ids();
      empty.textContent = all.length ? "" : "Nothing marked yet. Select words in the passage to highlight them or add a note.";
      all.forEach(id => {
        const li = document.createElement("li");
        li.dataset.h = id;
        const quote = document.createElement("span"); quote.className = "note-quote"; quote.textContent = snippet(id);
        li.appendChild(quote);
        const note = state.notes.get(id);
        if (note) { const p = document.createElement("p"); p.className = "note-text"; p.textContent = note; li.appendChild(p); }
        const row = document.createElement("span"); row.className = "note-actions";
        row.appendChild(makeBtn(note ? "Edit note" : "Add note", (note ? "Edit the note on " : "Add a note to ") + snippet(id), e => openEditor(id, e.currentTarget)));
        if (note) row.appendChild(makeBtn("Delete note", "Delete the note on " + snippet(id), () => deleteNote(id)));
        row.appendChild(makeBtn("Remove highlight", "Remove the highlight " + snippet(id), () => removeHighlight(id, !!note)));
        li.appendChild(row);
        ul.appendChild(li);
      });
    }
    function highlight(range) {
      const marks = markRange(range, text);
      if (!marks.length) return null;
      state.seq += 1;
      const id = "h" + state.seq;
      marks.forEach(m => { m.dataset.h = id; });
      return id;
    }
    // Deleting a note keeps the highlight it was attached to.
    function deleteNote(id) {
      state.notes.delete(id);
      closePop(false);
      changed();
      toast("Note deleted");
    }
    function removeHighlight(id, hadNote) {
      marksOf(id).forEach(unmark);
      state.notes.delete(id);
      changed();
      if (hadNote) toast("Note deleted");
      closePop(false);
    }
    // The selection, if there is one and it is inside this passage.
    function liveRange() {
      const sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) return null;
      const r = sel.getRangeAt(0);
      return text.contains(r.commonAncestorContainer) ? r : null;
    }

    // --- placing the pop-up near the thing it is about, always inside the window (also on phones) ---
    function rectOf(r) {
      let b = r.getBoundingClientRect();
      if (!b.width && !b.height) { const c = r.getClientRects(); if (c.length) b = c[0]; }
      return b;
    }
    function place(el, anchor) {
      el.style.visibility = "hidden"; el.hidden = false;
      const w = el.offsetWidth, hgt = el.offsetHeight, m = 8;
      const barH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 60;
      const minTop = barH + m, maxTop = window.innerHeight - hgt - m;
      const touch = window.matchMedia("(pointer: coarse)").matches;  // on touch screens go below, so the system menu is not covered
      const above = anchor.top - hgt - m, below = anchor.bottom + m;
      const order = touch ? [below, above] : [above, below];
      let top = order.find(t => t >= minTop && t <= maxTop);
      if (top === undefined) top = Math.max(minTop, Math.min(maxTop, order[0]));
      let left = anchor.left + anchor.width / 2 - w / 2;
      left = Math.max(m, Math.min(window.innerWidth - w - m, left));
      el.style.left = Math.round(left) + "px"; el.style.top = Math.round(top) + "px";
      el.style.visibility = "";
    }
    function anchorRect() {
      if (!pending) return null;
      if (pending.range) return rectOf(pending.range);
      const ms = marksOf(pending.id);
      return ms.length ? ms[0].getBoundingClientRect() : null;
    }

    function closePop(returnFocus) {
      const was = mode;
      pop.hidden = true; pop.textContent = ""; mode = "closed"; pending = null;
      if (returnFocus !== false && was !== "closed" && opener && document.body.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
    }

    // The two-button menu.
    function openMenu(range) {
      if (mode === "editor") return;
      pending = { range: range.cloneRange() };  // a copy: the real selection may vanish when focus moves
      pop.textContent = "";
      const hb = document.createElement("button"); hb.type = "button"; hb.className = "btn btn-sm btn-quiet"; hb.textContent = "Highlight";
      const nb = document.createElement("button"); nb.type = "button"; nb.className = "btn btn-sm btn-quiet"; nb.textContent = "Add note";
      hb.onclick = () => { const r = pending && pending.range; if (r) { highlightSelection(r); } };
      nb.onclick = () => { const r = pending && pending.range; if (r) openEditor(null, scope, r); };
      pop.append(hb, nb);
      mode = "menu"; opener = scope;
      place(pop, rectOf(range));
    }
    function highlightSelection(range) {
      const id = highlight(range);
      window.getSelection().removeAllRanges();
      closePop(true);
      if (id) changed();
    }

    // The note box. id is null for a new note on a fresh selection (range given); otherwise it edits that highlight.
    function openEditor(id, from, range) {
      closePop(false);
      pending = id ? { id } : { range: range.cloneRange() };
      opener = from;
      mode = "editor";
      const form = document.createElement("form");
      form.className = "note-form";
      const lab = document.createElement("label");
      lab.htmlFor = "noteBox" + uid; lab.textContent = id && state.notes.get(id) ? "Your note" : "Add a note";
      const ta = document.createElement("textarea");
      ta.id = "noteBox" + uid; ta.rows = 3; ta.maxLength = NOTE_MAX;
      ta.value = id ? (state.notes.get(id) || "") : "";
      const count = document.createElement("span");
      count.className = "muted small";
      const upd = () => { count.textContent = `${ta.value.length} of ${NOTE_MAX} characters`; };
      ta.addEventListener("input", upd); upd();
      const row = document.createElement("div"); row.className = "note-form-actions";
      const save = document.createElement("button"); save.type = "submit"; save.className = "btn btn-sm btn-primary"; save.textContent = "Save";
      const cancel = document.createElement("button"); cancel.type = "button"; cancel.className = "btn btn-sm"; cancel.textContent = "Cancel";
      cancel.onclick = () => closePop(true);
      row.append(save, cancel);
      if (id && state.notes.has(id)) {
        const del = document.createElement("button"); del.type = "button"; del.className = "btn btn-sm"; del.textContent = "Delete";
        del.onclick = () => deleteNote(id);
        row.appendChild(del);
      }
      form.append(lab, ta, count, row);
      pop.textContent = ""; pop.appendChild(form);
      form.onsubmit = ev => {
        ev.preventDefault();
        const value = ta.value.trim().slice(0, NOTE_MAX);  // the cap is enforced here too, not only by maxlength
        let target = id;
        if (!target) {
          target = highlight(pending.range);
          window.getSelection().removeAllRanges();
        }
        if (!target) { closePop(true); return; }
        if (value) state.notes.set(target, value); else state.notes.delete(target);
        closePop(true);
        changed();
        toast(value ? "Note saved" : "Highlight saved (no note text)");
      };
      const a = anchorRect();
      if (a) place(pop, a); else pop.hidden = false;
      ta.focus({ preventScroll: true });
    }

    // --- the note tip (hover / focus on a marked note) ---
    function showTip(mark) {
      const note = state.notes.get(mark.dataset.h);
      if (!note) return;
      tip.textContent = note;  // plain text only
      place(tip, mark.getBoundingClientRect());
      mark.setAttribute("aria-describedby", tip.id);
    }
    function hideTip() { tip.hidden = true; text.querySelectorAll("[aria-describedby]").forEach(m => m.removeAttribute("aria-describedby")); }

    // --- wiring ---
    let on = false;  // the Highlighter pen: selecting marks at once
    if (toggle) toggle.onclick = () => {
      on = !on;
      toggle.setAttribute("aria-pressed", String(on));
      text.classList.toggle("hl-on", on);
      if (on) closePop(false);
      scope.querySelector("[data-hl-hint]").textContent = on ? "Pen on: select words to mark them; tap a mark to remove it." : "Select words (or hold Shift and press the arrow keys), then press Tab to choose Highlight or Add note.";
    };
    const needSelection = () => { const r = liveRange(); if (!r) toast("Select some words in the passage first.", "info"); return r; };
    scope.querySelector("[data-hl-selection]").onclick = () => { const r = needSelection(); if (r) highlightSelection(r); };
    const noteBtn = scope.querySelector("[data-note-selection]");
    if (noteBtn) noteBtn.onclick = e => { const r = needSelection(); if (r) openEditor(null, e.currentTarget, r); };
    scope.querySelector("[data-hl-clear]").onclick = () => {
      if (!ids().length) return;
      if (state.notes.size && !confirm("Clear all highlights and notes in this passage?")) return;
      text.querySelectorAll("mark.hl").forEach(unmark);
      state.notes.clear();
      closePop(false); changed();
      toast("Highlights cleared");
    };

    // Pen mode: highlight at once when the mouse is let go (or, on phones and with a keyboard, once the selection settles).
    const applyPen = () => {
      if (!on) return;
      const r = liveRange();
      if (r && highlight(r)) { window.getSelection().removeAllRanges(); changed(); }
    };
    // Menu mode: show the pop-up when something in the passage is selected, hide it when the selection goes away.
    const checkSelection = () => {
      if (on || mode === "editor") return;
      const r = liveRange();
      if (r) openMenu(r);
      else if (mode === "menu" && !pop.contains(document.activeElement)) closePop(false);
    };
    text.addEventListener("mouseup", () => { applyPen(); setTimeout(checkSelection, 0); });
    let wait = 0;
    const onSelect = () => {
      if (!document.body.contains(text)) { detach(); return; }  // the screen changed
      clearTimeout(wait);
      wait = setTimeout(() => (on ? applyPen() : checkSelection()), on ? 700 : 350);
    };
    document.addEventListener("selectionchange", onSelect);

    // Clicking a marked part: with the pen on it removes the mark; otherwise a note mark opens the note box.
    text.addEventListener("click", e => {
      const m = e.target.closest("mark.hl");
      if (!m || !window.getSelection().isCollapsed) return;
      const id = m.dataset.h, hadNote = state.notes.has(id);
      if (on) { removeHighlight(id, hadNote); return; }
      if (hadNote) { hideTip(); openEditor(id, m); }
    });
    text.addEventListener("keydown", e => {
      const m = e.target.closest && e.target.closest("mark.has-note");
      if (m && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); hideTip(); openEditor(m.dataset.h, m); }
    });
    text.addEventListener("mouseover", e => { const m = e.target.closest("mark.has-note"); if (m) showTip(m); });
    text.addEventListener("mouseout", e => { if (e.target.closest("mark.has-note")) hideTip(); });
    text.addEventListener("focusin", e => { const m = e.target.closest("mark.has-note"); if (m) showTip(m); });
    text.addEventListener("focusout", hideTip);
    // Tab from the passage goes into the pop-up (it is in another part of the page, so we steer focus there).
    scope.addEventListener("keydown", e => {
      if (e.key === "Tab" && !e.shiftKey && e.target === scope && mode === "menu") { e.preventDefault(); const b = pop.querySelector("button"); if (b) b.focus(); }
    });
    pop.addEventListener("keydown", e => {
      if (mode !== "menu") return;
      const bs = [...pop.querySelectorAll("button")], i = bs.indexOf(document.activeElement);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length].focus(); }
    });
    pop.addEventListener("pointerdown", e => { if (mode === "menu") e.preventDefault(); });  // keeps the text selected while a button is pressed
    // Esc closes the pop-up (or the tip) first. This listener runs in the "capture" phase, before the Exit question's own
    // Esc handler, and marks the key as handled so that handler leaves it alone.
    const onKey = e => {
      if (e.key !== "Escape") return;
      if (!document.body.contains(text)) { document.removeEventListener("keydown", onKey, true); return; }
      if (mode !== "closed") { e.preventDefault(); closePop(true); }
      else if (!tip.hidden) { e.preventDefault(); hideTip(); }
    };
    document.addEventListener("keydown", onKey, true);
    // Scrolling or resizing: the pop-up follows the words it belongs to (the menu closes if they scroll out of the window).
    let raf = 0;
    const onMove = e => {
      if (e.target instanceof Node && pop.contains(e.target)) return;  // (a window resize has the window itself as target, which is not a Node)
      if (mode === "closed" || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const a = anchorRect();
        if (mode === "menu" && (!a || a.bottom < 0 || a.top > window.innerHeight)) closePop(false);  // the menu goes; a note box you are typing in stays
        else if (a && mode !== "closed") place(pop, a);
      });
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    // A tap or click elsewhere closes the menu.
    const onDown = e => { if (mode === "menu" && !pop.contains(e.target) && !text.contains(e.target)) closePop(false); };
    document.addEventListener("pointerdown", onDown, true);

    decorate(); refreshList();
    current = {
      destroy() {
        document.removeEventListener("selectionchange", onSelect);
        document.removeEventListener("keydown", onKey, true);
        document.removeEventListener("pointerdown", onDown, true);
        window.removeEventListener("scroll", onMove, true);
        window.removeEventListener("resize", onMove);
        clearTimeout(wait);
        pop.remove(); tip.remove();
      }
    };
  }
  return { newState, barHtml, attach, detach, NOTE_MAX };
})();

// ---------- 6. Progress bars ----------
// Writing: a bar that fills toward the target range. The band marks the range, the fill turns "good" inside it, and the
// words under the bar say Under / In range / Over, so colour is never the only signal.
function wordBarHtml(range) {
  const [lo, hi] = range;
  const scale = Math.round(hi * 1.25);  // the bar is full at 125% of the top of the range
  return `<div class="wbar" id="wordBar" data-lo="${lo}" data-hi="${hi}" data-scale="${scale}" data-state="under">
    <div class="wbar-track" role="progressbar" aria-label="Word count" aria-valuemin="0" aria-valuemax="${scale}" aria-valuenow="0" aria-valuetext="0 words">
      <div class="wbar-range" style="left:${(100 * lo / scale).toFixed(1)}%;width:${(100 * (hi - lo) / scale).toFixed(1)}%"></div>
      <div class="wbar-fill"></div>
    </div>
    <p class="wbar-text"><span id="wordBarStatus" class="wbar-status"></span></p>
  </div>`;
}
function paintWordBar(wc) {
  const bar = document.getElementById("wordBar");
  if (!bar) return;
  const lo = +bar.dataset.lo, hi = +bar.dataset.hi, scale = +bar.dataset.scale;
  const state = wc < lo ? "under" : wc > hi ? "over" : "in";
  const words = state === "under" ? `Under by ${lo - wc}` : state === "over" ? `Over by ${wc - hi}` : "In range";
  bar.dataset.state = state;
  bar.querySelector(".wbar-fill").style.transform = `scaleX(${Math.min(1, wc / scale).toFixed(3)})`;
  const track = bar.querySelector(".wbar-track");
  track.setAttribute("aria-valuenow", String(Math.min(wc, scale)));
  track.setAttribute("aria-valuetext", `${wc} word${wc === 1 ? "" : "s"}, ${words.toLowerCase()}, aim for ${lo} to ${hi}`);
  bar.querySelector("#wordBarStatus").textContent = `${wc} word${wc === 1 ? "" : "s"}, aim for ${lo} to ${hi}. ${words}`;
}

// Listening: a bar that fills while the browser voice reads the script. The voice reports "boundary" events with the
// position (charIndex) of each word it is about to say, so progress = charIndex / script length. Some voices send no
// boundary events; then the bar falls back to elapsed time against an estimate (words / 2.2 words per second).
// host is the element from listenBarHtml(). Returns { start, boundary, end, stop }.
function listenBarHtml() {
  return `<div class="pbar" id="listenBar" hidden>
    <div class="pbar-track" role="progressbar" aria-label="Audio progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0:00 of 0:00"><div class="pbar-fill"></div></div>
    <span class="pbar-time small"></span>
  </div>`;
}
function ListenBar(host, script, rate) {
  const WORDS_PER_SEC = 2.2;  // an everyday speaking speed at rate 1
  const estimate = Math.max(2, script.trim().split(/\s+/).length / (WORDS_PER_SEC * (rate || 1)));
  const fill = host.querySelector(".pbar-fill"), track = host.querySelector(".pbar-track"), time = host.querySelector(".pbar-time");
  let t0 = 0, lastChar = -1, handle = 0, done = false;
  function paint() {
    const elapsed = (Date.now() - t0) / 1000;
    const f = done ? 1 : lastChar >= 0 ? Math.min(0.99, lastChar / Math.max(1, script.length)) : Math.min(0.95, elapsed / estimate);
    const total = done ? elapsed : f > 0.08 && lastChar >= 0 ? elapsed / f : estimate;  // once words are reported, the total is worked out from the pace so far
    fill.style.transform = `scaleX(${f.toFixed(3)})`;
    const label = `${fmtTime(elapsed)} of ${fmtTime(total)}`;
    time.textContent = label;
    track.setAttribute("aria-valuenow", String(Math.round(f * 100)));
    track.setAttribute("aria-valuetext", label);
  }
  const api = {
    start() { host.hidden = false; t0 = Date.now(); lastChar = -1; done = false; paint(); clearInterval(handle); handle = setInterval(paint, 250); },
    boundary(charIndex) { if (typeof charIndex === "number") { lastChar = charIndex; paint(); } },
    end() { done = true; clearInterval(handle); handle = 0; paint(); },
    stop() { clearInterval(handle); handle = 0; }  // lets the router switch it off when the screen changes
  };
  return api;
}
