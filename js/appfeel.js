/*
 * LEARNING NOTE (for beginners): this file makes the web page behave like an installed phone app. It does six small jobs,
 * and none of them sends anything over the network:
 *   1. Install button: Chrome, Edge and Android offer an "install" event (beforeinstallprompt); we keep it and show an
 *      "Install app" button only when the person taps it do we open the browser's own install box. iPhone and iPad Safari have no such event,
 *      so we show the two steps instead (Share, then Add to Home Screen). Nothing pops up by itself, and once the app is
 *      installed (display-mode: standalone) the button disappears.
 *   2. Update notice: the offline helper (sw.js) is registered here. When a new version takes over, the page hears a
 *      "controllerchange" event and shows a "New version ready" toast with a Refresh button. It never reloads by itself,
 *      and it waits while a practice run or the exam is going.
 *   3. Offline label: a small "Offline" pill appears while the device has no connection.
 *   4. Keeping data safe: we ask the browser once, after the first saved attempt, to protect our stored data from
 *      automatic clean-up (navigator.storage.persist), remember its answer, and show it in Settings. A monthly, dismissable
 *      "Export a backup" reminder sits on Home.
 *   5. Icon badge: the app icon shows how many mistakes are due for review (navigator.setAppBadge), where supported.
 *   6. Every browser feature is checked first ("feature detection"), so older browsers simply skip it without errors.
 * Stored in localStorage (small text records, not part of the exported backup): "celpip_persist_v1" and "celpip_backup_v1".
 * It loads after study.js because it uses Toast (tools.js), Storage (storage.js) and Study (study.js).
 */
window.AppFeel = (function () {  // on window (not const) so study.js can test "is it loaded yet?" with window.AppFeel
  "use strict";
  const PERSIST_KEY = "celpip_persist_v1";  // old fixed label; the stored label carries the learner id (Profiles.key)  // { asked: "2026-11-05", granted: true|false }
  const BACKUP_KEY = "celpip_backup_v1";    // { first: date first seen, last: date of last export, snooze: no reminder before this date }
  const BACKUP_DAYS = 30;
  const OFFLINE_TEXT = "Everything works offline except speech-to-text transcripts.";
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  // ---------- Small safe helpers ----------
  // Reads a stored record and keeps only the fields we expect, so a hand-edited or corrupt value cannot cause trouble.
  function readRecord(key) {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(Profiles.key(key))); } catch (e) { raw = null; }
    const out = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      ["asked", "first", "last", "snooze"].forEach(k => { if (typeof raw[k] === "string" && ISO_DATE.test(raw[k])) out[k] = raw[k]; });
      if (typeof raw.granted === "boolean") out.granted = raw.granted;
    }
    return out;
  }
  function writeRecord(key, obj) { try { localStorage.setItem(Profiles.key(key), JSON.stringify(obj)); } catch (e) {} }
  const todayStr = () => window.Study.today();
  function daysBetween(a, b) { return Math.floor((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000); }
  function plusDays(date, n) { const d = new Date(Date.parse(date + "T00:00:00Z") + n * 86400000); return d.toISOString().slice(0, 10); }
  const hasAttempts = () => typeof Storage !== "undefined" && !!Storage.getHistory && Storage.getHistory().length > 0;  // note: the page's own Storage object, not the browser's built-in one of the same name
  const svgIcon = (id, cls) => '<svg class="' + cls + '" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="#' + id + '"/></svg>';

  // ---------- 1. Install ----------
  let deferredPrompt = null;  // the browser's install event, kept until the person taps the button
  const standaloneQuery = window.matchMedia("(display-mode: standalone)");
  const isInstalled = () => standaloneQuery.matches || navigator.standalone === true;  // navigator.standalone is the iPhone's way of saying it
  function isIosDevice() {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);  // an iPad can pose as a Mac
  }
  function installMode() {
    if (isInstalled()) return "none";
    if (deferredPrompt) return "prompt";
    if (isIosDevice()) return "ios";
    return "none";  // a browser with no install route here: show nothing rather than a dead button
  }
  function installHtml(mode) {
    const intro = '<h3>Install the app</h3><p class="muted small">Opens full screen from your home screen or desktop, works offline, and keeps your progress on this device.</p>';
    if (mode === "prompt") return intro + '<button type="button" class="btn btn-primary" data-install-go>' + svgIcon("i-install", "btn-ico") + 'Install app</button>';
    return intro + '<ol class="install-steps"><li>Tap the Share button ' + svgIcon("i-share", "share-ico") + ' in Safari\'s toolbar (the square with an arrow pointing up).</li>' +
      '<li>Scroll down and choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</li></ol>';
  }
  function fillInstall() {
    const mode = installMode();
    document.querySelectorAll("[data-install-box]").forEach(box => {
      box.dataset.installMode = mode;
      box.hidden = mode === "none";
      box.innerHTML = mode === "none" ? "" : installHtml(mode);
    });
  }
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; fillInstall(); });  // preventDefault: no automatic mini-bar; the person chooses
  window.addEventListener("appinstalled", () => { deferredPrompt = null; fillInstall(); maybePersist(true); });
  if (standaloneQuery.addEventListener) standaloneQuery.addEventListener("change", fillInstall);
  document.addEventListener("click", async e => {
    if (!e.target.closest("[data-install-go]") || !deferredPrompt) return;
    const ev = deferredPrompt;
    deferredPrompt = null;  // an install event can be used only once
    try { await ev.prompt(); await ev.userChoice; } catch (err) {}
    fillInstall();
  });

  // ---------- 2. Update notice ----------
  let updatePending = false;
  function maybeShowUpdate() {
    if (!updatePending || (typeof Shell !== "undefined" && Shell.focusMode.active)) return;  // never in the middle of practice or the exam
    if (document.querySelector(".toast[data-sticky]")) return;               // already showing
    toast("New version ready", "info", { action: { label: "Refresh", onClick: () => location.reload() } });
  }
  function registerWorker() {
    if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
    const hadController = !!navigator.serviceWorker.controller;  // false on the very first visit, when the helper simply takes over
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController) { updatePending = true; maybeShowUpdate(); } });
    addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(reg => {
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          if (w) w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) { updatePending = true; maybeShowUpdate(); } });
        });
      }).catch(() => {});
    });
    // An app left open for days only checks for news when it comes back to the front.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") navigator.serviceWorker.getRegistration().then(r => { if (r) r.update().catch(() => {}); }).catch(() => {});
    });
  }

  // ---------- 3. Offline label ----------
  function paintOnline() {
    const offline = navigator.onLine === false;
    document.querySelectorAll("[data-offline-pill]").forEach(p => {
      if (!p.firstChild) {
        p.innerHTML = svgIcon("i-offline", "btn-ico") + "<span>Offline</span>";
        const note = document.createElement("span");
        note.className = "offline-note"; note.textContent = OFFLINE_TEXT;
        p.appendChild(note);
        p.title = OFFLINE_TEXT;
      }
      p.hidden = !offline;
    });
  }
  window.addEventListener("online", paintOnline);
  window.addEventListener("offline", paintOnline);

  // ---------- 4. Keeping data safe ----------
  let persistBusy = false;
  async function maybePersist(force) {
    if (persistBusy || !(navigator.storage && navigator.storage.persist) || readRecord(PERSIST_KEY).asked) return;
    if (!force && !hasAttempts()) return;  // ask after the first saved attempt (or on install), not on the first visit
    persistBusy = true;
    let granted = false;
    try { granted = !!(await navigator.storage.persist()); } catch (e) { granted = false; }
    writeRecord(PERSIST_KEY, { asked: todayStr(), granted });
    persistBusy = false;
  }
  // Fills the sentence in Settings. The browser's live answer wins over the saved one.
  async function showPersistState(el) {
    if (!el) return;
    let yes = !!readRecord(PERSIST_KEY).granted;
    try { if (navigator.storage && navigator.storage.persisted) yes = !!(await navigator.storage.persisted()); } catch (e) {}
    el.dataset.persistState = yes ? "yes" : "no";
    el.textContent = yes ? "Protected from automatic clean-up" : "Not protected — export a backup now and then";
  }
  // Notes today as the day of the last backup (also used by the share-sheet backup in js/transfer.js). A new backup clears any snooze.
  function recordBackup() {
    const rec = readRecord(BACKUP_KEY);
    writeRecord(BACKUP_KEY, { first: rec.first || todayStr(), last: todayStr() });
  }
  function exportBackup() {
    Study.download("celpip-backup-" + todayStr() + ".json", JSON.stringify(Storage.exportAll(), null, 1), "application/json");
    recordBackup();
  }
  function backupDue() {
    if (!hasAttempts()) return false;
    const t = todayStr(), rec = readRecord(BACKUP_KEY);
    if (!rec.first) { rec.first = t; writeRecord(BACKUP_KEY, rec); }  // the month counts from the first time we noticed progress
    if (rec.snooze && rec.snooze > t) return false;
    const since = rec.last && rec.last > rec.first ? rec.last : rec.first;
    return daysBetween(since, t) >= BACKUP_DAYS;
  }
  // The reminder card for Home. Returns "" when nothing is due.
  function backupReminderHtml() {
    if (!backupDue()) return "";
    return '<section class="card tile span-4 backup-note" aria-labelledby="backupTitle"><h2 id="backupTitle">Export a backup</h2>' +
      '<p>It has been a month. Save a copy of your progress as a file in case this browser loses its stored data.</p>' +
      '<div class="cta-row-single"><button type="button" class="btn btn-primary" data-backup-export>Export a backup</button>' +
      '<button type="button" class="btn" data-backup-dismiss>Not now</button></div></section>';
  }
  document.addEventListener("click", e => {
    if (e.target.closest("[data-backup-export]")) { exportBackup(); toast("Backup exported"); if (window.render) render(); }
    else if (e.target.closest("[data-backup-dismiss]")) {
      const rec = readRecord(BACKUP_KEY);
      writeRecord(BACKUP_KEY, { first: rec.first || todayStr(), last: rec.last, snooze: plusDays(todayStr(), BACKUP_DAYS) });
      if (window.render) render();
    }
  });

  // ---------- 5. Icon badge ----------
  function updateBadge() {
    if (!("setAppBadge" in navigator)) return;  // not supported here: do nothing
    try {
      const n = window.Study ? Study.dueMistakeCount() : 0;
      const done = n > 0 ? navigator.setAppBadge(n) : (navigator.clearAppBadge ? navigator.clearAppBadge() : navigator.setAppBadge(0));
      if (done && done.catch) done.catch(() => {});  // the browser may refuse; that is fine
    } catch (e) {}
  }

  // ---------- Start-up and screen changes ----------
  function onScreenChange() { maybePersist(false); updateBadge(); maybeShowUpdate(); }
  window.addEventListener("hashchange", onScreenChange);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") updateBadge(); });
  registerWorker();
  fillInstall();
  paintOnline();
  maybePersist(false);
  updateBadge();
  showPersistState(document.getElementById("persistMsg"));  // a reload while Settings is open: study.js drew the screen before this file ran

  return { fillInstall, showPersistState, exportBackup, recordBackup, backupReminderHtml, updateBadge, installMode };
})();
