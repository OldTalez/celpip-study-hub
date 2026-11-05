/*
 * LEARNING NOTE (for beginners): this file draws the parts of the app that deal with "who is studying?".
 *   - A profile button in the left menu and in the More sheet (a round initial plus the name). Tapping it opens the chooser.
 *   - The "Who's studying?" chooser: a pop-up box (a <dialog>) listing the profiles, with a field to add one.
 *   - The Profiles card in Settings: rename, delete (asks twice, names the profile), add, and "ask me who is studying when the app opens".
 *   - Ask.choose(): a small reusable "pick one of these buttons" pop-up that other files use (the QR receiver asks "Add as new
 *     profile or Replace this profile?" with it).
 * The data side (names, ids, which profile is active, moving old notes into the first profile) lives in js/profiles.js.
 * Rules this file follows:
 *   - Every name is put on the page with textContent (or a <dialog> built from createElement), never as HTML, so a name such as
 *     <img src=x onerror=alert(1)> is shown as plain text and runs nothing.
 *   - Switching profile calls render() (js/app.js). render() already stops timers, the camera, the microphone and speech and clears
 *     the old screen, so nothing from one learner's screen leaks into the next learner's.
 *   - Switching is not offered during a practice run or the exam (the menus are hidden then); the code also refuses it.
 */
const ProfileUI = (function () {
  "use strict";
  const say = msg => { const a = document.getElementById("announcer"); if (a) { a.textContent = ""; a.textContent = msg; } };
  const initial = name => (Array.from(name || "?")[0] || "?").toUpperCase();
  function mk(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function avatar(name) { const a = mk("span", "avatar", initial(name)); a.setAttribute("aria-hidden", "true"); return a; }

  // ---------- A small "choose a button" pop-up ----------
  // opts: { title, message, buttons: [{ label, value, primary, danger }], safe: value of the button that gets focus first }
  // Answers with the chosen value, or null when closed with Esc or by tapping outside.
  function choose(opts) {
    return new Promise(resolve => {
      const d = mk("dialog", "ask-dlg");
      const title = mk("h2", "", opts.title); title.id = "askTitle" + Date.now();
      d.setAttribute("aria-labelledby", title.id);
      const body = mk("div", "dlg-body"); body.appendChild(title);
      if (opts.message) body.appendChild(mk("p", "", opts.message));
      const act = mk("div", "dlg-actions");
      let safeBtn = null, answer = null;
      opts.buttons.forEach(b => {
        const btn = mk("button", "btn" + (b.primary ? " btn-primary" : "") + (b.danger ? " btn-danger" : ""), b.label);
        btn.type = "button";
        btn.onclick = () => { answer = b.value; d.close(); };
        if (b.value === opts.safe) safeBtn = btn;
        act.appendChild(btn);
      });
      d.append(body, act);
      d.addEventListener("click", e => { if (e.target === d) d.close(); });
      d.addEventListener("close", () => { d.remove(); resolve(answer); });
      document.body.appendChild(d);
      if (d.showModal) d.showModal(); else { d.setAttribute("open", ""); }
      (safeBtn || act.firstChild).focus();   // the safe choice is focused first
    });
  }

  // ---------- Switching ----------
  function switchTo(id) {
    if (typeof Shell !== "undefined" && Shell.focusMode.active) return false;  // never in the middle of a practice run or the exam
    if (id === Profiles.activeId) return true;
    return Profiles.switchTo(id);   // the change listener below repaints and calls render()
  }
  Profiles.onChange(why => {
    fillSwitches();
    if (why === "switch") {
      if (window.Study && Study.resetTransient) Study.resetTransient();
      say("Now studying as " + Profiles.active().name);
      if (window.toast) toast("Now studying as " + Profiles.active().name, "info");
    }
    if (window.AppFeel) AppFeel.updateBadge();
    if (window.render) render();    // clears per-screen state (timers, camera, recorder) and redraws with the new learner's data
  });

  // ---------- The profile button (left menu and More sheet) ----------
  function fillSwitches() {
    const p = Profiles.active();
    document.querySelectorAll("[data-profile-switch]").forEach(box => {
      box.textContent = "";
      const b = mk("button", "profile-btn"); b.type = "button"; b.dataset.profileOpen = "";
      b.setAttribute("aria-haspopup", "dialog");
      b.setAttribute("aria-label", "Studying as " + p.name + ". Switch or add a profile");
      const label = mk("span", "profile-label");
      label.append(mk("span", "profile-name", p.name), mk("span", "profile-sub small muted", Profiles.list().length > 1 ? "Switch profile" : "Add a profile"));
      b.append(avatar(p.name), label);
      box.appendChild(b);
    });
  }
  document.addEventListener("click", e => {
    if (e.target.closest && e.target.closest("[data-profile-open]")) {
      const more = document.getElementById("moreSheet");
      if (more && more.open) more.close();   // one box at a time
      openChooser();
    }
  });

  // ---------- The "Who's studying?" chooser ----------
  let chooser = null;
  function paintChooser() {
    const list = chooser.querySelector(".who-list"); list.textContent = "";
    const cur = Profiles.activeId;
    Profiles.list().forEach(p => {
      const li = mk("li"), b = mk("button", "who-item"); b.type = "button"; b.dataset.profileId = p.id;
      if (p.id === cur) { b.setAttribute("aria-current", "true"); }
      b.append(avatar(p.name), mk("span", "who-name", p.name), mk("span", "who-state small", p.id === cur ? "Studying now" : ""));
      b.onclick = () => { chooser.close(); switchTo(p.id); };
      li.appendChild(b); list.appendChild(li);
    });
    chooser.querySelector(".who-ask").checked = Profiles.ask;
    chooser.querySelector(".who-ask-row").hidden = Profiles.list().length < 2;
    const full = Profiles.list().length >= Profiles.MAX_PROFILES;
    chooser.querySelector(".who-add-row").hidden = full;
  }
  function buildChooser() {
    const d = mk("dialog", "sheet who-dlg"); d.id = "whoDlg"; d.setAttribute("aria-labelledby", "whoTitle");
    const body = mk("div", "dlg-body");
    const h = mk("h2", "", "Who's studying?"); h.id = "whoTitle";
    body.append(h, mk("p", "muted small", "Each profile keeps its own history, settings, words and plan on this device."), mk("ul", "who-list"));
    const add = mk("div", "who-add-row");
    const lab = mk("label", "field-label", "Add a profile"); lab.htmlFor = "whoNewName";
    const inp = mk("input"); inp.type = "text"; inp.id = "whoNewName"; inp.maxLength = Profiles.NAME_MAX; inp.autocomplete = "off"; inp.placeholder = "Name (up to 40 letters)";
    const addBtn = mk("button", "btn", "Add"); addBtn.type = "button"; addBtn.id = "whoAddBtn";
    const msg = mk("p", "muted small who-msg"); msg.setAttribute("role", "status");
    const doAdd = () => {
      const p = Profiles.create(inp.value);
      if (p === false) { msg.textContent = "This device's storage is full, so the profile was not added. Export a backup or free space."; toast("Profile not added: storage is full", "error"); return; }
      if (!p) { msg.textContent = Profiles.cleanName(inp.value) ? "You can have up to " + Profiles.MAX_PROFILES + " profiles on one device." : "Type a name first."; return; }
      inp.value = ""; d.close(); switchTo(p.id);
    };
    addBtn.onclick = doAdd;
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); doAdd(); } });
    add.append(lab, inp, addBtn, msg);
    const askRow = mk("label", "check-item who-ask-row");
    const cb = mk("input", "who-ask"); cb.type = "checkbox";
    cb.onchange = () => Profiles.setAsk(cb.checked);
    askRow.append(cb, mk("span", "", "Ask who's studying when the app opens"));
    const manage = mk("a", "small", "Manage profiles in Settings"); manage.href = "#/settings";
    manage.addEventListener("click", () => d.close());
    body.append(add, askRow, manage);
    const act = mk("div", "dlg-actions");
    const close = mk("button", "btn", "Close"); close.type = "button"; close.onclick = () => d.close();
    act.appendChild(close);
    d.append(body, act);
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
    document.body.appendChild(d);
    return d;
  }
  function openChooser() {
    if (typeof Shell !== "undefined" && Shell.focusMode.active) return;
    if (!chooser) chooser = buildChooser();
    chooser.querySelector(".who-msg").textContent = "";
    paintChooser();
    if (!chooser.open && chooser.showModal) chooser.showModal();
    const cur = chooser.querySelector('[aria-current="true"]'); if (cur) cur.focus();
  }
  Profiles.onChange(() => { if (chooser) paintChooser(); });

  // ---------- The Profiles card in Settings ----------
  async function confirmDelete(p) {
    const first = await choose({ title: "Delete “" + p.name + "”?", message: "This erases this profile's history, words, notes and settings from this device. Other profiles are not touched.",
      buttons: [{ label: "Keep it", value: "keep", primary: true }, { label: "Delete…", value: "go", danger: true }], safe: "keep" });
    if (first !== "go") return false;
    const second = await choose({ title: "Really delete “" + p.name + "”?", message: "This cannot be undone. If you might want it back, export a backup first.",
      buttons: [{ label: "No, keep it", value: "keep", primary: true }, { label: "Delete “" + p.name + "” forever", value: "go", danger: true }], safe: "keep" });
    return second === "go";
  }
  function mountManage(slot) {
    slot.textContent = "";
    const card = mk("div", "card mt");
    card.append(mk("h3", "", "Profiles"), mk("p", "muted small", "Share one device. Each profile has its own history, settings, study time, plan, words, grammar, mistakes and notes. The theme is shared."));
    const ul = mk("ul", "prof-list");
    const list = Profiles.list();
    list.forEach(p => {
      const li = mk("li", "prof-row");
      const name = mk("span", "prof-name", p.name);
      const isCur = p.id === Profiles.activeId;
      li.append(avatar(p.name), name, mk("span", "small muted", isCur ? "Studying now" : ""));
      const ren = mk("button", "btn btn-sm", "Rename"); ren.type = "button"; ren.dataset.rename = p.id;
      ren.setAttribute("aria-label", "Rename " + p.name);
      const del = mk("button", "btn btn-sm", "Delete"); del.type = "button"; del.dataset.del = p.id;
      del.setAttribute("aria-label", "Delete " + p.name);
      if (list.length < 2) { del.disabled = true; del.title = "You need at least one profile"; }
      ren.onclick = () => {
        li.textContent = "";
        const inp = mk("input"); inp.type = "text"; inp.maxLength = Profiles.NAME_MAX; inp.value = p.name; inp.setAttribute("aria-label", "New name for " + p.name);
        const ok = mk("button", "btn btn-sm btn-primary", "Save"); ok.type = "button";
        const no = mk("button", "btn btn-sm", "Cancel"); no.type = "button";
        const save = () => { if (Profiles.rename(p.id, inp.value)) { toast("Renamed", "ok"); } else mountManage(slot); };
        ok.onclick = save; no.onclick = () => mountManage(slot);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); save(); } else if (e.key === "Escape") { e.stopPropagation(); mountManage(slot); } });
        li.append(inp, ok, no); inp.focus(); inp.select();
      };
      del.onclick = async () => { if (await confirmDelete(p)) { Profiles.remove(p.id); } };
      li.append(ren, del);
      ul.appendChild(li);
    });
    card.appendChild(ul);
    if (list.length < 2) card.appendChild(mk("p", "muted small", "You need at least one profile, so the last one cannot be deleted."));
    if (list.length < Profiles.MAX_PROFILES) {
      const row = mk("div", "prof-add");
      const lab = mk("label", "field-label", "Add a profile"); lab.htmlFor = "profNewName";
      const inp = mk("input"); inp.type = "text"; inp.id = "profNewName"; inp.maxLength = Profiles.NAME_MAX; inp.autocomplete = "off";
      const add = mk("button", "btn", "Add profile"); add.type = "button"; add.id = "profAddBtn";
      const doAdd = () => { const p = Profiles.create(inp.value); if (p) { toast("Profile added", "ok"); } else { inp.setAttribute("aria-invalid", "true"); if (p === false) toast("Profile not added: storage is full", "error"); } };
      add.onclick = doAdd;
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); doAdd(); } });
      row.append(lab, inp, add);
      card.appendChild(row);
    }
    const askRow = mk("label", "check-item");
    const cb = mk("input"); cb.type = "checkbox"; cb.id = "profAsk"; cb.checked = Profiles.ask;
    cb.onchange = () => Profiles.setAsk(cb.checked);
    askRow.append(cb, mk("span", "", "Ask who's studying when the app opens"));
    card.appendChild(askRow);
    slot.appendChild(card);
  }

  // ---------- Start-up ----------
  window.addEventListener("storage", e => {          // another tab changed the profile list
    if (e.key !== Profiles.INDEX_KEY) return;
    const changed = Profiles.reload();
    fillSwitches();
    if (changed) { if (window.Study && Study.resetTransient) Study.resetTransient(); if (window.render) render(); }
  });
  fillSwitches();
  const slot = document.getElementById("profilesCard");   // a reload while Settings is open: study.js drew the screen before this file ran
  if (slot) mountManage(slot);
  if (Profiles.ask && Profiles.list().length > 1) openChooser();

  return { choose, switchTo, openChooser, mountManage, fillSwitches };
})();
window.ProfileUI = ProfileUI;   // so js/study.js can ask "is it loaded yet?" with window.ProfileUI
