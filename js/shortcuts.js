/*
 * LEARNING NOTE (for beginners): this file adds two small comforts to the question screens.
 *   1. Keyboard shortcuts for desktop: press 1-4 (or A-D) to choose an answer, F to flag a question, N or the Right arrow for the
 *      next question, P or the Left arrow for the previous one, Enter to check answers, ? to see this list. (Esc to leave a
 *      practice already works: js/shell.js asks "Leave this practice?" first.)
 *   2. A tiny buzz (navigator.vibrate) when you pick an answer or flag a question, on phones that support it (mostly Android).
 *      It is never used when the device asks for reduced motion, and Settings has a "Vibrate on tap" switch.
 * Why the shortcuts are careful: a key press must never steal a letter you are typing into a box, so the handler does nothing
 * while focus is in a text field, a text area, a list or an editable area. It also stands aside while a pop-up box is open and
 * when Ctrl, Alt or Cmd is held (those belong to the browser).
 * The shortcuts do not do anything new: each one "clicks" the same button a mouse would (the option, the Flag button, a dot, the
 * Check Answers button), so every rule that already protects those buttons still applies.
 * Nothing here talks to the network and nothing is stored (the vibrate switch lives in the learner's settings).
 */
const Shortcuts = (function () {
  "use strict";
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const say = msg => { const a = document.getElementById("announcer"); if (a) { a.textContent = ""; a.textContent = msg; } };  // the screen-reader line already in index.html

  // ---------- Vibration ----------
  // Returns true when a buzz was asked for. "navigator.vibrate" does not exist on iPhone or most desktops, so we check first.
  function buzz() {
    try {
      if (typeof navigator.vibrate !== "function" || reduced()) return false;
      if (Storage.getSettings().vibrate === false) return false;  // the learner switched it off
      navigator.vibrate(10);                                      // 10 milliseconds: a light tick
      return true;
    } catch (e) { return false; }
  }
  // One listener for every answer pick and every flag press, whether made with a finger, a mouse or a shortcut key.
  document.addEventListener("change", e => { if (e.target.matches && e.target.matches('.question-block input[type="radio"]')) buzz(); });
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest(".flag-btn")) buzz(); });

  // ---------- Where are we? ----------
  // True when focus is somewhere the person types, so letters and arrows belong to that control.
  function typing(t) {
    if (!t || !t.tagName) return false;
    if (t.isContentEditable) return true;
    if (t.tagName === "TEXTAREA" || t.tagName === "SELECT") return true;
    if (t.tagName === "INPUT") return !["radio", "checkbox", "button", "submit", "reset"].includes(t.type);  // range, text, number, date, file ... are all "typing"
    return false;
  }
  // The question form that is on screen now (the exam's Reading tabs keep several forms, only one is visible).
  function activeForm() {
    return [...document.querySelectorAll("#app form")].find(f => f.querySelector(".question-block") && f.getClientRects().length > 0) || null;
  }
  // Which question is current: the dots (js/tools.js) mark it with aria-current="step"; question 1 until something else is chosen.
  function currentIndex(form) {
    const nav = form.previousElementSibling;
    const dot = nav && nav.querySelector && nav.querySelector('.dot[aria-current="step"]');
    const i = dot ? Number(dot.dataset.q) : 0;
    return Number.isInteger(i) ? i : 0;
  }
  const visible = el => !!el && el.getClientRects().length > 0 && !el.disabled;

  // ---------- The actions ----------
  function pick(form, optionIndex) {
    const blocks = [...form.querySelectorAll(".question-block")];
    const qi = Math.min(currentIndex(form), blocks.length - 1);
    const input = blocks[qi] && blocks[qi].querySelectorAll('input[type="radio"]')[optionIndex];
    if (!input) return;
    input.click();                                   // a real click: the answered counter and dots update as usual
    blocks[qi].focus({ preventScroll: true });       // makes this the current question (tools.js watches focus)
    blocks[qi].scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
    say("Question " + (qi + 1) + ": option " + "ABCD"[optionIndex] + " chosen");
  }
  function flag(form) {
    const qi = currentIndex(form);
    const btn = form.querySelector('.question-block[data-qi="' + qi + '"] .flag-btn');
    if (!btn) return;                                // flags are hidden in the exam and when "Practise like the real test" is on
    btn.click();
    say("Question " + (qi + 1) + (btn.getAttribute("aria-pressed") === "true" ? " flagged" : " flag removed"));
  }
  function move(form, step) {
    const dots = [...form.previousElementSibling.querySelectorAll(".dot")];
    const to = currentIndex(form) + step;
    if (to < 0 || to >= dots.length) return false;
    dots[to].click();                                // the dot scrolls to the question and focuses it
    return true;
  }

  // ---------- The shortcut list (a pop-up box built once, on first use) ----------
  const ROWS = [
    ["1 2 3 4  or  A B C D", "Choose that answer on the current question"],
    ["F", "Flag or unflag the current question"],
    ["N  or  Right arrow", "Next question (on a review screen: next passage)"],
    ["P  or  Left arrow", "Previous question"],
    ["Enter", "Check answers, when the Check Answers button is showing"],
    ["Esc", "Leave the practice (it asks first)"],
    ["?", "Show this list"]
  ];
  function openSheet() {
    let d = document.getElementById("shortcutSheet");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "shortcutSheet"; d.className = "sheet shortcut-sheet";
      d.setAttribute("aria-labelledby", "shortcutTitle");
      const body = document.createElement("div"); body.className = "dlg-body";
      const h = document.createElement("h2"); h.id = "shortcutTitle"; h.textContent = "Keyboard shortcuts";
      const note = document.createElement("p"); note.className = "muted small"; note.textContent = "They work on question screens and are ignored while you type in a box.";
      const dl = document.createElement("dl"); dl.className = "kbd-list";
      ROWS.forEach(([k, what]) => {
        const dt = document.createElement("dt"); dt.textContent = k;
        const dd = document.createElement("dd"); dd.textContent = what;
        dl.append(dt, dd);
      });
      body.append(h, note, dl);
      const act = document.createElement("div"); act.className = "dlg-actions";
      const close = document.createElement("button"); close.type = "button"; close.className = "btn btn-primary"; close.textContent = "Close";
      close.onclick = () => d.close();
      act.appendChild(close);
      d.append(body, act);
      d.addEventListener("click", e => { if (e.target === d) d.close(); });  // the dark area outside closes it
      document.body.appendChild(d);
    }
    if (!d.open && d.showModal) d.showModal();
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("[data-shortcut-sheet]")) openSheet(); });

  // ---------- The key handler ----------
  document.addEventListener("keydown", e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const t = e.target;
    if (typing(t)) return;
    if (document.querySelector("dialog[open]")) return;                 // a pop-up has the keyboard (Esc closes it natively)
    if (e.key === "?") { e.preventDefault(); openSheet(); return; }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const form = activeForm();
    if (form) {
      if (/^[1-4]$/.test(k)) { e.preventDefault(); pick(form, Number(k) - 1); }
      else if (/^[a-d]$/.test(k)) { e.preventDefault(); pick(form, k.charCodeAt(0) - 97); }
      else if (k === "f") { e.preventDefault(); flag(form); }
      else if (k === "n" || (k === "ArrowRight" && t.tagName !== "INPUT")) { e.preventDefault(); move(form, 1); }
      else if (k === "p" || (k === "ArrowLeft" && t.tagName !== "INPUT")) { e.preventDefault(); move(form, -1); }
      // Enter on the page itself submits only when NOTHING has focus (the page body). With focus on a radio button or any other control it
      // does not: a learner who is mid-answer could otherwise hand in the whole passage by accident. (Safer of the two rules considered.)
      else if (k === "Enter" && (t === document.body || t === document.documentElement || !t)) {
        const go = document.getElementById("submitPassage");
        if (visible(go)) { e.preventDefault(); go.click(); }
      }
      return;
    }
    // The review screen after a passage has no form: N or Right arrow moves on.
    if (k === "n" || k === "ArrowRight") {
      const next = document.getElementById("nextPassage");
      if (visible(next)) { e.preventDefault(); next.click(); }
    }
  });

  return { buzz, openSheet };
})();
