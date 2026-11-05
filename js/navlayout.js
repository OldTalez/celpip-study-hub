/*
 * LEARNING NOTE (for beginners): this file is the memory for the "Arrange menu" setting (T-033 B2a). The learner can choose the ORDER of
 * the 11 pages in the side menu and WHICH FOUR sit in the phone's bottom bar. One setting drives both, and each profile has its own copy.
 *
 * What is stored, in plain words: one small note per profile, labelled "celpip_p_<profile id>_navlayout_v1", holding
 *     {"v":1,"order":[11 page ids],"bar":[4 page ids]}
 * Rules (a value that breaks ANY rule is thrown away whole and the default is used; it is never repaired or half-used):
 *   - "v" is the number 1 and there are no other fields.
 *   - "order" lists all 11 known page ids, each exactly once, with "dashboard" (Home) first.
 *   - "bar" has exactly 4 of those ids, no repeats, including "dashboard", in the same relative order as "order".
 *   - The text is at most 400 characters.
 *
 * Why so strict: this value is typed-in data we do not control. It can come from browser storage that someone edited by hand, from a
 * backup file, or from a QR transfer. validate() below is the ONE gatekeeper: reading from storage uses it, and every import goes through
 * Storage.cleanBundle, which calls it too. The ids are only ever used as keys into the PAGES table below (label, icon): text from storage
 * is never put on the page as HTML and never used to build a link.
 *
 * Loads after js/profiles.js (it asks Profiles for the key name) and before js/storage.js (storage asks it to check imports).
 * Nothing here uses the network.
 */
const NavLayout = (function () {
  "use strict";
  const KEY_NAME = "celpip_navlayout_v1";
  const MAX_JSON = 400;
  // The 11 pages, in the default order. label = long name (the menus), short = the name under a bottom-bar icon, icon = drawing in the sprite in index.html.
  const PAGES = {
    dashboard: { label: "Home", short: "Home", icon: "i-dashboard" },
    learn: { label: "Learn", short: "Learn", icon: "i-learn" },
    practice: { label: "Practice", short: "Practice", icon: "i-practice" },
    review: { label: "Review", short: "Review", icon: "i-review" },
    vocab: { label: "Words", short: "Words", icon: "i-vocab" },
    grammar: { label: "Grammar", short: "Grammar", icon: "i-grammar" },
    notes: { label: "Notes", short: "Notes", icon: "i-notes" },
    plan: { label: "My plan", short: "My plan", icon: "i-plan" },
    exam: { label: "Timed Exam", short: "Exam", icon: "i-exam" },
    history: { label: "History", short: "History", icon: "i-history" },
    settings: { label: "Settings", short: "Settings", icon: "i-settings" }
  };
  const IDS = Object.keys(PAGES);
  const DEFAULT_BAR = ["dashboard", "practice", "plan", "exam"];
  const isId = v => typeof v === "string" && IDS.indexOf(v) >= 0;
  const key = () => Profiles.key(KEY_NAME);
  const listeners = [];

  // A fresh copy each time, so nobody can change the default by accident.
  const defaultLayout = () => ({ v: 1, order: IDS.slice(), bar: DEFAULT_BAR.slice() });

  // Answers a clean NEW layout object, or null when the value breaks any rule. Accepts only what JSON.parse can make: a plain object.
  function validate(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    if (Object.keys(value).sort().join() !== "bar,order,v") return null;             // exactly these three fields, nothing extra
    if (value.v !== 1) return null;
    const order = value.order, bar = value.bar;
    if (!Array.isArray(order) || order.length !== IDS.length || !Array.isArray(bar) || bar.length !== 4) return null;
    if (!order.every(isId) || new Set(order).size !== IDS.length || order[0] !== "dashboard") return null;
    if (!bar.every(isId) || new Set(bar).size !== 4 || bar.indexOf("dashboard") < 0) return null;
    if (order.filter(id => bar.indexOf(id) >= 0).join() !== bar.join()) return null;   // bar is in the same relative order as the list (this also proves every bar id is in the list)
    let size = 0; try { size = JSON.stringify(value).length; } catch (e) { return null; }
    if (size > MAX_JSON) return null;
    return { v: 1, order: order.slice(), bar: bar.slice() };
  }

  // The layout saved for the ACTIVE profile as a valid object, or null when nothing valid is saved (used by backup export).
  function stored() {
    try {
      const raw = localStorage.getItem(key());
      if (typeof raw !== "string" || raw.length > MAX_JSON) return null;   // too long: refused before it is even parsed
      return validate(JSON.parse(raw));
    } catch (e) { return null; }
  }
  // What the menus use: the saved layout, or the default when there is none or it is not valid. Never throws.
  const get = () => stored() || defaultLayout();
  const isDefault = () => { const a = get(), d = defaultLayout(); return a.order.join() === d.order.join() && a.bar.join() === d.bar.join(); };

  const fire = () => listeners.slice().forEach(fn => { try { fn(); } catch (e) { console.warn(e); } });
  // Saves a layout for the active profile (after checking it). True when saved. The menus repaint through the listeners.
  function save(layout) {
    const clean = validate(layout);
    if (!clean) return false;
    try { localStorage.setItem(key(), JSON.stringify(clean)); } catch (e) { return false; }
    fire();
    return true;
  }
  // Back to the default: the note is removed, so a new profile and a reset profile look the same.
  function reset() { try { localStorage.removeItem(key()); } catch (e) { return false; } fire(); return true; }

  return {
    KEY_NAME, MAX_JSON, PAGES, IDS, DEFAULT_BAR, defaultLayout, validate, stored, get, isDefault, save, reset,
    refresh: fire,                             // the menus must repaint (a profile switched, an import landed, another tab saved)
    onChange(fn) { listeners.push(fn); }
  };
})();
window.NavLayout = NavLayout;

// Keep the menus in step with the layout: when it changes, when the active profile changes (each profile has its own), and when another tab saves it.
NavLayout.onChange(() => { if (typeof Shell !== "undefined" && Shell.applyNavLayout) Shell.applyNavLayout(); });   // typeof: a top-level const is not on window
Profiles.onChange(() => NavLayout.refresh());
window.addEventListener("storage", e => { if (e.key === null || e.key === Profiles.key(NavLayout.KEY_NAME)) NavLayout.refresh(); });   // key null = another tab cleared all storage: fall back to the default and repaint
NavLayout.refresh();   // first paint: put the saved order into the menus
