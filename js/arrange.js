/*
 * LEARNING NOTE (for beginners): this file draws the "Arrange menu" card in Settings (T-033 B2a) and reacts to the learner's taps.
 * The learner can (1) move pages up and down and (2) switch "In bar" on four pages. One setting drives both the side menu (the order) and
 * the phone's bottom bar (the four chosen pages). Home is fixed: always first, always in the bar. The setting is saved per profile.
 *
 * Ideas used here:
 *   - A DRAFT is the copy of the layout the learner is editing. Only a valid draft (exactly 4 pages in the bar) is saved, and it is saved at once
 *     (there is no Save button). While the bar holds 3, the draft is just on screen: the menus keep the last saved layout and nothing is stored.
 *   - Reordering works with buttons (Move up, Move down) and a switch, not by dragging, so it works with a keyboard, a screen reader and a thumb.
 *   - All names come from the NavLayout.PAGES table and the profile name is put on the page with textContent, never as HTML.
 * The storage rules and the check of the saved value live in js/navlayout.js; this file never writes to storage itself.
 */
const Arrange = (function () {
  "use strict";
  const BAR_SIZE = 4;
  let draft = null;          // { order: [page ids], bar: [page ids in any order] }
  let slot = null;           // the element the card was mounted into
  let saving = false;        // true while THIS card is writing, so its own save does not look like "someone else changed the layout"
  let failed = false;        // true after a save the device refused; shown in the status line until the next good save
  let lastSeen = "";         // the stored layout (as text) the draft was last matched to
  const snap = () => JSON.stringify(NavLayout.get());
  const P = id => NavLayout.PAGES[id];

  function mk(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function icon(id, cls) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "ico-svg" + (cls ? " " + cls : "")); svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use"); use.setAttribute("href", "#" + id);
    svg.appendChild(use); return svg;
  }
  const say = msg => { const l = document.getElementById("arrLive"); if (l) { l.textContent = ""; setTimeout(() => { l.textContent = msg; }, 30); } };
  const inBar = id => draft.bar.indexOf(id) >= 0;
  const profileName = () => Profiles.active().name;

  // The layout to save from the draft: the bar in the same relative order as the list (the rule in NavLayout.validate).
  const toLayout = () => ({ v: 1, order: draft.order.slice(), bar: draft.order.filter(inBar) });
  // Saves the draft when it is valid. Returns "saved", "draft" (fewer than 4 chosen: nothing stored) or "failed" (the device would not store it).
  function commit() {
    if (draft.bar.length !== BAR_SIZE) { failed = false; return "draft"; }
    saving = true;
    try { failed = !NavLayout.save(toLayout()); } finally { saving = false; }
    lastSeen = snap();
    return failed ? "failed" : "saved";
  }

  function switchRow(id) {
    const home = id === "dashboard", on = inBar(id), full = draft.bar.length >= BAR_SIZE && !on;
    const b = mk("button", "arr-sw"); b.type = "button"; b.setAttribute("role", "switch"); b.setAttribute("aria-checked", String(on));
    if (home || full) b.setAttribute("aria-disabled", "true");
    b.setAttribute("data-act", "bar"); b.setAttribute("data-id", id);
    b.setAttribute("aria-label", P(id).label + ": show in bottom bar" + (home ? " (always on)" : ""));
    const track = mk("span", "arr-track"), thumb = mk("span", "arr-thumb"); thumb.appendChild(icon("i-check", "sm")); track.appendChild(thumb);
    const word = mk("span", "arr-word"); if (home) word.appendChild(icon("i-lock", "sm"));
    word.appendChild(document.createTextNode(home ? "Always in bar" : on ? "In bar" : "Not in bar"));
    b.append(track, word); return b;
  }
  function moveBtn(id, dir, i, last) {
    const home = id === "dashboard";
    const off = home || (dir === "up" ? i <= 1 : i >= last);   // Home never moves, and nothing can pass above Home
    const b = mk("button", "arr-mv"); b.type = "button"; b.setAttribute("data-act", dir); b.setAttribute("data-id", id);
    if (off) b.setAttribute("aria-disabled", "true");
    b.setAttribute("aria-label", "Move " + P(id).label + " " + dir); b.appendChild(icon(dir === "up" ? "i-up" : "i-down", "sm")); return b;
  }
  function row(id, i) {
    const li = mk("li", "arr-row"); li.setAttribute("data-id", id);
    const n = mk("span", "arr-n", String(i + 1)); n.setAttribute("aria-hidden", "true");
    const ic = icon(P(id).icon, "arr-ico");
    const mv = mk("span", "arr-mvs"); mv.append(moveBtn(id, "up", i, draft.order.length - 1), moveBtn(id, "down", i, draft.order.length - 1));
    const sw = switchRow(id); sw.classList.add("arr-sw-slot");
    li.append(n, ic, mk("span", "arr-nm", P(id).label), mv, sw);
    return li;
  }

  // Draws the whole card again from the draft. focusSel (optional) is the button that gets focus back, so a keyboard user keeps their place.
  function paint(focusSel) {
    if (!slot) return;
    const card = slot.querySelector(".arr-card"), prev = slot.querySelector(".arr-prev");
    if (!card || !prev) return;
    const n = draft.bar.length, ok = n === BAR_SIZE;
    const st = card.querySelector(".arr-status"); st.textContent = "";
    // The status only claims "Saved" when a layout really is stored; after Reset (nothing stored) it says the default is in use.
    const text = failed ? "Could not save on this device. The menus keep the last saved layout."
      : ok ? "Bottom bar: 4 of 4 chosen. " + (NavLayout.stored() ? "Saved for " + profileName() + "." : "Using the default order for " + profileName() + ".")
      : "Bottom bar: " + n + " of 4 chosen. Pick " + (BAR_SIZE - n) + " more to save.";
    st.append(icon(ok && !failed ? "i-check" : "i-plus", "sm"), document.createTextNode(text));
    st.setAttribute("data-ok", String(ok && !failed));
    const list = card.querySelector(".arr-list"); list.textContent = "";
    draft.order.forEach((id, i) => list.appendChild(row(id, i)));
    const pv = prev.querySelector(".arr-pv-list"); pv.textContent = "";
    draft.order.forEach((id, i) => { const li = mk("li"); li.append(mk("b", "", String(i + 1)), document.createTextNode(P(id).label)); pv.appendChild(li); });
    const slots = prev.querySelector(".arr-pv-bar"); slots.textContent = "";
    draft.order.filter(inBar).forEach(id => { const s = mk("span"); s.append(icon(P(id).icon, "arr-pv-ico"), document.createTextNode(P(id).short)); slots.appendChild(s); });
    for (let k = n; k < BAR_SIZE; k++) { const s = mk("span", "empty"); s.append(icon("i-plus", "arr-pv-ico"), document.createTextNode("Choose")); slots.appendChild(s); }
    if (focusSel) { const f = card.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }
  }

  function afterChange(msg, focusSel) {
    const r = commit();
    paint(focusSel);
    if (r === "failed") say("Could not save the menu on this device. The menu keeps the last saved layout.");
    else say(msg + (r === "saved" ? " Saved for " + profileName() + "." : ""));
  }
  function onClick(e) {
    const b = e.target.closest && e.target.closest("[data-act]");
    if (!b || !slot || !slot.contains(b)) return;
    const act = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    if (act === "reset") {
      draft = { order: NavLayout.IDS.slice(), bar: NavLayout.DEFAULT_BAR.slice() };
      saving = true; try { failed = !NavLayout.reset(); } finally { saving = false; }
      lastSeen = snap(); paint("[data-act=reset]");
      say(failed ? "Could not reset on this device." : "Menu reset to the default order. Nothing is saved now; the default is in use for " + profileName() + ".");
      return;
    }
    if (!NavLayout.PAGES[id] || !Object.hasOwn(NavLayout.PAGES, id)) return;      // an id from the page is checked against the table before use
    const i = draft.order.indexOf(id);
    if (act === "up" || act === "down") {
      const to = act === "up" ? i - 1 : i + 1;
      if (b.getAttribute("aria-disabled") === "true" || i < 1 || to < 1 || to >= draft.order.length) { say(P(id).label + " cannot move " + act + "."); return; }
      draft.order.splice(i, 1); draft.order.splice(to, 0, id);
      afterChange(P(id).label + " moved to position " + (to + 1) + " of " + draft.order.length + ".", '[data-act="' + act + '"][data-id="' + id + '"]');
    } else if (act === "bar") {
      if (id === "dashboard") { say("Home is always in the bottom bar."); return; }
      if (!inBar(id) && draft.bar.length >= BAR_SIZE) { say("Bottom bar is full. Turn one off first."); return; }
      if (inBar(id)) draft.bar = draft.bar.filter(x => x !== id); else draft.bar.push(id);
      const left = BAR_SIZE - draft.bar.length;
      afterChange(P(id).label + (inBar(id) ? " is in the bar." : " is not in the bar.") + (left > 0 ? " Bottom bar: " + draft.bar.length + " of 4 chosen. Pick " + left + " more to save." : ""), '[data-act="bar"][data-id="' + id + '"]');
    }
  }

  // Builds the card once into the given element (Settings calls this each time it draws; a reload also calls it from the bottom of this file).
  function mount(el) {
    if (!el || typeof NavLayout === "undefined") return;
    slot = el; slot.textContent = "";
    const cur = NavLayout.get(); lastSeen = JSON.stringify(cur);
    draft = { order: cur.order.slice(), bar: cur.bar.slice() };
    const wrap = mk("div", "arr mt");
    const card = mk("section", "card arr-card"); card.setAttribute("aria-labelledby", "arrH");
    const h = mk("h3", "", "Arrange menu"); h.id = "arrH";
    const intro = mk("p", "muted small"); intro.appendChild(document.createTextNode("Put the pages in the order you like and choose the four that sit in the bottom bar on your phone. The same order is used in the side menu. Saved for the profile "));
    const nm = mk("strong", "", profileName()); intro.append(nm, document.createTextNode(" only."));
    const status = mk("p", "arr-status");
    const live = mk("p", "sr-only"); live.id = "arrLive"; live.setAttribute("role", "status");
    const list = mk("ol", "arr-list");
    const reset = mk("button", "btn", "Reset to default"); reset.type = "button"; reset.setAttribute("data-act", "reset");
    const rp = mk("p", "arr-reset"); rp.appendChild(reset);
    card.append(h, intro, status, live, list, rp);
    const prev = mk("aside", "arr-prev"); prev.setAttribute("aria-label", "Preview");
    const pc = mk("div", "card"); const h1 = mk("h3", "", "Side menu order"), h2 = mk("h3", "", "Phone bottom bar");
    pc.append(h1, mk("ol", "arr-pv-list"), h2, mk("div", "arr-pv-bar"));
    prev.appendChild(pc);
    wrap.append(card, prev); slot.appendChild(wrap);
    paint();
  }
  // The stored layout can change under an open card: a backup import, another tab, a profile switch. Then the draft is stale and the next
  // click would save over the newer layout, so the card is drawn again from what is stored. Its own saves are skipped (saving flag).
  NavLayout.onChange(() => {
    if (saving || !slot) return;
    if (!slot.isConnected) { slot = null; return; }      // Settings was closed: nothing to refresh
    if (snap() === lastSeen) return;
    failed = false; mount(slot);
  });
  document.addEventListener("click", onClick);
  const first = document.getElementById("arrangeCard");   // a reload while Settings is open: study.js drew the screen before this file ran
  if (first) mount(first);
  return { mount };
})();
window.Arrange = Arrange;
