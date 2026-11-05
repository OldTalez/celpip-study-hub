/*
 * LEARNING NOTE (for beginners): this file runs the "shell" of the app, the frame around every screen.
 * The shell is: the left menu (sidebar) on wide screens, the top bar and bottom tab bar on phones, the "More" sheet,
 * the Light / Dark / Auto theme switch, "focus mode" (menus hidden during a practice run or the exam, with an Exit button),
 * the header that changes when you scroll, and the contents list beside a lesson.
 * It loads BEFORE js/app.js and offers one object, Shell. app.js calls Shell at three moments:
 *   Shell.beforeRender(section)  when a screen is about to be drawn (clean up and mark the current menu item),
 *   Shell.afterRender()          right after it is drawn (mark the screen title, fill the theme switches),
 *   Shell.focusMode.enter / exit when a practice run or the exam starts or ends.
 * Defaults the Board has not confirmed are collected in SETTINGS below so each can be changed in one place.
 * Nothing here talks to the network. The only thing stored is the theme choice, in localStorage under "celpip_theme".
 */
const Shell = (function () {
  "use strict";

  // ---------- The few values that are easy to change ----------
  const SETTINGS = {
    themeKey: "celpip_theme",           // the same key the old light/dark button used, so a saved "light" or "dark" still works
    themeDefault: "auto",               // "auto" = follow the device (Board default, not yet confirmed)
    // The two page colours, used for the browser's address-bar colour (<meta name="theme-color">). Keep them equal to --bg in css/style.css.
    themeColors: { light: "#f2f6f8", dark: "#0a171d" },
    // Screens that live under the "More" tab on a phone.
    moreSections: ["learn", "vocab", "grammar", "notes", "plan", "history", "settings"],
    // Sections that light up another menu item (the diagnostic belongs to Practice).
    sectionAlias: { diagnostic: "practice" },
    scrollShrinkPx: 24,                 // after this much scrolling the screen bar shrinks (wide screens)
    topbarHidePx: 8                     // on a phone, scrolling down more than this hides the top bar
  };

  const root = document.documentElement;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReduced = () => reducedQuery.matches;
  const THEMES = ["light", "dark", "auto"];
  const THEME_LABELS = { light: "Light", dark: "Dark", auto: "Auto" };

  // ---------- Theme: Light / Dark / Auto ----------
  // "pref" is what the person chose (light, dark or auto). "resolved" is what is actually shown (light or dark).
  // Anything stored that is not one of the three words is ignored, so a bad or edited value cannot break the page.
  function getPref() {
    try {
      const v = localStorage.getItem(SETTINGS.themeKey);
      return THEMES.indexOf(v) >= 0 ? v : SETTINGS.themeDefault;
    } catch (e) { return SETTINGS.themeDefault; }
  }
  function resolve(pref) { return pref === "auto" ? (darkQuery.matches ? "dark" : "light") : pref; }
  function paintTheme(pref) {
    const resolved = resolve(pref);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-pref", pref);
    // colour of the browser bar on phones: both tags get the shown theme's colour
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute("content", SETTINGS.themeColors[resolved]));
    syncThemeControls(pref);
  }
  function syncThemeControls(pref) {
    document.querySelectorAll("[data-theme-set]").forEach(b => {
      const on = b.dataset.themeSet === pref;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;  // only the chosen option is in the tab order; arrow keys move between the three
    });
    const btn = document.getElementById("themeBtn");
    if (btn) {
      btn.setAttribute("aria-label", "Theme: " + THEME_LABELS[pref] + ". Press to change.");
      btn.setAttribute("title", "Theme: " + THEME_LABELS[pref]);
    }
  }
  function setTheme(pref) {
    if (THEMES.indexOf(pref) < 0) return;
    try { localStorage.setItem(SETTINGS.themeKey, pref); } catch (e) {}
    // A short cross-fade where the browser supports View Transitions; otherwise (or under reduced motion) it just changes.
    if (document.startViewTransition && !prefersReduced()) document.startViewTransition(() => paintTheme(pref));
    else paintTheme(pref);
  }
  // Auto follows the device live: if the device switches to dark at sunset, the page follows.
  const onDeviceTheme = () => { if (getPref() === "auto") paintTheme("auto"); };
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", onDeviceTheme); else if (darkQuery.addListener) darkQuery.addListener(onDeviceTheme);

  // The segmented control (a "radio group"): three buttons, one chosen. Built from one template for all three places.
  function themeSwitchHtml() {
    return '<span class="seg-label" id="themeLabel' + (themeSwitchCount++) + '">Theme</span>' +
      '<div class="seg" role="radiogroup" aria-labelledby="themeLabel' + (themeSwitchCount - 1) + '">' +
      THEMES.map(v => '<button type="button" class="seg-opt" role="radio" aria-checked="false" tabindex="-1" data-theme-set="' + v + '">' + THEME_LABELS[v] + "</button>").join("") +
      "</div>";
  }
  let themeSwitchCount = 0;
  function fillThemeSwitches() {
    document.querySelectorAll("[data-theme-switch]").forEach(box => { if (!box.firstChild) box.innerHTML = themeSwitchHtml(); });
    syncThemeControls(getPref());
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-theme-set]");
    if (b) setTheme(b.dataset.themeSet);
    // the phone's top-bar button cycles Light > Dark > Auto
    if (e.target.closest("#themeBtn")) {
      const i = THEMES.indexOf(getPref());
      const next = THEMES[(i + 1) % THEMES.length];
      setTheme(next);
      const say = document.getElementById("announcer");
      if (say) say.textContent = "Theme: " + THEME_LABELS[next];
    }
  });
  // Arrow keys move between the three options and choose, like any radio group.
  document.addEventListener("keydown", e => {
    const b = e.target.closest && e.target.closest("[data-theme-set]");
    if (!b || ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].indexOf(e.key) < 0) return;
    e.preventDefault();
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = THEMES[(THEMES.indexOf(b.dataset.themeSet) + step + THEMES.length) % THEMES.length];
    setTheme(next);
    const group = b.closest('[role="radiogroup"]');
    const target = group && group.querySelector('[data-theme-set="' + next + '"]');
    if (target) target.focus();
  });

  // ---------- Menus: mark the current page ----------
  // Sidebar, bottom tabs and the More sheet all carry data-section. The current one gets aria-current="page"
  // (what a screen reader announces) plus the .active class; the CSS also adds a bar, bold text or a pill so it is not colour alone.
  function syncNav(section) {
    const sec = SETTINGS.sectionAlias[section] || section;
    document.querySelectorAll("[data-section]").forEach(a => {
      const on = a.dataset.section === sec;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    const more = document.getElementById("moreBtn");
    if (more) {
      if (SETTINGS.moreSections.indexOf(sec) >= 0) more.setAttribute("aria-current", "page"); else more.removeAttribute("aria-current");
    }
  }

  // ---------- Dialogs: the More sheet and the leave confirmation ----------
  // <dialog> is the browser's own pop-up: showModal() greys out the page, traps the Tab key inside, closes on Esc
  // and gives focus back to the button that opened it.
  function openMore() {
    const d = document.getElementById("moreSheet");
    if (d && !d.open && d.showModal) d.showModal();
  }
  function closeMore() {
    const d = document.getElementById("moreSheet");
    if (d && d.open) d.close();
  }
  document.addEventListener("click", e => {
    if (e.target.closest("#moreBtn")) openMore();
    if (e.target.closest("[data-close-sheet]")) closeMore();
    // tapping a link in the sheet, or the dark area outside the sheet, closes it
    const d = document.getElementById("moreSheet");
    if (d && d.open && (e.target === d || e.target.closest("#moreSheet a"))) closeMore();
  });

  // Asks "leave or keep going?" and answers true when the person chooses Leave.
  function confirmLeave(opts) {
    return new Promise(resolve => {
      const d = document.getElementById("confirmDlg");
      if (!d || !d.showModal) { resolve(window.confirm(opts.message)); return; }  // very old browser: the plain built-in question
      document.getElementById("confirmTitle").textContent = opts.title;
      document.getElementById("confirmText").textContent = opts.message;
      d.returnValue = "keep";
      const opener = opts.returnTo || document.activeElement;
      d.addEventListener("close", function done() {
        d.removeEventListener("close", done);
        const leave = d.returnValue === "leave";
        if (!leave && opener && opener.focus) opener.focus();  // staying: focus goes back to Exit
        resolve(leave);
      });
      d.showModal();
      document.getElementById("confirmKeep").focus();  // the safe choice is focused first
    });
  }

  // ---------- Focus mode ----------
  // During a practice run or the Timed Exam the menus go away so nothing distracts, and a small task bar with an Exit
  // button appears. render() in app.js calls exit() before drawing any new screen, so leaving by any route ends it.
  const focusState = { on: false, kind: "", back: "#/dashboard" };
  const focusMode = {
    // opts: { name: "Reading practice", exam: true|false, back: "#/practice/reading" }
    enter(opts) {
      opts = opts || {};
      // inside the exam each writing/speaking task calls enter() again; keep the exam settings
      if (focusState.on && focusState.kind === "exam") return;
      focusState.on = true;
      focusState.kind = opts.exam ? "exam" : "practice";
      focusState.back = opts.back || (window.location.hash || "#/dashboard");
      document.body.setAttribute("data-mode", "focus");
      document.getElementById("taskName").textContent = opts.name || "Practice";
      closeMore();
      const app = document.getElementById("app");
      if (app) app.focus({ preventScroll: true });  // focus was on a button that no longer exists
    },
    exit() {
      focusState.on = false;
      focusState.kind = "";
      document.body.removeAttribute("data-mode");
    },
    get active() { return focusState.on; },
    get kind() { return focusState.kind; },  // "practice", "exam" or "" (tools.js asks this to hide the study aids in the exam)
    // Exit button and the Esc key come here. Asks first; only "Leave" goes back.
    async ask() {
      if (!focusState.on || document.querySelector("dialog[open]")) return;
      const exam = focusState.kind === "exam";
      const exit = document.getElementById("exitBtn");  // staying puts focus back on Exit, even when Esc opened the question
      const leave = await confirmLeave(exam
        ? { title: "Leave the exam?", message: "This attempt will not be saved, and you cannot pick it up again. Leave the exam?", returnTo: exit }
        : { title: "Leave this practice?", message: "Your answers on this screen will be lost, and nothing is saved to your history. Leave this practice?", returnTo: exit });
      if (!leave) return;
      const back = exam ? "#/exam" : focusState.back;
      focusMode.exit();
      if (window.location.hash === back) render(); else navigate(back);  // render and navigate come from app.js
    }
  };
  document.addEventListener("click", e => { if (e.target.closest("#exitBtn")) focusMode.ask(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && focusState.on && !e.defaultPrevented && !document.querySelector("dialog[open]")) { e.preventDefault(); focusMode.ask(); } });  // preventDefault: otherwise the same Esc press would close the box the moment it opens

  // ---------- Header behaviour on scroll ----------
  // Wide screens: after 24px of scroll the screen bar shrinks (CSS reads html[data-scrolled]).
  // Phones: the top bar hides when scrolling down and returns on any scroll up. Reduced motion: it never hides.
  let anchorY = 0, ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      root.setAttribute("data-scrolled", y > SETTINGS.scrollShrinkPx ? "1" : "0");
      if (prefersReduced() || focusState.on) { document.body.removeAttribute("data-topbar"); anchorY = y; return; }
      if (y > anchorY + SETTINGS.topbarHidePx && y > 56) { document.body.setAttribute("data-topbar", "hidden"); anchorY = y; }
      else if (y < anchorY) { document.body.removeAttribute("data-topbar"); anchorY = y; }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------- Contents list beside a lesson (Learn) ----------
  // Looks inside `layout` for elements marked data-toc="Label" (headings, or <details> parts), gives each an id,
  // builds a list of links into the element `slot`, and highlights the section in view with an IntersectionObserver.
  let tocLockUntil = 0;  // after a click on the list, the scroll watcher stays quiet briefly so the clicked entry stays marked
  let tocObserver = null, tocWideQuery = null, tocWideHandler = null;
  function contents(layout, slot) {
    const targets = [...layout.querySelectorAll("[data-toc]")];
    if (!targets.length || !slot) return;
    targets.forEach((t, i) => { if (!t.id) t.id = "sec-" + (i + 1); t.setAttribute("tabindex", "-1"); });
    const details = document.createElement("details");
    details.className = "toc";
    details.innerHTML = '<summary>On this page</summary><nav aria-label="On this page"><ol>' +
      targets.map(t => '<li><a href="#' + t.id + '" data-toc-link="' + t.id + '"></a></li>').join("") + "</ol></nav>";
    // labels go in as text (not HTML), so lesson text can never run as code
    details.querySelectorAll("a").forEach((a, i) => { a.textContent = targets[i].dataset.toc; });
    slot.appendChild(details);
    // wide screens keep the list open; phones start collapsed
    tocWideQuery = window.matchMedia("(min-width: 1000px)");
    const summary = details.querySelector("summary");
    tocWideHandler = () => { if (tocWideQuery.matches) details.open = true; summary.tabIndex = tocWideQuery.matches ? -1 : 0; };
    tocWideQuery.addEventListener("change", tocWideHandler);
    details.addEventListener("toggle", () => { if (tocWideQuery.matches && !details.open) details.open = true; });  // cannot be closed on a wide screen
    details.open = tocWideQuery.matches;
    summary.tabIndex = tocWideQuery.matches ? -1 : 0;
    const setCurrent = id => details.querySelectorAll("a").forEach(a => {
      if (a.dataset.tocLink === id) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    setCurrent(targets[0].id);
    details.addEventListener("click", e => {
      const a = e.target.closest("a[data-toc-link]");
      if (!a) return;
      e.preventDefault();  // the address after # picks the screen in this app, so we scroll ourselves instead of changing it
      const t = document.getElementById(a.dataset.tocLink);
      if (!t) return;
      if (t.tagName === "DETAILS") t.open = true;
      t.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
      t.focus({ preventScroll: true });
      setCurrent(t.id);
      tocLockUntil = Date.now() + 900;
    });
    if ("IntersectionObserver" in window) {
      const visible = new Set();
      tocObserver = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) visible.add(en.target.id); else visible.delete(en.target.id); });
        const first = targets.find(t => visible.has(t.id));
        if (first && Date.now() > tocLockUntil) setCurrent(first.id);
      }, { rootMargin: "-80px 0px -60% 0px" });
      targets.forEach(t => tocObserver.observe(t));
    }
  }
  function cleanupContents() {
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    if (tocWideQuery && tocWideHandler) { tocWideQuery.removeEventListener("change", tocWideHandler); }
    tocWideQuery = tocWideHandler = null;
  }

  // ---------- Hooks called by app.js render() ----------
  function beforeRender(section) {
    focusMode.exit();
    closeMore();
    cleanupContents();
    syncNav(section);
    root.setAttribute("data-scrolled", "0");
    document.body.removeAttribute("data-topbar");
    anchorY = 0;
  }
  function afterRender() {
    const app = document.getElementById("app");
    // The first h1 that sits directly in the screen becomes the sticky screen bar on wide screens.
    const h1 = app && app.querySelector(":scope > h1");
    if (h1) h1.classList.add("screen-title");
    fillThemeSwitches();
  }

  // First paint of the theme controls (the inline script in index.html already set data-theme before anything drew).
  paintTheme(getPref());
  document.addEventListener("DOMContentLoaded", fillThemeSwitches);
  if (document.readyState !== "loading") fillThemeSwitches();

  return { SETTINGS, getTheme: getPref, setTheme, focusMode, contents, beforeRender, afterRender, fillThemeSwitches, confirmLeave };
})();
