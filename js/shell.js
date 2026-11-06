/*
 * LEARNING NOTE (for beginners): this file runs the "shell" of the app, the frame around every screen.
 * The shell is: the menu (on wide screens an ICON RAIL, or the bigger ISLAND menu that is pinned or opens over the page; on a phone the same island
 * is a SIDE DRAWER that slides in from the left), the top bar (always there, with the theme button), the floating bottom bar on phones (four items),
 * the Light / Dark / Auto theme (the top-bar button cycles the three choices; the phone drawer also keeps the three icon buttons), the
 * colour of the phone's status strip (the one <meta name="theme-color"> tag, rewritten on every theme change), "focus mode" (menus hidden during a practice run or the exam, with a task bar: logo mark, Exit button, title),
 * the logo that always goes Home (and asks first during practice or the exam), and what happens when you scroll down: the top bar COLLAPSES.
 * (T-033 turn A and B1a, 2026-11-05; the behaviour was approved by the Board as the "Variant A" demo.)
 * It loads BEFORE js/app.js and offers one object, Shell. app.js calls Shell at three moments:
 *   Shell.beforeRender(section)  when a screen is about to be drawn (clean up and mark the current menu item),
 *   Shell.afterRender()          right after it is drawn (mark the screen title, fill the theme switches),
 *   Shell.focusMode.enter / exit when a practice run or the exam starts or ends.
 * The wide menu has two resting forms. At 1200px and up it is the pinned island unless the learner folded it (the X button), in which case it is
 * the rail. From 1000 to 1199px it is always the rail. When the page is scrolled down ("collapsed") the pinned island or the rail FADES away
 * and only its logo stays, turning into a hamburger button; that button, the rail's Expand button (1000 to 1199px) and the phone's menu button open
 * the island as an OVERLAY (dimmed page, focus kept inside, Esc, the X or the dimmed area closes it, focus goes back to where it came from).
 * The choice pinned/rail is stored in localStorage under "celpip_sidebar" ("open" or "folded"; folded means rail).
 * Attributes on <html> tell the CSS what to show: data-nav="pinned|rail", data-overlay="open", data-collapsed="1" (scrolled down),
 * data-scrolled="1" (more than 24px down) and data-title="1" (close enough to the top that the page title shows).
 * Defaults the Board has not confirmed are collected in SETTINGS below so each can be changed in one place.
 * T-035: on a phone (no hover) the top bar's brand folds into the logo mark now and then (section "The idle logo"; Shell.idleLogo is for the tests).
 * Nothing here talks to the network. The only things stored are the theme choice ("celpip_theme") and the pinned/folded choice ("celpip_sidebar").
 */
const Shell = (function () {
  "use strict";

  // ---------- The few values that are easy to change ----------
  const SETTINGS = {
    themeKey: "celpip_theme",           // the same key the old light/dark button used, so a saved "light" or "dark" still works
    themeDefault: "auto",               // "auto" = follow the device (Board default, not yet confirmed)
    // Only a fallback: the colour of the phone's status strip is read from --bg in css/style.css on every theme change (spec section 3).
    themeColors: { light: "#FFFFFF", dark: "#000000" },
    // The four pages in the phone's bottom bar, in order. The drawer lists every other page (Board ruling, D5).
    barSections: ["dashboard", "practice", "plan", "exam"],
    // Sections that light up another menu item (the diagnostic belongs to Practice).
    sectionAlias: { diagnostic: "practice", transfer: "settings" },
    pinMinWidth: 1200,                  // from this width the island can be pinned; between 1000 and this the rail is used (spec section 7)
    scrolledPx: 24,                     // after this much scrolling the bar gets its bottom line (html[data-scrolled])
    // Collapsing top bar, spec 21.5. y = scroll position read inside the scroll event; run = distance scrolled in the current direction.
    collapseTopPx: 24,                  // at or above this y the bar is always shown
    collapseAfterY: 96,                 // the bar collapses only when y is MORE than this ...
    collapseRunDown: 24,                // ... and the downward run is more than this (so the earliest collapse is at y = 97)
    // The bar returns after an upward run of this share of the window height (Board, 2026-11-05: it came back too easily mid-page; the demo's RUN_UP_SCREENS).
    // Reaching the top (y at or below collapseTopPx) always restores it.
    expandRunUpScreens: 0.6,
    titleMaxY: 160,                     // the page title (greeting) only shows when y is at or below this; a bar that returns mid-page leaves it hidden
    glideMs: 420,                       // how long the column glides when the sidebar is folded or pinned (matches --dur-4 in the CSS)
    collapseMinScrollable: 0.5          // rule 5: a page that can scroll less than this share of the window height never collapses (spec says "about one screen"; 50% is our reading, change here)
  };

  const root = document.documentElement;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReduced = () => reducedQuery.matches;
  const THEMES = ["light", "dark", "auto"];
  const THEME_LABELS = { light: "Light", dark: "Dark", auto: "Auto" };
  // The full spoken name of each option (used for aria-label and the hover tooltip, since the buttons show only a picture).
  const THEME_NAMES = { light: "Light", dark: "Dark", auto: "Auto (follow device)" };
  // Which drawing in the icon sprite (index.html) pictures each option. Auto uses the half-filled circle.
  const THEME_ICONS = { light: "#i-sun", dark: "#i-moon", auto: "#i-theme" };

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
    // colour of the phone's status strip and browser bar: the ONE theme-color tag gets the page colour of the theme now showing.
    // It is read from the CSS (--bg) so there is a single place to change a colour; the values in SETTINGS are only a fallback.
    const meta = document.getElementById("metaTheme");
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim() || SETTINGS.themeColors[resolved]);
    syncThemeControls(pref);
  }
  function syncThemeControls(pref) {
    // The top-bar button (and the same button in the collapsed island) pictures the CURRENT choice; its name says what it is and what pressing does.
    document.querySelectorAll("[data-theme-btn]").forEach(btn => {
      btn.setAttribute("aria-label", "Theme: " + THEME_LABELS[pref] + ", change");
      btn.setAttribute("title", "Theme: " + THEME_LABELS[pref]);
      const use = btn.querySelector("use");
      if (use) use.setAttribute("href", THEME_ICONS[pref]);
    });
  }
  function setTheme(pref) {
    if (THEMES.indexOf(pref) < 0) return;
    try { localStorage.setItem(SETTINGS.themeKey, pref); } catch (e) {}
    // A short cross-fade where the browser supports View Transitions; otherwise (or under reduced motion) it just changes.
    if (document.startViewTransition && !prefersReduced()) document.startViewTransition(() => paintTheme(pref)).ready.catch(() => {});   // .catch: a newer transition may skip this one; that is fine
    else paintTheme(pref);
  }
  // Auto follows the device live: if the device switches to dark at sunset, the page follows.
  const onDeviceTheme = () => { if (getPref() === "auto") paintTheme("auto"); };
  if (darkQuery.addEventListener) darkQuery.addEventListener("change", onDeviceTheme); else if (darkQuery.addListener) darkQuery.addListener(onDeviceTheme);

  // (The three-button theme switch that lived in the phone More sheet is gone with the sheet: the button in the bar, the pill and the top right cycles the three choices.)
  function fillThemeSwitches() { syncThemeControls(getPref()); }   // app.js calls this after every screen; it re-pictures the theme buttons
  document.addEventListener("click", e => {
    // the top-bar button (and the pill's copy of it) cycles Light > Dark > Auto
    if (e.target.closest("[data-theme-btn]")) {
      const i = THEMES.indexOf(getPref());
      const next = THEMES[(i + 1) % THEMES.length];
      setTheme(next);
      document.querySelectorAll("[data-theme-btn]").forEach(b => { b.classList.remove("turn"); void b.offsetWidth; b.classList.add("turn"); });   // CSS: the icon spins in
      const say = document.getElementById("announcer");
      if (say) say.textContent = "Theme: " + THEME_LABELS[next];
    }
  });
  // ---------- Menus: mark the current page ----------
  // Sidebar, bottom bar and rail all carry data-section. The current one gets aria-current="page"
  // (what a screen reader announces) plus the .active class; the CSS also adds a bar, bold text or a pill so it is not colour alone.
  let currentSection = "";
  function syncNav(section) {
    currentSection = section;
    const sec = (Object.hasOwn(SETTINGS.sectionAlias, section) && SETTINGS.sectionAlias[section]) || section;   // hasOwn: a URL word like "constructor" is not an alias
    document.querySelectorAll("[data-section]").forEach(a => {
      const on = a.dataset.section === sec;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  // ---------- Dialogs: the leave confirmation ----------
  // <dialog> is the browser's own pop-up: showModal() greys out the page, traps the Tab key inside, closes on Esc
  // and gives focus back to the button that opened it.

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
  // During a practice run or the Timed Exam the menus go away so nothing distracts, and a task bar appears: the logo mark (a link to Home that
  // asks first), an Exit button and the title in two parts, the kind of work over the part ("Timed Exam" over "Reading"; on a wide screen
  // "Timed Exam: Reading"). render() in app.js calls exit() before drawing any new screen, so leaving by any route ends it.
  const focusState = { on: false, kind: "", back: "#/dashboard", draft: false };
  // "Reading practice" becomes the two parts "Practice" and "Reading"; a name that does not end that way (the exam) is the first part alone.
  function splitName(name) {
    const m = /^(.+) (practice|timed section)$/.exec(name);
    return m ? [m[2].charAt(0).toUpperCase() + m[2].slice(1), m[1]] : [name, ""];
  }
  function setTitle(first, second) {
    const box = document.getElementById("taskName");
    if (!box) return;
    box.querySelector(".n1").textContent = first;
    box.querySelector(".n2").textContent = second || "";
    if (second) box.setAttribute("data-split", ""); else box.removeAttribute("data-split");  // the CSS adds a colon between the two parts on a wide screen
  }
  const focusMode = {
    // opts: { name: "Reading practice", exam: true|false, back: "#/practice/reading" }
    enter(opts) {
      opts = opts || {};
      // inside the exam each writing/speaking task calls enter() again; keep the exam settings
      if (focusState.on && focusState.kind === "exam") return;
      focusState.on = true;
      focusState.kind = opts.exam ? "exam" : "practice";
      focusState.draft = !!opts.draft;   // true when leaving keeps a draft (Reading, Listening, Writing practice)
      focusState.back = opts.back || (window.location.hash || "#/dashboard");
      document.body.setAttribute("data-mode", "focus");
      const parts = splitName(opts.name || "Practice");
      setTitle(parts[0], parts[1]);
      closeOverlay(true);
      setCollapsed(false);
      const app = document.getElementById("app");
      if (app) app.focus({ preventScroll: true });  // focus was on a button that no longer exists
    },
    exit() {
      focusState.on = false;
      focusState.kind = "";
      document.body.removeAttribute("data-mode");
    },
    // The exam names the part it is in ("Listening", "Reading", "Writing", "Speaking") so the task bar can show it.
    setSection(label) { if (focusState.on && focusState.kind === "exam") setTitle("Timed Exam", label); },
    get active() { return focusState.on; },
    get kind() { return focusState.kind; },  // "practice", "exam" or "" (tools.js asks this to hide the study aids in the exam)
    // The Exit button, the Esc key and the logo come here: ONE question for all three. Only "Leave" goes on.
    // opts.to is where Leave goes (Exit: back to the page the learner came from; the logo: Home); opts.returnTo is what gets focus if they stay.
    async ask(opts) {
      opts = opts || {};
      if (!focusState.on || document.querySelector("dialog[open]")) return;
      const exam = focusState.kind === "exam";
      if (!exam && focusState.draft && typeof Drafts !== "undefined") Drafts.flushNow();   // save first, so the words below are true
      const kept = focusState.draft && !(typeof Drafts !== "undefined" && Drafts.failed());
      const stay = opts.returnTo || document.getElementById("exitBtn");  // staying puts focus back where the question came from
      const leave = await confirmLeave(exam
        ? { title: "Leave the exam?", message: "The Timed Exam does not keep a draft: this attempt will not be saved and you cannot pick it up again. Leave the exam?", returnTo: stay }
        : { title: "Leave this practice?", message: kept ? "Your answers are kept as a draft, so you can resume where you left off. Drafts stay only on this device. Nothing is saved to your history until you finish. Leave this practice?" : "Your answers on this screen will be lost, and nothing is saved to your history. Leave this practice?", returnTo: stay });
      if (!leave) return;
      const back = opts.to || (exam ? "#/exam" : focusState.back);
      focusMode.exit();
      if (window.location.hash === back) render(); else navigate(back);  // render and navigate come from app.js
    }
  };
  document.addEventListener("click", e => { if (e.target.closest("#exitBtn")) focusMode.ask(); });
  // The logo is a link to Home everywhere. Outside focus mode it is an ordinary link (app.js redraws the page if you are already Home).
  // During practice or the exam it asks first, with the same question as Exit, and goes Home if you choose Leave.
  document.addEventListener("click", e => {
    const logo = e.target.closest("[data-logo]");
    if (logo && focusState.on) { e.preventDefault(); focusMode.ask({ to: "#/dashboard", returnTo: logo }); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && focusState.on && !e.defaultPrevented && !document.querySelector("dialog[open]")) { e.preventDefault(); focusMode.ask(); } });  // preventDefault: otherwise the same Esc press would close the box the moment it opens

  // ---------- The top bar that collapses (spec 21.5, decision D9; behaviour from the approved Variant A demo) ----------
  // Two numbers: y (the window's scroll position, read INSIDE the scroll event before anything changes) and run (how far we have gone in the
  // current direction; it restarts when the direction flips). The gaps (collapse after 96 against 24 at the top, 24 down against 0.6 of a screen up)
  // are the hysteresis: the point where the bar collapses is never the point where it returns, so a small wobble cannot make it flicker.
  // Collapsing never changes the page height (the bar and title keep their slot and only fade), so y is the same before and after.
  let lastY = window.scrollY, run = 0;
  const isCollapsed = () => root.getAttribute("data-collapsed") === "1";
  function setCollapsed(c) {
    if (isCollapsed() === c) return;
    root.setAttribute("data-collapsed", c ? "1" : "0");
    paintNav();       // decides who fades, who is inert and where the hamburger sits
    measureStack();
  }
  // Rule 5: a page that can hardly scroll never collapses (it would only flicker).
  const canCollapse = () => root.scrollHeight - window.innerHeight >= window.innerHeight * SETTINGS.collapseMinScrollable;
  // The title shows only near the top, and only on a screen that has one (the hairline logic in the CSS reads this).
  function syncTitleFlag(y) {
    root.setAttribute("data-title", y <= SETTINGS.titleMaxY && document.querySelector("main#app > .screen-title") ? "1" : "0");
  }
  function onScroll() {
    const y = window.scrollY;
    root.setAttribute("data-scrolled", y > SETTINGS.scrolledPx ? "1" : "0");
    syncTitleFlag(y);
    const d = y - lastY; lastY = y;
    if (focusState.on) { run = 0; setCollapsed(false); return; }   // no collapsing bar in practice or the exam
    if (overlayOpen()) return;                                      // the page is behind the open menu: ignore
    if (y <= SETTINGS.collapseTopPx) { run = 0; setCollapsed(false); return; }  // rule 1: near the top the bar is always shown
    if (d === 0) return;
    run = (d > 0) === (run > 0) ? run + d : d;
    if (y > SETTINGS.collapseAfterY && run > SETTINGS.collapseRunDown && canCollapse()) setCollapsed(true);   // rule 2: both must hold
    else if (run < -SETTINGS.expandRunUpScreens * window.innerHeight) setCollapsed(false);                    // rule 3: a long run up (read fresh: the window may have been resized)
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // The sticky things below the bar (the Learn contents list) need to know how tall the bar plus title is. One ResizeObserver measures it
  // and writes it into the CSS variable --stack-measured; css/style.css turns that into --stack-h.
  let stackObserver = null;
  function measureStack() {
    const bar = document.getElementById("topbar"), title = document.querySelector("main#app > .screen-title");
    const h = title ? title.offsetHeight : (bar ? bar.offsetHeight : 0);
    if (h) root.style.setProperty("--stack-measured", h + "px");
  }
  function watchStack() {
    if (!("ResizeObserver" in window)) { measureStack(); return; }
    if (!stackObserver) stackObserver = new ResizeObserver(measureStack);
    stackObserver.disconnect();
    const bar = document.getElementById("topbar"), title = document.querySelector("main#app > .screen-title");
    if (bar) stackObserver.observe(bar);
    if (title) stackObserver.observe(title);
    measureStack();
  }

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

  // ---------- The Arrange layout (T-033 B2a) ----------
  // The learner's saved order and bottom-bar choice (js/navlayout.js, per profile) are painted here, onto the page list, the rail and the bottom bar.
  // It only MOVES and MARKS existing elements (and rebuilds the four bar links from the page table), so it never closes an open menu or touches focus.
  // The ids come from NavLayout's own table after validation; no text from storage is ever written into the page.
  function applyNavLayout() {
    if (typeof NavLayout === "undefined") return;
    buildRail();
    const lay = NavLayout.get();
    const nav = byId("mainNav"), list = document.querySelector("#rail .rail-list"), bar = byId("tabBar");
    const inBar = id => lay.bar.indexOf(id) >= 0;
    const place = (host, tag) => {
      if (!host) return {};
      const by = {};
      host.querySelectorAll(":scope > a[data-section]").forEach(a => { by[a.dataset.section] = a; });
      lay.order.forEach((id, i) => { const a = by[id]; if (!a) return; host.appendChild(a); if (tag) a.style.setProperty("--i", String(i)); a.toggleAttribute("data-in-bar", inBar(id)); });
      return by;
    };
    const links = place(nav, true);   // the page list; on a phone the drawer hides the ones marked data-in-bar
    place(list, false);
    if (bar) {
      bar.textContent = "";
      lay.bar.forEach(id => {
        const page = NavLayout.PAGES[id], src = links[id];
        const a = document.createElement("a");
        a.href = src ? src.getAttribute("href") : "#/" + id; a.setAttribute("data-section", id);
        const pill = document.createElement("span"); pill.className = "pill"; pill.appendChild(svgUse("nav-ico", "#" + page.icon));
        a.append(pill, document.createTextNode(page.short));
        bar.appendChild(a);
      });
    }
    if (currentSection) syncNav(currentSection);   // the rebuilt bar links need their "current page" mark again
  }

  // ---------- Hooks called by app.js render() ----------
  function beforeRender(section) {
    focusMode.exit();
    closeOverlay(true);
    cleanupContents();
    syncNav(section);
    root.setAttribute("data-scrolled", "0");
    run = 0; lastY = window.scrollY;
    setCollapsed(false);   // a new screen starts at the top with the full bar
  }
  function afterRender() {
    const app = document.getElementById("app");
    // The heading becomes the sticky page title (it sticks together with the top bar) only when it is the very first thing on the screen:
    // the sticky title reaches up behind the bar, so anything above it would be covered.
    const h1 = app && app.firstElementChild;
    if (h1 && h1.tagName === "H1") h1.classList.add("screen-title");
    fillThemeSwitches();
    syncTitleFlag(window.scrollY);
    watchStack();
    idlePageOpen();   // T-035: the phone top bar plays its idle logo once for every page that opens
  }

  // ---------- The menu: icon rail, island, overlay, phone drawer (spec sections 7, 8 and 10) ----------
  // Rail = 72px, icons only. Island = 264px, icons, names and a round arrow chip. At 1200px and up the island is pinned unless the learner
  // folded it (the X); folded means "rail". From 1000 to 1199px the rail is always the resting form. The same island element is the overlay (wide)
  // and the side drawer (phone, where it lists only the pages that are not in the bottom bar). The rail's buttons and the island's rows come from ONE list:
  // the page links in index.html (#mainNav), so they cannot drift.
  // paintNav() is the single place that decides what shows; every other function changes state and then calls it.
  const pinQuery = window.matchMedia("(min-width: " + SETTINGS.pinMinWidth + "px)");
  const wideQuery = window.matchMedia("(min-width: 1000px)");
  const byId = id => document.getElementById(id);
  let overlayOpener = null;
  function getSidebar() {
    try { return localStorage.getItem("celpip_sidebar") === "folded" ? "folded" : "open"; } catch (e) { return "open"; }  // junk = open
  }
  const navForm = () => (pinQuery.matches && getSidebar() !== "folded" ? "pinned" : "rail");
  function overlayOpen() { return root.getAttribute("data-overlay") === "open"; }
  function paintNav() {
    const wide = wideQuery.matches, form = navForm(), col = isCollapsed();
    const pinnedForm = wide && form === "pinned";
    if (overlayOpen() && pinnedForm && !col) root.removeAttribute("data-overlay");   // a pinned island at the top of the page has no overlay
    const ov = overlayOpen();
    const railFaded = wide && col;                    // scrolled down: rail and island fade, their space stays empty (nothing moves)
    const islFaded = pinnedForm && col && !ov;
    root.setAttribute("data-nav", form);
    root.setAttribute("data-sidebar", getSidebar());
    root.setAttribute("data-shell", "1");             // the CSS stops using its "before the script ran" fallback once this is set
    const side = byId("sidebar"), rail = byId("rail"), x = byId("islandX");
    if (side) {
      side.toggleAttribute("data-open", ov || pinnedForm);
      side.toggleAttribute("data-pinned", pinnedForm && !ov);   // pinned = flat card look; overlay = floating look that slides in from the left
      side.toggleAttribute("data-faded", islFaded);
      side.inert = !(ov || pinnedForm) || islFaded;             // a hidden island is out of the Tab order and away from screen readers
      // Only an overlay is modal; a pinned island is an ordinary landmark.
      if (ov) { side.setAttribute("role", "dialog"); side.setAttribute("aria-modal", "true"); } else { side.removeAttribute("role"); side.removeAttribute("aria-modal"); }
    }
    if (rail) { rail.toggleAttribute("data-faded", railFaded); rail.inert = !wide || form === "pinned" || ov || railFaded; }
    if (x) { const label = ov ? "Close menu" : "Collapse menu to icons"; x.setAttribute("aria-label", label); x.title = label; }
    document.querySelectorAll("[data-menu-open], [data-rail-expand]").forEach(b => b.setAttribute("aria-expanded", String(ov)));   // drives the hamburger-to-X icon
    // While the overlay is open the page behind it, the bottom bar and the skip link cannot be reached.
    [byId("content"), byId("tabBar"), byId("skip")].forEach(e => { if (e) e.inert = ov; });
    // Phone: the bar's controls are hidden copies while collapsed, so the pill holds the live ones. Wide: the bar is never inert (its theme button stays live).
    const bar = byId("topbar"), mini = byId("mini"), anchor = byId("anchor");
    if (bar) bar.inert = col && !wide;
    if (mini) mini.inert = !col || wide || ov;
    if (anchor) anchor.inert = !(col && wide) || ov;
    placeAnchor();
  }
  // Put the anchor exactly over the logo mark that the island (or the rail) shows, so the logo seems to stay while everything else fades.
  function placeAnchor() {
    if (!wideQuery.matches || overlayOpen()) return;
    const m = document.querySelector(navForm() === "pinned" ? "#sidebar .logo .mark" : "#rail .mark");
    const r = m && m.getBoundingClientRect();
    if (!r || !r.width) return;
    root.style.setProperty("--ax", r.left + "px"); root.style.setProperty("--ay", r.top + "px");
  }
  // Run a fold / unfold with the column's width glide switched on (CSS: html.glide). Scrolling never adds the class, so a scroll-collapse leaves the column where it is.
  let glideTimer = 0;
  function glide(change) {
    root.classList.add("glide");
    void root.offsetWidth;                  // make the browser note the old width first, so the change below animates from it
    change();
    clearTimeout(glideTimer); glideTimer = setTimeout(() => root.classList.remove("glide"), SETTINGS.glideMs + 60);
  }
  function openOverlay(opener) {
    if (overlayOpen()) return;
    const side = byId("sidebar");
    if (side && side.hasAttribute("data-faded")) {
      // The pinned island is sitting there invisible. Reset it, with no animation, to the off-screen start so the overlay slides in from the left instead of just fading in.
      side.style.transition = "none";
      side.removeAttribute("data-open"); side.removeAttribute("data-pinned"); side.removeAttribute("data-faded");
      void side.offsetWidth;                // force the browser to apply that start position now
      side.style.transition = "";
    }
    overlayOpener = opener || document.activeElement;
    root.setAttribute("data-overlay", "open");
    paintNav();
    const x = byId("islandX");
    if (x) { x.focus(); if (document.activeElement !== x) requestAnimationFrame(() => x.focus()); }   // initial focus: the X
  }
  function closeOverlay(skipFocus) {
    if (!overlayOpen()) return;
    root.removeAttribute("data-overlay");
    // The page may have been moved (by focus) while the scroll rule was paused: re-sync so the bar state matches the position.
    lastY = window.scrollY; run = 0;
    if (lastY <= SETTINGS.collapseTopPx && isCollapsed()) root.setAttribute("data-collapsed", "0");
    paintNav();
    const back = overlayOpener; overlayOpener = null;
    if (skipFocus) return;
    if (back && document.contains(back) && back.focus && !back.closest("[inert]") && back.getClientRects().length) back.focus();   // focus goes back to the control that opened the island
    else { const m = [...document.querySelectorAll("[data-menu-open], [data-rail-expand]")].find(b => !b.closest("[inert]") && b.getClientRects().length); if (m) m.focus(); }
  }
  function setSidebarPref(v) { try { localStorage.setItem("celpip_sidebar", v); } catch (e) {} }
  // Builds the rail from the island's page list (names come from the page itself, so nothing typed by a person is involved).
  function svgUse(cls, href) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", cls); svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use"); use.setAttribute("href", href);
    svg.appendChild(use); return svg;
  }
  // ---------- The animated logo mark (T-034, Board-approved demo "Lift + Draw") ----------
  // The plain mark is <svg><use href="#i-mark"/></svg>. A <use> copy is a sealed box: CSS cannot reach its inside parts, so it cannot animate
  // the C or the ring separately. This builds the SAME picture as real inline shapes (resting look identical) plus three extras that are
  // invisible at rest: a light band (sheen), a thin ring and the C as its own shape. css/style.css (section "Logo mark: Lift + Draw") animates them.
  // The markup is a fixed string (nothing typed by a person goes into it). Each copy gets its own clip id because ids must be unique on a page.
  let markCount = 0;
  function animatedMark() {
    const id = "tile-clip-" + (++markCount);
    const bubble = "M8 11a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-8l-6 5v-5a3 3 0 0 1-3-3z";
    const wrap = document.createElement("span");
    wrap.className = "mk-in";   // the wrapper carries the tilt and the shadow; the <svg class="mark"> inside keeps its size rules
    wrap.innerHTML = '<svg class="mark" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
      '<clipPath id="' + id + '"><rect width="36" height="36" rx="11"/></clipPath>' +
      '<rect width="36" height="36" rx="11" fill="var(--accent-fill)"/>' +
      '<g clip-path="url(#' + id + ')"><g class="p-sheen"><polygon fill="#fff" fill-opacity=".16" points="6,-1 15,-1 7,37 -2,37"/><polygon fill="#fff" fill-opacity=".30" points="17,-1 20,-1 12,37 9,37"/></g></g>' +
      '<path d="' + bubble + '" fill="var(--accent-ink)"/>' +
      '<path class="s-ring" pathLength="100" d="' + bubble + '"/>' +
      '<path class="p-c" pathLength="100" d="M22.4 13a4.5 4.5 0 1 0 0 5" fill="none" stroke="var(--accent-fill)" stroke-width="2.4" stroke-linecap="round"/></svg>';
    return wrap;
  }
  // Swaps the plain mark inside one logo link for the animated one and marks the link (kind "wide" = sidebar and rail, "pill" = phone pill).
  function animateLogo(link, kind) {
    if (!link || link.classList.contains("lg-anim")) return;
    const old = link.querySelector("svg.mark");
    if (old) old.replaceWith(animatedMark());
    link.classList.add("lg-anim", "lg-" + kind);
  }
  // Touch: a finger has no hover, so a tap plays the animation once (class .tap for 520ms) and the link opens 350ms later so it can be seen.
  // Reduced motion: no wait. Mouse click and keyboard Enter open at once (no touch pointerdown came first).
  const TAP_MS = 520, TAP_NAV_MS = 350;
  // One listener for all animated logos, in the CAPTURE phase on the document. js/pagewipe.js also listens in the capture phase (it takes over the
  // sidebar and rail links to play the circle wipe) but loads after this file, so this one runs first and can hold the click back before the wipe starts.
  let tapped = null, tapClear = 0, releasing = false;
  function wireTaps() {
    document.addEventListener("pointerdown", e => {
      const link = e.pointerType === "touch" && e.target.closest && e.target.closest("a.lg-anim");
      if (!link) return;
      tapped = link; clearTimeout(tapClear); tapClear = setTimeout(() => { tapped = null; }, 1500);   // a touch that turns into a scroll never clicks: forget it
      link.classList.remove("tap"); void link.offsetWidth; link.classList.add("tap");                 // reading offsetWidth restarts the animation on a quick second tap
      setTimeout(() => link.classList.remove("tap"), TAP_MS);
    }, true);
    document.addEventListener("pointercancel", () => { tapped = null; }, true);
    document.addEventListener("click", e => {
      const link = e.target.closest && e.target.closest("a.lg-anim");
      if (releasing || !link || link !== tapped) return;
      tapped = null;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;   // reduced motion: open at once
      e.preventDefault(); e.stopImmediatePropagation();                            // hold the jump; every other click handler sees the second click below
      setTimeout(() => { releasing = true; link.click(); releasing = false; }, TAP_NAV_MS);
    }, true);
  }
  wireTaps();
  function animateLogos() {
    animateLogo(document.querySelector("#sidebar .logo"), "wide");
    animateLogo(document.querySelector(".mini .logo-only"), "pill");
  }
  function buildRail() {
    const rail = byId("rail");
    if (!rail || rail.firstChild) return;
    // Pages that are in the phone's bottom bar are marked, so the drawer (the same island) can leave them out.
    document.querySelectorAll("#mainNav > a[data-section]").forEach(a => { if (SETTINGS.barSections.indexOf(a.dataset.section) >= 0) a.setAttribute("data-in-bar", ""); });
    const logo = document.createElement("a");
    logo.className = "logo-only"; logo.href = "#/dashboard"; logo.setAttribute("data-logo", ""); logo.setAttribute("aria-label", "CELPIP Study Hub, go to Home");
    logo.appendChild(svgUse("mark", "#i-mark"));
    animateLogo(logo, "wide");
    const expand = document.createElement("button");
    expand.type = "button"; expand.className = "ri"; expand.setAttribute("data-rail-expand", "");
    expand.setAttribute("data-tip", "Expand menu"); expand.setAttribute("aria-label", "Expand menu");
    expand.setAttribute("aria-expanded", "false"); expand.setAttribute("aria-controls", "sidebar");
    expand.appendChild(svgUse("nav-ico", "#i-expand"));
    const sep = document.createElement("div"); sep.className = "rsep"; sep.setAttribute("aria-hidden", "true");
    const list = document.createElement("div"); list.className = "rail-list";
    document.querySelectorAll("#mainNav > a[data-section]").forEach(src => {
      const label = src.textContent.trim();
      const a = document.createElement("a");
      a.className = "ri"; a.href = src.getAttribute("href"); a.setAttribute("data-section", src.dataset.section);
      a.setAttribute("data-tip", label); a.setAttribute("aria-label", label);
      a.appendChild(svgUse("nav-ico", src.querySelector("use").getAttribute("href")));
      list.appendChild(a);
    });
    const sp = document.createElement("div"); sp.className = "sp";
    const prof = document.createElement("div"); prof.className = "profile-wrap"; prof.setAttribute("data-profile-switch", "");
    rail.append(logo, expand, sep, list, sp, prof);
    animateLogos();   // also swaps the sidebar's and the phone pill's marks (they are already in the page)
    // WCAG 1.4.13: Esc hides the tooltip without moving focus; it comes back when focus or the pointer moves to another button.
    ["focusin", "mouseover"].forEach(ev => rail.addEventListener(ev, () => document.body.removeAttribute("data-tips")));
  }
  // ---------- The idle logo in the phone top bar (T-035, Board-approved demo Company/Work/2026-11-06 T-035 logo-idle/demo/logo-idle.html) ----------
  // A phone has no hover, so its logo never moves. Here the words "CELPIP Study Hub" in the top bar fold, letter by letter, into the logo mark;
  // the mark plays the same Lift + Draw as T-034 (same keyframes lg-sheen, lg-draw-c, lg-draw-ring); then the words unfold back. 1.4 seconds in all.
  // HOW: at rest the link holds plain text and nothing else changes. On the first play, script adds an overlay on top of the text: one <span> per letter
  // (aria-hidden) and the animated mark. While the class .bt-playing is on the link, the real text turns transparent (so nothing is drawn twice) and the CSS
  // keyframes in css/style.css ("Top-bar idle logo") move the overlay by transform and opacity only. The link keeps its width and the bar its height, because the
  // overlay is absolutely placed and the text never leaves the flow. The link keeps its aria-label, so a screen reader still says "CELPIP Study Hub, go to Home" once.
  // WHEN (the Board picked "C", 2026-11-06): once each time a page opens (every route change), then every REPEAT_MS while the learner is idle. The count restarts
  // from any touch, scroll or key press, and from the end of the last play. It never plays in practice or the exam (focus mode), while the bar is collapsed,
  // while the drawer or a dialog is open, or while the tab is hidden: a play that is due then is skipped, not queued, and the next change or touch starts the count again.
  // Reduced motion: one plain cross-fade on page open, no repeats. Desktop (a mouse) is untouched: the check below needs a screen with no hover.
  const IDLE = { REPEAT_MS: 5000, OPEN_MS: 350, SEQ_MS: 1450, SEQ_RM_MS: 1350 };   // REPEAT_MS: the Board's 5 s (2026-11-06, T-038; was 25 s). OPEN_MS: let the new page settle first. SEQ: 1.4 s of motion plus a margin
  const idleQuery = window.matchMedia("(max-width: 999.98px) and (hover: none)");   // the phone layout on a screen with no hover (phones, and tablets in the phone layout)
  const idleState = { playing: false, timer: 0, endTimer: 0, openTimer: 0, lastInput: 0, lastPlayEnd: 0, key: "" };
  const idleBrand = () => document.querySelector(".topbar .brand-top");
  // Why can it not play right now? "" means it can.
  function idleBlocked() {
    if (!idleQuery.matches) return "not a touch phone layout";
    if (document.hidden) return "tab hidden";
    if (focusState.on) return "practice or exam";
    if (isCollapsed()) return "bar collapsed";
    if (overlayOpen()) return "menu open";
    if (document.querySelector("dialog[open]")) return "dialog open";
    const b = idleBrand();
    if (!b || !b.getClientRects().length) return "no bar";
    return "";
  }
  // Builds the overlay once per link: the letters (text from the page itself) and the animated mark.
  function idleBuild(brand) {
    if (brand.querySelector(".bt-ov")) return;
    const ov = document.createElement("span"); ov.className = "bt-ov"; ov.setAttribute("aria-hidden", "true");
    brand.textContent.trim().split("").forEach(ch => { const s = document.createElement("span"); s.className = "bt-ch"; s.textContent = ch; ov.appendChild(s); });
    const mk = document.createElement("span"); mk.className = "bt-mk"; mk.setAttribute("aria-hidden", "true"); mk.appendChild(animatedMark());
    brand.append(ov, mk);
  }
  // How far must each letter travel to reach the mark's centre (16px from the link's left edge)? offsetLeft ignores transforms, so this is safe at any moment.
  // Far letters leave first and return last (--fd, --ud are their small extra delays, 0 to 90ms). Measured at each play, because the web font may have loaded since.
  function idleMeasure(brand) {
    const chars = [...brand.querySelectorAll(".bt-ch")];
    const dists = chars.map(c => Math.abs(16 - (c.offsetLeft + c.offsetWidth / 2)));
    const max = Math.max.apply(null, dists) || 1;
    chars.forEach((c, i) => {
      c.style.setProperty("--dx", (16 - (c.offsetLeft + c.offsetWidth / 2)).toFixed(1) + "px");
      c.style.setProperty("--fd", Math.round((1 - dists[i] / max) * 90) + "ms");
      c.style.setProperty("--ud", Math.round((dists[i] / max) * 90) + "ms");
    });
  }
  function idleAbort() {
    clearTimeout(idleState.endTimer); clearTimeout(idleState.openTimer);
    const b = idleBrand(); if (b) b.classList.remove("bt-playing");
    idleState.playing = false;
  }
  function idleEnd() {
    const b = idleBrand(); if (b) b.classList.remove("bt-playing");
    idleState.playing = false; idleState.lastPlayEnd = Date.now(); idleArm();
  }
  function idlePlay() {
    const why = idleBlocked(); if (why) return why;
    const b = idleBrand();
    idleBuild(b);
    b.classList.remove("bt-playing"); void b.offsetWidth;    // restart cleanly if it was somehow still on
    b.classList.add("bt-playing"); idleMeasure(b);           // the overlay only has a size once the class shows it
    idleState.playing = true;
    clearTimeout(idleState.endTimer); idleState.endTimer = setTimeout(idleEnd, reducedQuery.matches ? IDLE.SEQ_RM_MS : IDLE.SEQ_MS);
    return "";
  }
  // The next play is due REPEAT_MS after the later of the last touch and the end of the last play. Reduced motion never repeats.
  function idleArm() {
    clearTimeout(idleState.timer); idleState.timer = 0;
    if (reducedQuery.matches) return;
    const delay = Math.max(0, Math.max(idleState.lastInput, idleState.lastPlayEnd) + IDLE.REPEAT_MS - Date.now());
    idleState.timer = setTimeout(() => { idleState.timer = 0; if (!idleBlocked()) idlePlay(); }, delay);   // blocked: skip; the next change or touch re-arms it
  }
  function idleInput() { idleState.lastInput = Date.now(); if (!idleState.playing) idleArm(); }
  // A page opened (called from afterRender, so on the first load and on every route change): start over and play once shortly after.
  function idlePageOpen() {
    idleAbort(); clearTimeout(idleState.timer);
    idleState.lastInput = Date.now(); idleState.lastPlayEnd = 0;
    idleState.openTimer = setTimeout(() => { if (idlePlay()) idleArm(); }, IDLE.OPEN_MS);
  }
  function idleWire() {
    ["pointerdown", "touchstart", "wheel", "keydown"].forEach(ev => document.addEventListener(ev, idleInput, { passive: true, capture: true }));
    window.addEventListener("scroll", idleInput, { passive: true });
    // Tapping the brand goes Home as always; any play in progress is cancelled at once (no wait, unlike the T-034 mark tap).
    document.addEventListener("pointerdown", e => { if (e.target.closest && e.target.closest(".topbar .brand-top")) idleAbort(); }, true);
    // A state change that blocks play cancels a running one; one that unblocks it counts as a touch (the count starts from zero, no play at once).
    const sync = () => {
      const key = [isCollapsed(), overlayOpen(), focusState.on, document.hidden, idleQuery.matches].join();
      if (key === idleState.key) return;
      idleState.key = key;
      if (idleBlocked()) { idleAbort(); clearTimeout(idleState.timer); idleState.timer = 0; } else idleInput();
    };
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-collapsed", "data-overlay"] });
    new MutationObserver(sync).observe(document.body || root, { attributes: true, attributeFilter: ["data-mode"] });
    document.addEventListener("visibilitychange", sync);
    if (idleQuery.addEventListener) idleQuery.addEventListener("change", sync); else if (idleQuery.addListener) idleQuery.addListener(sync);
    idleState.key = [isCollapsed(), overlayOpen(), focusState.on, document.hidden, idleQuery.matches].join();
  }
  idleWire();
  const expand = () => document.querySelector("[data-rail-expand]");
  document.addEventListener("click", e => {
    const op = e.target.closest("[data-menu-open]");
    if (op) { openOverlay(op); return; }                       // hamburger (bar, pill or the logo spot on a wide screen)
    const ex = e.target.closest("[data-rail-expand]");
    if (ex) {
      // 1200px and up with the page at the top: pin the island again, in place, no dimming. Otherwise (1000 to 1199px) open it over the page.
      if (pinQuery.matches && !isCollapsed()) { glide(() => { setSidebarPref("open"); paintNav(); }); const x = byId("islandX"); if (x) x.focus(); }
      else openOverlay(ex);
      return;
    }
    if (e.target.closest("[data-island-x]")) {
      if (overlayOpen()) closeOverlay();
      else { glide(() => { setSidebarPref("folded"); paintNav(); }); if (expand()) expand().focus(); }   // pinned: fold to the rail, focus lands on Expand
      return;
    }
    if (e.target.closest("#scrim")) { closeOverlay(); return; }
    if (overlayOpen() && e.target.closest("#sidebar a[href]")) closeOverlay(true);   // choosing a page closes the overlay; the new page takes focus
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector("dialog[open]")) {
      if (overlayOpen()) { e.preventDefault(); closeOverlay(); return; }
      if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#rail")) document.body.setAttribute("data-tips", "off");
    }
    // Tab stays inside the open overlay island (a modal keeps focus in its own box).
    if (e.key === "Tab" && overlayOpen() && !document.querySelector("dialog[open]")) {
      const side = byId("sidebar");
      const items = [...side.querySelectorAll("a[href], button:not([disabled])")].filter(el => el.getClientRects().length && !el.closest("[hidden], [inert]"));   // inert parts (the page list while the profile panel shows) are skipped
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (!side.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  [pinQuery, wideQuery].forEach(q => { if (q.addEventListener) q.addEventListener("change", paintNav); else if (q.addListener) q.addListener(paintNav); });
  buildRail();
  paintNav();
  document.addEventListener("DOMContentLoaded", () => { buildRail(); paintNav(); });
  window.addEventListener("load", placeAnchor);

  // First paint of the theme controls (the inline script in index.html already set data-theme before anything drew).
  paintTheme(getPref());
  document.addEventListener("DOMContentLoaded", fillThemeSwitches);
  if (document.readyState !== "loading") fillThemeSwitches();

  return { SETTINGS, applyNavLayout, getTheme: getPref, setTheme, focusMode, contents, beforeRender, afterRender, fillThemeSwitches, confirmLeave, idleLogo: { timing: () => Object.assign({}, IDLE), setTiming: o => Object.assign(IDLE, o), playing: () => idleState.playing, blocked: idleBlocked }, nav: { form: navForm, overlayOpen, openOverlay, closeOverlay } };
})();
