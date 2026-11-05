// check-contrast.js: checks that text colours are readable on their backgrounds, in both themes.
// LEARNING NOTE (for beginners): "contrast ratio" is a number from 1 (identical colours) to 21 (black on white) that says how
// easy text is to read. The accessibility guideline WCAG 2.2 level AA asks for at least 4.5 for normal text and 3 for
// graphics such as icons, bars, focus rings and the outlines of form controls.
// The formula converts each colour to its relative luminance (how bright it really looks to the eye) and compares the two.
// Run with:  node tools/check-contrast.js   It reads the colour variables from css/style.css, so it stays in step with the design.
const fs = require("fs");
const path = require("path");
const css = fs.readFileSync(path.join(__dirname, "..", "css", "style.css"), "utf8");

function vars(block) {
  const out = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}
const light = vars(css.slice(css.indexOf(":root {"), css.indexOf("html[data-theme=\"dark\"]")));
const dark = Object.assign({}, light, vars(css.slice(css.indexOf("html[data-theme=\"dark\"] {"))));

function lum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

// [foreground, background, minimum]: 4.5 for text, 3 for graphics (icons, bars, focus rings) and control outlines.
const pairs = [
  ["text", "bg", 4.5], ["text", "surface", 4.5], ["text", "surface-2", 4.5], ["muted", "bg", 4.5], ["muted", "surface", 4.5], ["muted", "surface-2", 4.5],
  ["link", "bg", 4.5], ["link", "surface", 4.5], ["accent-ink", "accent", 4.5], ["accent-ink", "accent-hover", 4.5],
  ["accent-line", "bg", 3], ["accent-line", "surface", 3], ["ctl", "bg", 3], ["ctl", "surface", 3],
  ["good", "good-bg", 4.5], ["good", "surface", 4.5], ["good", "bg", 4.5], ["bad", "bad-bg", 4.5], ["bad", "surface", 4.5], ["bad", "bg", 4.5], ["bg", "text", 4.5],
  ["text", "mark", 4.5], ["accent-line", "surface-2", 3], ["good", "surface-2", 4.5], ["bad", "bad-bg", 4.5]
];
let fails = 0;
[["light", light], ["dark", dark]].forEach(([name, t]) => {
  console.log(name.toUpperCase());
  pairs.forEach(([fg, bg, min]) => {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log("  " + (ok ? "pass " : "FAIL ") + r.toFixed(2).padStart(5) + " (needs " + min + ")  " + fg + " (" + t[fg] + ") on " + bg + " (" + t[bg] + ")");
  });
});
console.log(fails ? fails + " pair(s) below their minimum" : "All pairs meet their minimum.");
process.exit(fails ? 1 : 0);
