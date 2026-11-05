// validate-data.js: the self-check for the practice data. Run it with:  node tools/validate-data.js
// LEARNING NOTE (for beginners): a "validator" is a small program that checks data for mistakes so a person does not have to.
// It loads every data file the same way the browser does (in the order index.html lists them) and then checks:
//   - every id is unique within its list
//   - every multiple-choice question has an options list and exactly one valid correct answer index
//   - no required field is empty
//   - every listening/reading question has an explanation, and the counts match
//   - writing model answers stay inside the prompt's word range, speaking prompts all have a model
//   - vocabulary and grammar items are complete
// It prints counts at the end and exits with code 1 if anything is wrong (so it can be used before committing).
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA = path.join(__dirname, "..", "js", "data");
const order = ["listening_pool_1", "listening_pool_2", "listening_pool_3", "reading_pool_1", "reading_pool_2",
  "writing_speaking_pool", "listening", "reading", "writing", "speaking"];
const newer = ["explanations", "writing_models", "speaking_models", "vocab", "grammar", "lessons"];

// The data files use "const NAME = ..." and "window.NAME = ...". Run them in a fake browser window and collect the results.
let code = order.map(f => fs.readFileSync(path.join(DATA, f + ".js"), "utf8")).join("\n");
code += "\n;var __out = { L: LISTENING_DATA, R: READING_DATA, W: WRITING_DATA, S: SPEAKING_DATA };";
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
newer.forEach(f => {
  const p = path.join(DATA, "new", f + ".js");
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, "utf8"), sandbox);
});
const { L, R, W, S } = sandbox.__out;
const win = sandbox.window;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const empty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

function unique(list, label) {
  const seen = new Set();
  list.forEach(x => { if (seen.has(x.id)) err(label + ": duplicate id " + x.id); seen.add(x.id); });
}
function checkMcq(q, where) {
  if (empty(q.q)) err(where + ": empty question text");
  if (!Array.isArray(q.options) || q.options.length < 2) return err(where + ": needs at least 2 options");
  if (q.options.some(empty)) err(where + ": an option is empty");
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(where + ": answer index is not a valid option");
  if (new Set(q.options.map(o => String(o).trim().toLowerCase())).size !== q.options.length) err(where + ": two options are identical");
}

// --- listening and reading ---
[["listening", L, "script"], ["reading", R, "text"]].forEach(([name, skill, textField]) => {
  unique(skill.passages, name);
  const expl = win.CELPIP_EXPL || {};
  let missingExpl = 0, checkKey = 0;
  skill.passages.forEach(p => {
    ["id", "part", "title", textField].forEach(f => { if (empty(p[f])) err(name + " " + p.id + ": empty " + f); });
    if (empty(p.questions)) return err(name + " " + p.id + ": no questions");
    p.questions.forEach((q, i) => checkMcq(q, name + " " + p.id + " Q" + (i + 1)));
    const e = expl[p.id];
    if (!e) { missingExpl += p.questions.length; return; }
    if (e.length !== p.questions.length) err(name + " " + p.id + ": " + e.length + " explanations for " + p.questions.length + " questions");
    e.forEach((t, i) => { if (empty(t)) err(name + " " + p.id + " Q" + (i + 1) + ": empty explanation"); else if (/^CHECK KEY/i.test(t)) checkKey++; });
  });
  if (missingExpl) warn(name + ": " + missingExpl + " questions have no explanation yet");
  if (checkKey) warn(name + ": " + checkKey + " explanations are flagged CHECK KEY (answer key may be wrong or ambiguous; a human should look)");
});

// --- writing ---
unique(W.prompts, "writing");
const wm = win.CELPIP_WMODEL || {};
W.prompts.forEach(p => {
  ["id", "task", "prompt"].forEach(f => { if (empty(p[f])) err("writing " + p.id + ": empty " + f); });
  const m = wm[p.id];
  if (!m) return warn("writing " + p.id + ": no model answer yet");
  if (empty(m.model) || empty(m.why) || empty(m.phrases) || empty(m.errors)) err("writing " + p.id + ": model has an empty field");
  const words = (m.model.trim().match(/\S+/g) || []).length;
  if (p.wordTarget && (words < p.wordTarget[0] - 10 || words > p.wordTarget[1] + 15)) warn("writing " + p.id + ": model is " + words + " words (target " + p.wordTarget.join("-") + ")");
});

// --- speaking ---
unique(S.prompts, "speaking");
const sm = win.CELPIP_SMODEL || {};
S.prompts.forEach(p => {
  ["id", "task", "prompt"].forEach(f => { if (empty(p[f])) err("speaking " + p.id + ": empty " + f); });
  const m = sm[p.id];
  if (!m) return warn("speaking " + p.id + ": no model yet");
  if (empty(m.outline) || empty(m.sample) || empty(m.phrases) || empty(m.tip)) err("speaking " + p.id + ": model has an empty field");
});

// --- vocabulary ---
const vocab = win.CELPIP_VOCAB || [];
unique(vocab, "vocab");
const words = new Set();
vocab.forEach(v => {
  ["id", "word", "pos", "meaning", "example", "collocation", "topic"].forEach(f => { if (empty(v[f])) err("vocab " + v.id + ": empty " + f); });
  const k = String(v.word).toLowerCase();
  if (words.has(k)) err("vocab: duplicate word " + v.word);
  words.add(k);
});

// --- grammar ---
const grammar = win.CELPIP_GRAMMAR || [];
unique(grammar, "grammar");
let grammarItems = 0;
grammar.forEach(t => {
  ["id", "topic", "lesson"].forEach(f => { if (empty(t[f])) err("grammar " + t.id + ": empty " + f); });
  if (empty(t.items)) return err("grammar " + t.id + ": no items");
  t.items.forEach((q, i) => { grammarItems++; checkMcq(q, "grammar " + t.id + " item " + (i + 1)); if (empty(q.why)) err("grammar " + t.id + " item " + (i + 1) + ": empty why"); });
});

// --- lessons ---
const les = win.CELPIP_LESSONS || { lessons: [], studyTips: [] };
unique(les.lessons, "lessons");
les.lessons.forEach(l => ["id", "skill", "part", "title", "whatItTests", "strategy", "pitfalls", "howToPractice"].forEach(f => { if (empty(l[f])) err("lesson " + l.id + ": empty " + f); }));

const count = (a, f) => a.reduce((n, p) => n + f(p), 0);
console.log("COUNTS");
console.log("  listening: " + L.passages.length + " passages, " + count(L.passages, p => p.questions.length) + " questions");
console.log("  reading:   " + R.passages.length + " passages, " + count(R.passages, p => p.questions.length) + " questions");
console.log("  writing:   " + W.prompts.length + " prompts, " + Object.keys(wm).length + " model answers");
console.log("  speaking:  " + S.prompts.length + " prompts, " + Object.keys(sm).length + " models");
console.log("  explanations for " + Object.keys(win.CELPIP_EXPL || {}).length + " passages (" + count(Object.values(win.CELPIP_EXPL || {}), a => a.length) + " questions)");
console.log("  vocabulary: " + vocab.length + " cards");
console.log("  grammar: " + grammar.length + " topics, " + grammarItems + " drill questions");
console.log("  lessons: " + les.lessons.length + ", study tips: " + les.studyTips.length);
warnings.forEach(w => console.log("WARNING: " + w));
errors.forEach(e => console.log("ERROR: " + e));
console.log(errors.length ? errors.length + " error(s)" : "No errors.");
process.exit(errors.length ? 1 : 0);
