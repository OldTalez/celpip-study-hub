/* CELPIP Study Hub v2: the screens and study tools.
 *
 * LEARNING NOTE (for beginners): read js/app.js first (it holds the practice and exam engines), then this file.
 * app.js defines "route(name, handler)" and a few helpers; this file uses them to add the study screens:
 *   dashboard, learn, review (spaced review of mistakes), words (vocabulary cards), grammar, notes (study log), plan,
 *   history and settings. It also exposes a small object called Study that app.js calls to
 *   (a) show an explanation after each question, (b) remember which questions were answered wrongly, and
 *   (c) show a model answer after a writing or speaking task.
 * Key idea, "spaced review": a question you get wrong comes back after 1 day, then 3, 7, 14, 30 and 60 days as you keep getting it right.
 * This is called the Leitner method: each question sits in a "box" (0 to 6) and moves up when answered correctly or back to box 0 when wrong.
 * Everything is stored in this browser through Storage (js/storage.js); nothing is sent anywhere.
 * T-030 turn 1 (2026-11-05): "Plan" became "My plan" (route still #/plan): automatic and manual study-time tracking, the page built
 * from the pure functions in js/prescription.js, and Settings gained preferred study days and a preferred time.
 * T-030 turn 2 (2026-11-05): the dashboard is now called Home (HOME_LABEL) and has a "My plan" overview card (homePlanCard); My plan gained
 * on-track words and icons, a gentle check-in after missed days (planModel, checkInHtml), a closed "add study time" form and a calendar
 * download (CalendarExport in js/calendar.js).
 * T-031 turn A (2026-11-05): Settings gained an install box and the "Protected from automatic clean-up" line, Home can show the monthly backup
 * reminder, the mastery table scrolls inside its tile on a phone, and Study offers dueMistakeCount, download and today to js/appfeel.js.
 * T-029 turn C (2026-11-05): the dashboard gained a radar chart (radarTile), a pace tile (paceTile; since turn C one table, PACE_GUIDE, per Reading part)
 * and a mastery grid by part (masteryTile), all hand-drawn or plain HTML, no chart library.
 * T-029 turn A (2026-11-05): the Learn screens got a contents list ("On this page", built by Shell.contents in js/shell.js),
 * Settings got the Light / Dark / Auto theme switch and a visible On/Off word on the transcripts switch, and the old
 * header theme button code was removed (js/shell.js owns the theme now).
 */
(function () {
  "use strict";

  // ---------- Small helpers ----------
  const pad = n => String(n).padStart(2, "0");
  // Local calendar date as "2026-10-22". Using the local date (not UTC) so "today" matches the learner's own day.
  function ymd(d) { d = new Date(d); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return ymd(new Date()); }
  function addDays(dateStr, n) { const d = new Date(dateStr + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); }
  const BOX_DAYS = [0, 1, 3, 7, 14, 30, 60];
  const DAY = 24 * 60 * 60 * 1000;  // one day in milliseconds (dates subtract to milliseconds); used for the weeks-to-test countdown
  const SKILL_NAMES = { listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking" };

  function mount(html) { app.appendChild(el(html)); }
  function setPageTitle(t) { document.title = t + " | CELPIP Study Hub"; app.focus({ preventScroll: true }); }
  function passageFor(skill, pid) {
    const list = skill === "listening" ? LISTENING_DATA.passages : READING_DATA.passages;
    return list.find(p => p.id === pid) || null;
  }
  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- Study data and the Study object used by app.js ----------
  let diagSkill = null; // set when the learner starts a diagnostic, so the next saved attempt is marked as one

  function getMistakes() { return Storage.get("mistakes", {}); }
  function getPartStats() { return Storage.get("partStats", {}); }

  window.Study = {
    resetTransient() { diagSkill = null; }, // called when the learner switches profile: a half-started diagnostic belongs to the old profile
    download, today, // shared with js/appfeel.js (the backup export)
    dueMistakeCount() { return dueMistakes().length; }, // js/appfeel.js shows this number on the app icon
    // Called after a multiple-choice passage is checked. Updates per-part accuracy (for weak spots) and the review queue.
    recordMcq(skillId, passage, answers, mode) {
      const mistakes = getMistakes();
      const stats = getPartStats();
      const sk = skillId + "|" + passage.partNum;
      stats[sk] = stats[sk] || { right: 0, total: 0 };
      passage.questions.forEach((q, i) => {
        const key = skillId + "|" + passage.id + "|" + i;
        const right = answers[i] === q.answer;
        stats[sk].total += 1;
        if (right) stats[sk].right += 1;
        if (!right) {
          mistakes[key] = { skill: skillId, pid: passage.id, qi: i, part: passage.partNum, box: 0, due: today(), wrong: ((mistakes[key] && mistakes[key].wrong) || 0) + 1 };
        } else if (mistakes[key] && mode === "review") {
          // Right in review: move up a box and push the next date out. Past the last box means it is learned, so remove it.
          const m = mistakes[key];
          m.box += 1;
          if (m.box >= BOX_DAYS.length) delete mistakes[key]; else m.due = addDays(today(), BOX_DAYS[m.box]);
        }
      });
      Storage.set("mistakes", mistakes);
      Storage.set("partStats", stats);
    },
    // The explanation block under a reviewed question. Empty when no explanation exists for that question.
    explanationHtml(passage, qi, correct) {
      const e = (window.CELPIP_EXPL || {})[passage.id];
      const text = e && e[qi];
      if (!text) return "";
      const flagged = /^CHECK KEY/i.test(text);
      const body = escapeHtml(flagged ? text.replace(/^CHECK KEY:?\s*/i, "") : text);
      return flagged
        ? `<div class="explain check-key"><b>Check this answer key</b>${body}<br><span class="muted small">The explanation writer thought the keyed answer may be wrong or unclear. Treat this question with care.</span></div>`
        : `<div class="explain"><b>${correct ? "Why this is right" : "Why the answer is different"}</b>${body}</div>`;
    },
    // Model answer for writing or speaking, shown (collapsed) on the review screen.
    modelHtml(kind, prompt) {
      const label = '<p class="muted small">Unofficial practice material written for this app (generated 2026-10-22). Not a score predictor. Read your own answer first, then compare.</p>';
      if (kind === "writing") {
        const m = (window.CELPIP_WMODEL || {})[prompt.id];
        if (!m) return "";
        return `<details class="model"><summary>Show a model answer, why it works, and useful phrases</summary>${label}
          <div class="passage-text model-text">${escapeHtml(m.model)}</div>
          <h4>Why it works</h4><ul class="tips-list">${m.why.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
          <h4>Useful phrases</h4><ul class="phrase-list">${m.phrases.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
          <h4>Common mistakes on this kind of task</h4><ul class="tips-list">${m.errors.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        </details>`;
      }
      const m = (window.CELPIP_SMODEL || {})[prompt.id];
      if (!m) return "";
      return `<details class="model"><summary>Show an outline, a sample answer, and useful phrases</summary>${label}
        <h4>Outline</h4><ul class="tips-list">${m.outline.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        <h4>Sample answer (about ${m.words} words)</h4><div class="passage-text model-text">${escapeHtml(m.sample)}</div>
        <h4>Useful phrases</h4><ul class="phrase-list">${m.phrases.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        <p><strong>Delivery tip:</strong> ${escapeHtml(m.tip)}</p>
      </details>`;
    },
    // Storage.saveAttempt asks this to learn whether the attempt belongs to a diagnostic that was just started.
    takeDiagnosticFlag(skillId) { if (diagSkill && diagSkill === skillId) { diagSkill = null; return true; } return false; }
  };

  // ---------- Derived numbers ----------
  function dueMistakes() {
    const t = today();
    return Object.values(getMistakes()).filter(m => m.due <= t && passageFor(m.skill, m.pid)).sort((a, b) => a.due.localeCompare(b.due));
  }
  function weakSpots(limit) {
    const stats = getPartStats();
    return Object.entries(stats)
      .filter(([, s]) => s.total >= 4)
      .map(([k, s]) => { const [skill, part] = k.split("|"); return { skill, part: parseInt(part), pct: Math.round(100 * s.right / s.total), total: s.total }; })
      .sort((a, b) => a.pct - b.pct).slice(0, limit || 3);
  }
  function vocabState() { return Storage.get("vocab", {}); }
  function vocabDue() {
    const st = vocabState(), t = today();
    return (window.CELPIP_VOCAB || []).filter(v => !st[v.id] || st[v.id].due <= t);
  }
  function studyDays() {
    const days = new Set(Storage.getHistory().map(h => ymd(h.date)));
    (Storage.get("log", []) || []).forEach(e => days.add(e.date));
    return days;
  }
  function streak() {
    const days = studyDays();
    let n = 0, d = today();
    if (!days.has(d)) d = addDays(d, -1); // today may not be studied yet; do not break the streak until the day is over
    while (days.has(d)) { n++; d = addDays(d, -1); }
    return n;
  }
  function diagnosticFor(skillId) {
    const list = Storage.getHistory().filter(h => h.diagnostic && h.skill === skillId);
    return list.length ? list[list.length - 1] : null;
  }

  // ---------- Chart: plain SVG, no library ----------
  // LEARNING NOTE: SVG is a drawing format made of text tags. Here we compute x and y positions with arithmetic and write
  // them into the tags. Lines differ by dash pattern as well as colour, and a data table below the chart repeats the numbers.
  function lineChart(history, target) {
    const pts = [];
    history.forEach(h => {
      SKILLS.forEach(s => {
        let y = null;
        if (h.type === "practice" && h.skill === s.id) y = h.clb;
        if (h.type === "exam" && h.breakdown && h.breakdown[s.id]) y = h.breakdown[s.id].clb;
        if (y !== null && y !== undefined) pts.push({ skill: s.id, t: new Date(h.date).getTime(), y });
      });
    });
    if (!pts.length) return "";
    const W = 640, H = 260, L = 34, R = 16, T = 12, B = 30;
    const t0 = Math.min(...pts.map(p => p.t)), t1 = Math.max(...pts.map(p => p.t));
    const x = t => L + (t1 === t0 ? (W - L - R) / 2 : ((t - t0) / (t1 - t0)) * (W - L - R));
    const y = v => T + (1 - v / 12) * (H - T - B);
    const dashes = ["", "7 4", "2 3", "10 3 2 3"];
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Estimated CLB over time for each skill. The data table below gives the same numbers.">`;
    [0, 3, 6, 9, 12].forEach(v => { svg += `<line class="grid" x1="${L}" y1="${y(v)}" x2="${W - R}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
    if (target) svg += `<line x1="${L}" y1="${y(target)}" x2="${W - R}" y2="${y(target)}" stroke="var(--text)" stroke-width="1.5" stroke-dasharray="3 3"/><text x="${W - R}" y="${y(target) - 5}" text-anchor="end" style="fill:var(--text)">Target ${target}</text>`;
    svg += `<text x="${L}" y="${H - 8}">${new Date(t0).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</text><text x="${W - R}" y="${H - 8}" text-anchor="end">${new Date(t1).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</text>`;
    SKILLS.forEach((s, i) => {
      const mine = pts.filter(p => p.skill === s.id).sort((a, b) => a.t - b.t);
      if (!mine.length) return;
      const d = mine.map((p, j) => (j ? "L" : "M") + x(p.t).toFixed(1) + " " + y(p.y).toFixed(1)).join(" ");
      svg += `<path d="${d}" fill="none" class="s${i}" stroke-width="2.5" stroke-dasharray="${dashes[i]}"/>`;
      mine.forEach(p => { svg += `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="3.5" class="s${i}f"/>`; });
    });
    svg += `<g class="legend">` + SKILLS.map((s, i) => `<line x1="${L + 8 + i * 118}" y1="${T + 8}" x2="${L + 34 + i * 118}" y2="${T + 8}" class="s${i}" stroke-width="2.5" stroke-dasharray="${dashes[i]}"/><text x="${L + 40 + i * 118}" y="${T + 12}">${s.name}</text>`).join("") + `</g></svg>`;
    const rows = pts.sort((a, b) => a.t - b.t).map(p => `<tr><td>${new Date(p.t).toLocaleDateString()}</td><td>${SKILL_NAMES[p.skill]}</td><td>${p.y}</td></tr>`).join("");
    return svg + `<details class="mt"><summary>Show the chart as a table</summary><table class="history-table"><thead><tr><th>Date</th><th>Skill</th><th>Estimated CLB</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  }

  // ---------- The weekly rhythm used by the Plan and the Dashboard "Today" card ----------
  // Proposed rhythm, editable later: one skill per weekday, vocabulary and grammar on Friday, a timed mini-test on Saturday, review on Sunday.
  const RHYTHM = {
    1: { focus: "reading", label: "Reading day" },
    2: { focus: "listening", label: "Listening day" },
    3: { focus: "writing", label: "Writing day" },
    4: { focus: "speaking", label: "Speaking day" },
    5: { focus: "words", label: "Words and grammar day" },
    6: { focus: "timed", label: "Timed mini-test day" },
    0: { focus: "review", label: "Review and plan day" }
  };
  function dayPlan(dow, settings) {
    const S = settings.sessionMin || 75;
    const main = Math.round(S * 0.55), rev = Math.round(S * 0.2), vocab = Math.round(S * 0.15), note = Math.max(5, S - main - rev - vocab);
    const r = RHYTHM[dow];
    const common = [
      { min: rev, text: `Spaced review of mistakes (the Review page shows what is due)`, href: "#/review" },
      { min: note, text: `Write a study note: what you learned, what is still unclear`, href: "#/notes" }
    ];
    let steps;
    if (r.focus === "reading") steps = [{ min: main, text: "Reading practice: one part at a time, then read every explanation", href: "#/practice/reading" }, { min: vocab, text: "Ten vocabulary cards", href: "#/vocab" }];
    else if (r.focus === "listening") steps = [{ min: main, text: "Listening practice: listen once, answer, then read the explanations and transcript", href: "#/practice/listening" }, { min: vocab, text: "Ten vocabulary cards", href: "#/vocab" }];
    else if (r.focus === "writing") steps = [{ min: main, text: "One timed Writing task, then compare with the model answer and fix two things", href: "#/practice/writing" }, { min: vocab, text: "Useful phrases from the model answer", href: "#/vocab" }];
    else if (r.focus === "speaking") steps = [{ min: main, text: "Three Speaking tasks: record, listen back, compare with the outline", href: "#/practice/speaking" }, { min: vocab, text: "Ten vocabulary cards", href: "#/vocab" }];
    else if (r.focus === "words") steps = [{ min: main, text: "Grammar topic with its drill", href: "#/grammar" }, { min: vocab, text: "Vocabulary cards (a longer set today)", href: "#/vocab" }];
    else if (r.focus === "timed") steps = [{ min: S - note, text: "A timed section (Listening or Reading) with the running clock, in one sitting", href: "#/practice/reading" }];
    else steps = [{ min: main + vocab, text: "Look at the Dashboard weak spots and redo the part you like least", href: "#/dashboard" }];
    return { label: r.label, steps: steps.concat(r.focus === "timed" ? [{ min: note, text: "Write a study note", href: "#/notes" }] : common) };
  }

  // ================= DASHBOARD =================

  // ---------- Dashboard tiles added in turn C: radar chart, pace, mastery grid ----------
  // LEARNING NOTE: a radar chart draws one "arm" per skill from the middle outwards; the longer the arm, the higher the
  // level. Joining the four arm tips gives a shape, so you see at a glance which skill is the short one. We draw it by hand
  // in SVG (no chart library). Rings mark levels 3, 6, 9 and 12. Colour is never the only signal: the latest shape is a solid
  // line with dots, the target is a dashed line, and every arm prints its number.
  const RADAR_ORDER = ["listening", "reading", "writing", "speaking"]; // top, right, bottom, left: fixed so the shape is learnt
  function latestFor(history, skillId) {
    const list = history
      .filter(h => (h.type === "practice" && h.skill === skillId) || (h.type === "exam" && h.breakdown && h.breakdown[skillId]))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!list.length) return { clb: null, date: null };
    const last = list[list.length - 1];
    return { clb: last.type === "exam" ? last.breakdown[skillId].clb : last.clb, date: last.date };
  }
  function radarTile(history, target) {
    const rows = RADAR_ORDER.map(id => Object.assign({ id, name: SKILL_NAMES[id] }, latestFor(history, id)));
    // LEARNING NOTE: with no results at all we still draw the empty chart (rings, "no score" labels, dashed target) so the tile
    // is not a big empty box; only the sentence, the aria-label and the start button change.
    const empty = rows.every(r => r.clb === null);
    const cx = 180, cy = 146, R = 90;
    const dir = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // unit vector of each arm: up, right, down, left
    const pt = (i, v) => [cx + dir[i][0] * R * v / 12, cy + dir[i][1] * R * v / 12];
    const poly = f => rows.map((r, i) => pt(i, f(r)).map(n => n.toFixed(1)).join(",")).join(" ");
    let svg = "";
    [3, 6, 9, 12].forEach(v => { svg += `<polygon class="rd-ring" points="${poly(() => v)}"/><text class="rd-ringn" x="${cx + 4}" y="${(cy - R * v / 12 - 2).toFixed(1)}">${v}</text>`; });
    rows.forEach((r, i) => { const [x, y] = pt(i, 12); svg += `<line class="rd-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; });
    if (target) svg += `<polygon class="rd-target" points="${poly(() => target)}"/>`;
    svg += `<polygon class="rd-now" points="${poly(r => r.clb || 0)}"/>`;
    rows.forEach((r, i) => { const [x, y] = pt(i, r.clb || 0); svg += `<circle class="rd-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`; });
    // Labels: the name, then the number (or "no score") on the line under it, at the end of each arm.
    const lab = [[cx, 18, "middle"], [cx + R + 14, cy - 4, "start"], [cx, cy + R + 28, "middle"], [cx - R - 14, cy - 4, "end"]];
    rows.forEach((r, i) => {
      const [x, y, a] = lab[i];
      svg += `<text class="rd-name" x="${x}" y="${y}" text-anchor="${a}">${r.name}</text>` +
        (r.clb === null ? `<text class="rd-none" x="${x}" y="${y + 20}" text-anchor="${a}">no score</text>` : `<text class="rd-num" x="${x}" y="${y + 22}" text-anchor="${a}">${r.clb}</text>`);
    });
    const say = rows.map(r => r.name + " " + (r.clb === null ? "no score yet, drawn at 0" : r.clb)).join(", ");
    const aria = empty ? `Radar chart of your latest level in each skill out of 12. No scores yet in any skill. Target ${target} in every skill. The table below the chart gives the same rows.` : `Radar chart of your latest level in each skill out of 12: ${say}. Target ${target} in every skill. The table below the chart gives the same numbers.`;
    const scored = rows.filter(r => r.clb !== null).sort((a, b) => a.clb - b.clb);
    const none = rows.filter(r => r.clb === null);
    const caption = empty ? "No results yet. Take a practice test to fill this chart." : none.length ? `${none.map(r => r.name).join(" and ")} ${none.length > 1 ? "have" : "has"} no score yet; the target is ${target}.`
      : `${scored[0].name} is the lowest at level ${scored[0].clb}; the target is ${target}.`;
    const trs = rows.map(r => `<tr><th scope="row">${r.name}</th><td>${r.clb === null ? "no score" : r.clb}</td><td>${target}</td><td>${r.clb === null ? "n/a" : (r.clb >= target ? "at or above target" : (target - r.clb) + " to go")}</td><td>${r.date ? fmtDate(r.date) : "n/a"}</td></tr>`).join("");
    return `<h2>Skills at a glance</h2>
      <svg class="radar" viewBox="0 0 360 290" role="img" aria-label="${aria}">${svg}</svg>
      <ul class="radar-key"><li><svg width="34" height="10" aria-hidden="true"><line x1="0" y1="5" x2="34" y2="5" stroke="var(--accent)" stroke-width="3"/></svg> Latest level</li><li><svg width="34" height="10" aria-hidden="true"><line x1="0" y1="5" x2="34" y2="5" stroke="var(--text)" stroke-width="2" stroke-dasharray="7 5"/></svg> Target ${target}</li></ul>
      <p class="radar-cap">${caption}</p>
      ${empty ? '<p><a class="btn btn-sm" id="radarStart" href="#/practice">Start a quick practice</a></p>' : ""}
      <button type="button" class="btn btn-sm btn-quiet" id="radarTableBtn" aria-expanded="false" aria-controls="radarTable">View as table</button>
      <div id="radarTable" hidden><table class="history-table"><caption class="sr-only">Latest level in each skill against your target</caption><thead><tr><th>Skill</th><th>Latest level</th><th>Target</th><th>Gap</th><th>Date</th></tr></thead><tbody>${trs}</tbody></table></div>`;
  }

  // LEARNING NOTE: "pace" is how long you spend on each multiple-choice question. This ONE table is the guide the Pace tile compares against.
  // Evidence: [[Knowledge/Research/2026-11-05 celpip-study-prescription-evidence]]. The official Reading allowance is 43 to 56 minutes for 4 parts
  // (celpip.ca "Test Format & Scoring", supplied by the Board 2026-11-05). The page gives NO question counts. The counts below (11, 8, 9, 10 = 38) are
  // what this app's own Reading passages hold; prep sites quote the same 38, but that is third-party, so the whole guide is an ESTIMATE.
  // Each part gets its share of the official minutes in proportion to its questions. (Because the split is by question count, every part
  // comes out at the same seconds per question; the parts differ in how many minutes the whole part is worth.)
  // Change READING_PART_QUESTIONS and everything below, on the tile and in the labels, follows.
  const READING_MINUTES = { low: 43, high: 56 };
  const READING_PART_QUESTIONS = [11, 8, 9, 10];
  const READING_Q_TOTAL = READING_PART_QUESTIONS.reduce((a, b) => a + b, 0);
  const PACE_GUIDE = READING_PART_QUESTIONS.map((q, i) => ({
    part: i + 1, questions: q,
    minLow: Math.round((READING_MINUTES.low * q / READING_Q_TOTAL) * 10) / 10, minHigh: Math.round((READING_MINUTES.high * q / READING_Q_TOTAL) * 10) / 10,   // minutes for the whole part
    secLow: Math.round(READING_MINUTES.low * 60 / READING_Q_TOTAL), secHigh: Math.round(READING_MINUTES.high * 60 / READING_Q_TOTAL)                         // seconds per question
  }));
  const PACE_NOTE = "guide, estimated from the official time; question counts are not official";
  const PACE_ATTEMPTS = 10;
  function paceTile(history) {
    const timed = history.filter(h => h.timing && Array.isArray(h.timing.perQuestionSec)).slice(-PACE_ATTEMPTS);
    // a 0 means the clock cut the passage off before that question was timed, so zeros are left out of the average
    const secs = [].concat(...timed.map(h => h.timing.perQuestionSec)).filter(v => v > 0);
    if (!secs.length) return `<h2>Pace</h2><p class="muted">No timing yet. Finish a Reading or Listening practice, or the timed exam, and your time per question shows here.</p>`;
    const avg = Math.round(secs.reduce((a, b) => a + b, 0) / secs.length);
    const top = PACE_GUIDE[0].secHigh, low = PACE_GUIDE[0].secLow;      // the same for every part (see the note above)
    const slow = avg > top;
    const m = Math.floor(avg / 60), r = avg % 60;
    // Reading practice attempts record which passages were used, so their seconds can be sorted by part.
    const byPart = {};
    timed.forEach(h => {
      if (h.skill !== "reading" || !Array.isArray(h.passageIds)) return;
      let at = 0;
      h.passageIds.forEach(pid => {
        const ps = skillById("reading").data.passages.find(x => x.id === pid);
        if (!ps) return;
        const part = ps.partNum, n = ps.questions.length, chunk = h.timing.perQuestionSec.slice(at, at + n).filter(v => v > 0);
        at += n;
        if (chunk.length && part >= 1 && part <= PACE_GUIDE.length) { const o = byPart[part] || (byPart[part] = { sum: 0, n: 0 }); o.sum += chunk.reduce((a, b) => a + b, 0); o.n += chunk.length; }
      });
    });
    const partRows = PACE_GUIDE.map(g => {
      const o = byPart[g.part];
      const mine = o ? Math.round(o.sum / o.n) : null;
      return `<li><span>Part ${g.part} <span class="muted small">(${g.questions} questions, ${g.minLow} to ${g.minHigh} min)</span></span> <strong>${mine === null ? "no timing yet" : mine + "s" + (mine > g.secHigh ? " (slow)" : " (on pace)")}</strong></li>`;
    }).join("");
    return `<h2>Pace</h2>
      <div class="pace-row"><div class="tile-num" id="paceNum">${avg}<span class="pace-unit">s</span></div><p class="muted small">average per question<br>your guide: ${low} to ${top}s per question</p></div>
      <p class="pace-status ${slow ? "slow" : "ok"}"><span class="pace-ico" aria-hidden="true"></span><strong>${slow ? "Running slow" : "On pace"}</strong> <span class="muted small">(${m}:${String(r).padStart(2, "0")} a question)</span></p>
      <p class="muted small">From ${secs.length} question${secs.length === 1 ? "" : "s"} in your last ${timed.length} timed attempt${timed.length === 1 ? "" : "s"}.</p>
      <ul class="pace-parts" id="paceParts">${partRows}</ul>
      <p class="muted small">Reading ${PACE_NOTE}.</p>`;
  }

  // Mastery grid: one cell per part. Uses the same per-part numbers as weakSpots (partStats). Each cell prints its percentage.
  function masteryTile() {
    const stats = getPartStats();
    const rows = ["listening", "reading"].map(id => {
      const parts = skillById(id).data.overview.parts;
      const cells = parts.map((pt, i) => {
        const s = stats[id + "|" + (i + 1)];
        const pct = s && s.total ? Math.round(100 * s.right / s.total) : null;
        const n = pct === null ? 0 : Math.round(Math.min(35, pct / 2.2)); // fill strength, capped so the text stays readable
        const style = pct === null ? "" : ` style="background:color-mix(in srgb, var(--accent) ${n}%, var(--surface-2))"`;
        const label = `${SKILL_NAMES[id]}, ${pt.name}: ${pct === null ? "no answers yet" : pct + "% right over " + s.total + " question" + (s.total === 1 ? "" : "s")}. Practise this part.`;
        return `<td><button type="button" class="mg-cell" data-skill="${id}" data-part="${i + 1}"${style} aria-label="${escapeHtml(label)}"><b>${pct === null ? "n/a" : pct + "%"}</b><span>${pct === null ? "start" : Number(s.total) + " q"}</span></button></td>`;
      });
      while (cells.length < 6) cells.push('<td class="mg-gap"></td>'); // Reading has four parts; the last two columns stay empty
      return `<tr><th scope="row">${SKILL_NAMES[id]}</th>${cells.join("")}</tr>`;
    }).join("");
    return `<h2>Mastery by part</h2>
      <div class="mastery-scroll"><table class="mastery"><caption class="sr-only">Percent right in each part. Choose a cell to practise that part.</caption><thead><tr><th scope="col">Skill</th>${[1, 2, 3, 4, 5, 6].map(n => `<th scope="col">Part ${n}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
      <p class="muted small">Percent right, and how many questions. Darker means stronger. Choose a part to practise it.</p>`;
  }

  // ================= HOME CARD, CHECK-IN, PLAN MODEL (T-030 turn 2) =================
  // LEARNING NOTE: the label of the first screen lives in ONE place. The route is still #/dashboard so old links keep working.
  // Change HOME_LABEL and the menu text, page title and heading all follow (the menus are written in index.html, so we copy the label in below).
  const HOME_LABEL = "Home";
  document.querySelectorAll('[data-section="dashboard"]').forEach(a => { const n = Array.from(a.childNodes).reverse().find(x => x.nodeType === 3 && x.textContent.trim()); if (n) n.textContent = HOME_LABEL; });
  const CHECKIN_KEY = "celpip_checkin_v1";   // holds one date: the day the learner dismissed the check-in. Plain text, nothing else.
  const STUDIED_MIN_MINUTES = 5;             // guide: a day with at least 5 tracked minutes (or any saved attempt or log entry) counts as studied
  function checkInDismissed(t) { try { return localStorage.getItem(Profiles.key(CHECKIN_KEY)) === t; } catch (e) { return false; } } // try/catch: storage can be blocked
  function dismissCheckIn(t) { try { localStorage.setItem(Profiles.key(CHECKIN_KEY), t); } catch (e) { /* blocked storage: the banner simply comes back next time */ } }

  // Everything the plan screen and the Home card both need, computed once so the two always agree.
  function planModel() {
    const settings = Storage.getSettings(), history = Storage.getHistory(), t = today(), now = new Date();
    const latest = {};
    SKILLS.forEach(s => { latest[s.id] = latestClbForSkill(history, s.id); });
    const split = Prescription.skillShares(latest, settings.targetCLB);
    const sched = Prescription.schedule(settings, split.shares);
    const wkStart = Prescription.weekStart(t), td = timeData(), done = Prescription.weekDone(td.days, wkStart);
    const verdict = Prescription.onTrack(sched, split.shares, done, t);
    const next = Prescription.nextSession(sched, dow => Prescription.timeFor(settings, dow), now);
    const studied = studyDays();
    Object.keys(td.days).forEach(d => { const r = td.days[d]; if (r && typeof r === "object" && Object.values(r).reduce((a, v) => a + (Number(v) || 0), 0) >= STUDIED_MIN_MINUTES) studied.add(d); });
    const first = Array.from(studied).filter(d => Prescription.isDay(d)).sort()[0] || null;
    const ci = Prescription.checkIn(sched, studied, t, first);
    return { settings, history, t, latest, split, sched, wkStart, done, verdict, next, ci };
  }
  // ", at 07:00" when every study day has the same time, ", Mon 07:00, Wed 18:30" when they differ, "" when none is set (T-031 turn C).
  function timesText(sched, settings, fallback) {
    const list = sched.days.map(d => ({ dow: d.dow, t: Prescription.timeFor(settings, d.dow) || fallback || "" }));
    if (!list.some(x => x.t)) return "";
    const first = list[0].t;
    if (list.every(x => x.t === first)) return (fallback ? " at " : ", at ") + escapeHtml(first);
    return (fallback ? ": " : ", ") + list.map(x => DAY_NAMES[x.dow].slice(0, 3) + " " + (x.t ? escapeHtml(x.t) : "no time")).join(", ");
  }
  // Words plus a shape, never colour alone: tick (on track), clock (a little behind), bar (behind).
  const STATUS_SHAPE = { ontrack: "M5 12.5l4.5 4.5L19 7.5", little: "M12 6v6l4 2", behind: "M6 12h12" };
  function statusHtml(j) {
    return `<span class="status status-${j.status}"><svg class="status-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="${STATUS_SHAPE[j.status]}"/></svg><span>${escapeHtml(j.text)}</span></span>`;
  }
  function nextText(n) {
    if (!n) return "none planned";
    return (n.daysAway === 0 ? "today" : n.daysAway === 1 ? "tomorrow" : DAY_NAMES[n.dow]) + (n.time ? " at " + n.time : "") + ", " + SKILL_NAMES[n.focus] + ", about " + n.minutes + " min";
  }
  // The check-in banner. Gentle by rule: no blame words, always says what to do next. Returns "" when there is nothing to say.
  function checkInHtml(m) {
    if (m.ci.kind === "none" || checkInDismissed(m.t)) return "";
    const name = d => DAY_NAMES[Prescription.parseDay(d).getDay()];
    let body;
    if (m.ci.kind === "one") {
      body = `<strong>Welcome back.</strong> ${escapeHtml(name(m.ci.missed[0]))} did not happen this time, and that is fine. One day off does not break a habit, so your streak is safe (Lally 2010, medium confidence). Next session: ${escapeHtml(nextText(m.next))}.`;
    } else {
      const bits = m.ci.catchUp.map(c => `${DAY_NAMES[c.dow].slice(0, 3)} +${c.extraMin} min`).join(", ");
      body = `<strong>Welcome back.</strong> It has been a few days, so your streak count starts again today. That is normal; what matters is the next session. If you would like a small catch-up: ${escapeHtml(bits)} (never more than ${Math.round(Prescription.CATCHUP_MAX_EXTRA * 100)}% extra a day, spread over up to ${Prescription.CATCHUP_MAX_DAYS} sessions). Or just do the plan as it is.`;
    }
    return `<div class="checkin" role="status"><svg class="status-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg><div><p>${body}</p><button type="button" class="btn btn-sm" data-checkin-dismiss>Dismiss for today</button></div></div>`;
  }
  function wireCheckIn(t) {
    document.querySelectorAll("[data-checkin-dismiss]").forEach(b => b.onclick = () => {
      dismissCheckIn(t);
      document.querySelectorAll(".checkin").forEach(e => e.remove());
      const h = document.querySelector("#app h1"); if (h) { h.tabIndex = -1; h.focus(); } // keep keyboard focus on the page, not on a removed button
    });
  }
  // The Home card. The heading is a real link whose ::after stretches over the whole card (see .card-link in css), so one click or Enter
  // anywhere opens My plan. Nothing interactive sits INSIDE that link; the dismiss button and the Settings links are siblings raised above it.
  function homePlanCard(m, proj, mil) {
    const hasScores = Object.values(m.latest).some(v => v !== null);
    const parts = [];
    if (!m.sched.chosen && !hasScores) {
      parts.push(`<p>Your plan is not set up yet. <a class="raised" href="#/settings">Choose your study days in Settings</a> and <a class="raised" href="#/diagnostic">take the diagnostic</a>, and it fills in.</p>`);
    } else {
      const got = Math.round(m.done.total), target = m.sched.weeklyMin, pc = pct(got, target);
      parts.push(`<p>This week: <strong>${got} of ${target} min</strong> (${pc}%)</p><div class="bar" aria-hidden="true"><i style="width:${pc}%"></i></div><p>${statusHtml(m.verdict.overall)}</p>`);
      parts.push(`<p>${m.sched.chosen ? "" : "Suggested days until you choose yours. "}Next session: <strong>${escapeHtml(nextText(m.next))}</strong>.</p>`);
      parts.push(proj.projected
        ? `<p class="muted">About CLB ${proj.projected.low === proj.projected.high ? proj.projected.low : proj.projected.low + " to " + proj.projected.high} by your test date. ${escapeHtml(Prescription.LABEL)}.</p>`
        : `<p class="muted">${hasScores ? "Add a test date in Settings to see a projection." : "Take the diagnostic to see a projection."}</p>`);
      const open = mil.filter(x => !x.met).slice(0, 2);
      if (open.length) parts.push(`<ul class="tips-list">${open.map(x => `<li>${escapeHtml(x.text)}</li>`).join("")}</ul>`);
    }
    return `<section class="card tile span-2 tile-plan" aria-labelledby="homePlanH">
      <h2 id="homePlanH"><a class="card-link" href="#/plan">My plan<span class="sr-only">: open the full plan</span></a></h2>
      ${checkInHtml(m)}${parts.join("")}<p class="muted small" aria-hidden="true">Open the full plan &rarr;</p></section>`;
  }

  route("dashboard", () => {
    setPageTitle(HOME_LABEL);
    const history = Storage.getHistory();
    const settings = Storage.getSettings();
    const latest = {};
    SKILLS.forEach(s => { latest[s.id] = latestClbForSkill(history, s.id); });
    const known = Object.values(latest).filter(v => v !== null);
    const overall = known.length ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null;
    const due = dueMistakes().length, vDue = vocabDue().length, sk = streak();
    const weak = weakSpots(3);
    const diagDone = SKILLS.filter(s => diagnosticFor(s.id)).length;
    let weeks = null;
    if (settings.examDate) weeks = Math.ceil((new Date(settings.examDate) - new Date()) / (7 * DAY));

    const pm = planModel();
    const pproj = Prescription.projection(pm.settings, pm.latest, pm.t);
    const pmil = Prescription.milestones(pm.history, getPartStats(), pm.wkStart, diagDone > 0);
    const lastExam = history.filter(h => h.type === "exam").pop();
    const gauge = overall === null ? 0 : Math.round(100 * overall / 12);

    // LEARNING NOTE: a "bento" layout is a grid of tiles of different sizes, like a lunch box. The grid has four
    // columns on a wide screen, two on a tablet and one on a phone; span-2 and span-4 tiles take more columns.
    mount(`
      <h1>${settings.name ? "Hello, " + escapeHtml(settings.name) : HOME_LABEL}</h1>
      <section class="bento">
        <div class="card tile span-2 tile-level">
          <div class="ring-wrap small">
            <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-track" cx="60" cy="60" r="54"/><circle class="ring-fill" cx="60" cy="60" r="54" pathLength="100" style="stroke-dashoffset:${100 - gauge}"/></svg>
            <div class="ring-num"><strong>${overall === null ? "n/a" : overall}</strong><span class="muted small">of 12</span></div>
          </div>
          <div>
            <h2>Overall level</h2>
            <p class="muted">${overall === null ? "No scores yet. Start with the diagnostic so the plan fits you." : `Estimated CLB <strong>${overall}</strong> against your target of <strong>${Number(settings.targetCLB)}</strong>.`}</p>
            <p class="muted small">A rough estimate from your own practice, not an official score.</p>
          </div>
        </div>
        <div class="card tile">
          <h3>Streak</h3>
          <div class="tile-num">${sk}</div>
          <p class="muted small">day${sk === 1 ? "" : "s"} in a row</p>
        </div>
        <div class="card tile">
          <h3>Test date</h3>
          ${weeks !== null ? `<div class="tile-num">${weeks > 0 ? weeks : 0}</div><p class="muted small">${weeks > 0 ? `week${weeks === 1 ? "" : "s"} to go` : "Your test date has arrived or passed."}</p>` : `<p class="muted small">No date yet.</p><a class="btn btn-sm" href="#/settings" aria-label="Add date for your test">Add date</a>`}
        </div>
        ${diagDone < 4 ? `<div class="card tile span-4 today"><h2>Start here: the diagnostic</h2><p>A short cold test in each skill (${diagDone} of 4 done). It sets your starting point and shapes your plan. Do it before you study, without looking anything up.</p><a class="btn btn-primary" href="#/diagnostic">Open the diagnostic</a></div>` : ""}
        ${window.AppFeel ? AppFeel.backupReminderHtml() : ""}
        ${homePlanCard(pm, pproj, pmil)}
        <div class="card tile span-2 tile-radar">${radarTile(history, settings.targetCLB)}</div>
        <div class="card tile span-2 tile-pace">${paceTile(history)}</div>
        <div class="card tile span-2 tile-mastery">${masteryTile()}</div>
        <div class="card tile span-2">
          <h2>Quick practice</h2>
          <div class="quick-grid">${SKILLS.map(s => `<a class="quick" href="#/practice/${s.id}">${s.icon}<span>${s.name}</span></a>`).join("")}</div>
        </div>
        ${SKILLS.map(s => {
          const v = latest[s.id];
          const pct = v === null ? 0 : Math.round(100 * v / 12);
          const weakSkill = v !== null && v < settings.targetCLB;
          return `<div class="card tile tile-skill">
            <div class="n">${s.icon}<h3>${s.name}</h3></div>
            <div class="tile-num">${v === null ? "&ndash;" : v}</div>
            <div class="bar ${weakSkill ? "weak" : ""}" role="img" aria-label="${s.name}: ${v === null ? "no score yet" : "level " + v + " of 12"}"><i style="width:${pct}%"></i></div>
            <p class="muted small">${v === null ? "No score yet" : `Latest CLB${weakSkill ? ", below target" : ", at or above target"}`}</p>
          </div>`;
        }).join("")}
        <div class="card tile span-2">
          <h2>Weak spots</h2>
          ${weak.length ? `<ul class="tips-list">${weak.map(w => {
              const parts = skillById(w.skill).data.overview.parts;
              return `<li><strong>${SKILL_NAMES[w.skill]}, ${escapeHtml((parts[w.part - 1] || { name: "Part " + w.part }).name)}</strong>: ${Number(w.pct)}% right over ${Number(w.total)} questions. <button class="btn btn-sm" data-skill="${escapeHtml(String(w.skill))}" data-part="${w.part}">Drill this part</button></li>`;
            }).join("")}</ul>` : `<p class="muted">Answer at least four questions in a part and your lowest-scoring parts will appear here.</p>`}
        </div>
        <a class="card tile cta" href="#/review"><h3>Mistakes to review</h3><div class="tile-num">${due}</div><p class="muted small">due now</p></a>
        <a class="card tile cta" href="#/vocab"><h3>Word cards</h3><div class="tile-num">${vDue}</div><p class="muted small">ready</p></a>
        <div class="card tile span-4"><h2>Progress over time</h2>${lineChart(history, settings.targetCLB) || '<p class="muted">Your chart appears after your first scored practice. Target: CLB ' + Number(settings.targetCLB) + '.</p>'}</div>
        <div class="card tile span-2">
          <h2>Full mock exam</h2>
          <p class="muted">${lastExam ? `Last one ${fmtDate(lastExam.date)}: overall CLB <strong>${lastExam.overall}</strong>.` : "No full exam yet."} ${weeks !== null && weeks > 2 ? `Plan one about two weeks before your test, in about ${weeks - 2} week${weeks - 2 === 1 ? "" : "s"}.` : "Take one about two weeks before your test."}</p>
          <a class="btn" href="#/exam">Open the timed exam</a>
        </div>
        <div class="card tile span-2"><h2>Recent activity</h2>
          <ul class="tips-list">${history.slice().reverse().slice(0, 5).map(h => `<li>${h.diagnostic ? "Diagnostic: " : ""}${h.type === "exam" ? "Full timed exam" : skillById(h.skill).name + " practice"} <span class="muted small">${fmtDate(h.date)}</span></li>`).join("") || '<li class="muted">Nothing yet.</li>'}</ul>
        </div>
      </section>
    `);
    wireCheckIn(pm.t);
    const rtb = document.getElementById("radarTableBtn");
    if (rtb) rtb.onclick = () => {
      const open = rtb.getAttribute("aria-expanded") !== "true";
      rtb.setAttribute("aria-expanded", String(open));
      rtb.textContent = open ? "Hide table" : "View as table";
      document.getElementById("radarTable").hidden = !open;
    };
    app.querySelectorAll("button[data-skill]").forEach(b => {
      b.onclick = () => {
        const skill = skillById(b.dataset.skill), part = parseInt(b.dataset.part);
        const pool = skill.data.passages.filter(p => p.partNum === part);
        runMcqPractice(skill, sample(pool, Math.min(3, pool.length)));
      };
    });
  });

  // ================= DIAGNOSTIC =================
  route("diagnostic", () => {
    setPageTitle("Diagnostic");
    mount(`
      <h1>Diagnostic</h1>
      <p class="muted">A cold first look at each skill. Do not look anything up, and do not stop to think about the format. The results set your starting point and your plan. You can repeat it later to see progress. Each one saves as a normal attempt, marked as a diagnostic.</p>
      <div class="grid-2">
        ${SKILLS.map(s => {
          const d = diagnosticFor(s.id);
          const what = { listening: "One passage from each part (about 35 questions).", reading: "One passage from each part (about 30 questions).", writing: "One email task with the real task timer.", speaking: "One advice-giving task with prep and response timers." }[s.id];
          return `<div class="card"><h3>${s.icon}${s.name}</h3><p class="muted">${what}</p>
            <p>${d ? `Last diagnostic: <strong>CLB ${d.clb}</strong> on ${fmtDate(d.date)}.` : "Not done yet."}</p>
            <button class="btn btn-primary" data-diag="${s.id}">${d ? "Do it again" : "Start"} ${s.name}</button></div>`;
        }).join("")}
      </div>
      <p class="muted small mt">The writing and speaking diagnostics are single tasks, so they are only a rough starting point.</p>
    `);
    app.querySelectorAll("[data-diag]").forEach(b => {
      b.onclick = () => {
        const skill = skillById(b.dataset.diag);
        diagSkill = skill.id;
        if (skill.id === "listening" || skill.id === "reading") runMcqPractice(skill, sampleOnePerPart(skill.data.passages, skill.data.overview.parts.length));
        else if (skill.id === "writing") runWritingTask(skill, sample(skill.data.prompts.filter(p => p.taskType === "email"), 1)[0], false);
        else runSpeakingTask(skill, sample(skill.data.prompts.filter(p => p.taskNum === 1), 1)[0], false);
      };
    });
  });

  // ================= LEARN =================
  route("learn", (rest) => {
    const L = window.CELPIP_LESSONS || { lessons: [], studyTips: [] };
    if (rest[0] && skillById(rest[0])) {
      const skill = skillById(rest[0]);
      setPageTitle("Learn " + skill.name);
      const ov = skill.data.overview;
      const lessons = L.lessons.filter(l => l.skill === skill.id);
      mount(`
        <a href="#/learn" class="back-link">&larr; All skills</a>
        <h1>${skill.icon}${skill.name}</h1>
        <p class="muted">${escapeHtml(ov.format)}</p>
        <div class="lesson-layout" id="lessonLayout"><div class="lesson-main">
        <h2 class="mt" data-toc="Part by part">Part by part</h2>
        ${ov.parts.map((p, i) => {
          const les = lessons[i];
          return `<details class="model" data-toc="${escapeHtml(p.name)}"><summary>${escapeHtml(p.name)}</summary>
            <p class="muted">${escapeHtml(p.desc)}</p>
            ${les ? `<p><strong>What it tests:</strong> ${escapeHtml(les.whatItTests)}</p>
              <h4>Strategy</h4><ul class="tips-list">${les.strategy.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
              <h4>Pitfalls</h4><ul class="tips-list">${les.pitfalls.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
              <p><strong>How to practise:</strong> ${escapeHtml(les.howToPractice)}</p>
              ${les.structure ? `<h4>A simple structure</h4><div class="passage-text model-text">${escapeHtml(les.structure)}</div>` : ""}` : ""}
            <a class="btn" href="#/practice/${skill.id}">Practise ${skill.name}</a></details>`;
        }).join("")}
        <div class="grid-2 mt"><div class="card"><h3 data-toc="Strategy tips">Strategy tips</h3><ul class="tips-list">${ov.tips.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>
        ${ov.rubricCriteria ? `<div class="card"><h3 data-toc="What is assessed">What is assessed</h3><ul class="tips-list">${ov.rubricCriteria.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>` : ""}</div>
        <p class="muted small mt">Lessons are general study advice written for this app. They are not official guidance.</p>
        </div><div id="tocSlot" class="toc-slot"></div></div>
      `);
      // the contents list: a sticky column beside the lesson on wide screens, a collapsed "On this page" button on phones
      Shell.contents(document.getElementById("lessonLayout"), document.getElementById("tocSlot"));
      return;
    }
    setPageTitle("Learn");
    const areas = { notes: "Taking notes", review: "Reviewing mistakes", vocabulary: "Building vocabulary", timed: "Preparing for a timed test" };
    mount(`
      <h1>Learn</h1>
      <p class="muted">Understand each part before you drill it, then use the study tips to make the practice stick.</p>
      <section class="grid-4">
        ${SKILLS.map(s => `<a class="card cta" href="#/learn/${s.id}"><h3>${s.icon}${s.name}</h3><p class="muted small">${s.data.overview.parts.length} parts, ${s.data.overview.tips.length} tips</p></a>`).join("")}
      </section>
      <h2 class="mt">Study tips</h2>
      <div class="grid-2">${Object.keys(areas).map(a => `<div class="card"><h3>${areas[a]}</h3><ul class="tips-list">${L.studyTips.filter(t => t.area === a).map(t => `<li>${escapeHtml(t.tip)}</li>`).join("")}</ul></div>`).join("")}</div>
    `);
  });

  // ================= REVIEW (spaced review of mistakes) =================
  route("review", () => {
    setPageTitle("Review");
    const queue = dueMistakes();
    const total = Object.keys(getMistakes()).length;
    if (!queue.length) {
      mount(`<h1>Review</h1><div class="card"><p>${total ? `Nothing is due today. ${total} mistake${total === 1 ? " is" : "s are"} waiting for a later day.` : "No mistakes saved yet. When you get a Listening or Reading question wrong in practice it comes here, and returns after 1, 3, 7, 14, 30 and 60 days."}</p><a class="btn btn-primary" href="#/practice">Go to practice</a></div>`);
      return;
    }
    let i = 0;
    function showOne() {
      const m = queue[i];
      const p = passageFor(m.skill, m.pid);
      const q = p.questions[m.qi];
      app.innerHTML = "";
      mount(`
        <div class="run-header"><span class="tag">Review ${i + 1} of ${queue.length}</span><span class="muted small">${SKILL_NAMES[m.skill]}, ${escapeHtml(p.part)}. Box ${Number(m.box)} of 6.</span></div>
        <h2>${escapeHtml(p.title)}</h2>
        ${m.skill === "reading"
          ? `<details class="model"><summary>Show the passage</summary><div class="passage-text">${escapeHtml(p.text).replace(/\n/g, "<br>")}</div></details>`
          : `<div class="audio-box">${Speech.supported ? '<button class="btn" id="playBtn" type="button">Play the audio</button>' : ""}<details class="model"><summary>Show the transcript</summary><div class="passage-text">${escapeHtml(p.script)}</div></details></div>`}
        <form id="rf"><div class="question-block"><p class="q-text">${escapeHtml(q.q)}</p><div class="options">
          ${q.options.map((o, oi) => `<label class="option"><input type="radio" name="r" value="${oi}"><span>${escapeHtml(o)}</span></label>`).join("")}
        </div></div></form>
        <div id="fb"></div>
        <div class="run-footer"><button class="btn btn-primary" id="checkBtn" type="button">Check</button></div>
      `);
      const play = document.getElementById("playBtn");
      if (play) play.onclick = () => Speech.speak(p.script);
      document.getElementById("checkBtn").onclick = function () {
        const chosen = document.querySelector('input[name="r"]:checked');
        if (!chosen) { document.getElementById("fb").innerHTML = '<p class="muted">Choose an answer first.</p>'; return; }
        const val = parseInt(chosen.value), right = val === q.answer;
        // Update this part's accuracy for the weak-spot view (a review answer counts like any other answer).
        const stats = getPartStats(), sk = m.skill + "|" + p.partNum;
        stats[sk] = stats[sk] || { right: 0, total: 0 };
        stats[sk].total += 1; if (right) stats[sk].right += 1;
        Storage.set("partStats", stats);
        const mistakes = getMistakes(), key = m.skill + "|" + p.id + "|" + m.qi;
        if (right) { const mm = mistakes[key] || m; mm.box = (mm.box || 0) + 1; if (mm.box >= BOX_DAYS.length) delete mistakes[key]; else { mm.due = addDays(today(), BOX_DAYS[mm.box]); mistakes[key] = mm; } }
        else { mistakes[key] = { skill: m.skill, pid: p.id, qi: m.qi, part: p.partNum, box: 0, due: today(), wrong: (m.wrong || 0) + 1 }; }
        Storage.set("mistakes", mistakes);
        const opts = document.querySelectorAll("#rf .option");
        opts.forEach((o, oi) => { o.classList.add("static"); o.querySelector("input").disabled = true; if (oi === q.answer) o.classList.add("right-answer"); else if (oi === val) o.classList.add("wrong-answer"); });
        document.getElementById("fb").innerHTML = `<p class="score-line">${right ? "Correct. It moves to a later box." : "Not yet. It stays in the first box and comes back soon."}</p>` + Study.explanationHtml(p, m.qi, right);
        this.textContent = i + 1 < queue.length ? "Next" : "Finish";
        this.onclick = () => { i++; if (i < queue.length) showOne(); else navigate("#/dashboard"); };
      };
    }
    showOne();
  });

  // ================= WORDS (vocabulary cards) =================
  route("vocab", () => {
    setPageTitle("Words");
    const all = window.CELPIP_VOCAB || [];
    const topics = [...new Set(all.map(v => v.topic))];
    mount(`
      <h1>Word cards</h1>
      <p class="muted">${all.length} useful words and phrases. Say the meaning to yourself first, then reveal. "I knew it" moves a card to a later day; "Not yet" brings it back today.</p>
      <div class="card"><label class="field-label" for="topicSel">Topic</label>
        <select id="topicSel"><option value="">All topics</option>${topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("")}</select>
        <p class="muted small mt" id="vCount"></p>
        <button class="btn btn-primary" id="vStart">Start ten cards</button></div>
      <div id="vArea" class="mt"></div>
    `);
    const sel = document.getElementById("topicSel");
    function pool() { const st = vocabState(), t = today(); return all.filter(v => (!sel.value || v.topic === sel.value) && (!st[v.id] || st[v.id].due <= t)); }
    function count() { const n = pool().length; document.getElementById("vCount").textContent = n + " card" + (n === 1 ? "" : "s") + " ready in this topic."; }
    sel.onchange = count; count();
    document.getElementById("vStart").onclick = () => {
      const deck = shuffle(pool()).slice(0, 10);
      if (!deck.length) { document.getElementById("vArea").innerHTML = '<div class="card"><p>No cards are due here. Come back tomorrow or pick another topic.</p></div>'; return; }
      let n = 0, known = 0;
      function card() {
        const v = deck[n];
        const area = document.getElementById("vArea");
        area.innerHTML = `<div class="card flash"><span class="muted small">Card ${n + 1} of ${deck.length}</span>
          <div class="word">${escapeHtml(v.word)}</div><div class="muted">${escapeHtml(v.pos)}, ${escapeHtml(v.register)}</div>
          <div id="back" class="hidden"><p><strong>${escapeHtml(v.meaning)}</strong></p><p class="ex">${escapeHtml(v.example)}</p><p class="muted">Often used with: ${escapeHtml(v.collocation)}</p></div>
          <div class="cta-row-single" style="justify-content:center"><button class="btn" id="rev" type="button">Show meaning</button>
            <button class="btn btn-primary hidden" id="yes" type="button">I knew it</button><button class="btn hidden" id="no" type="button">Not yet</button></div></div>`;
        document.getElementById("rev").focus();
        document.getElementById("rev").onclick = () => { ["back", "yes", "no"].forEach(id => document.getElementById(id).classList.remove("hidden")); document.getElementById("rev").classList.add("hidden"); document.getElementById("yes").focus(); };
        const done = (ok) => {
          const st = vocabState(), cur = st[v.id] || { box: 0 };
          cur.box = ok ? Math.min(cur.box + 1, BOX_DAYS.length - 1) : 0;
          cur.due = addDays(today(), BOX_DAYS[cur.box]);
          st[v.id] = cur; Storage.set("vocab", st);
          if (ok) known++;
          n++;
          if (n < deck.length) card();
          else { area.innerHTML = `<div class="card"><h2>Done</h2><p>${known} of ${deck.length} known. The rest return today.</p><a class="btn btn-primary" href="#/vocab">More cards</a> <a class="btn" href="#/notes">Write a note</a></div>`; count(); }
        };
        document.getElementById("yes").onclick = () => done(true);
        document.getElementById("no").onclick = () => done(false);
      }
      card();
    };
  });

  // ================= GRAMMAR =================
  route("grammar", (rest) => {
    const topics = window.CELPIP_GRAMMAR || [];
    const best = Storage.get("grammar", {});
    const t = rest[0] && topics.find(x => x.id === rest[0]);
    if (!t) {
      setPageTitle("Grammar");
      mount(`<h1>Grammar</h1><p class="muted">${topics.length} short lessons, each with a six-question drill. Your best score is saved per topic.</p>
        <div class="grid-3">${topics.map(x => `<a class="card cta" href="#/grammar/${x.id}"><h3>${escapeHtml(x.topic)}</h3><p class="muted small">${best[x.id] !== undefined ? "Best: " + Number(best[x.id]) + " of " + x.items.length : "Not tried"}</p></a>`).join("")}</div>`);
      return;
    }
    setPageTitle("Grammar: " + t.topic);
    mount(`<a href="#/grammar" class="back-link">&larr; All topics</a><h1>${escapeHtml(t.topic)}</h1>
      <div class="card"><p>${escapeHtml(t.lesson)}</p></div>
      <h2 class="mt">Drill</h2>
      <form id="gf">${t.items.map((q, qi) => `<div class="question-block"><p class="q-text"><strong>${qi + 1}.</strong> ${escapeHtml(q.q)}</p><div class="options">
        ${q.options.map((o, oi) => `<label class="option"><input type="radio" name="g${qi}" value="${oi}"><span>${escapeHtml(o)}</span></label>`).join("")}</div><div id="gw${qi}"></div></div>`).join("")}</form>
      <div class="run-footer"><button class="btn btn-primary" id="gCheck" type="button">Check answers</button><span id="gScore" class="score-line"></span></div>`);
    document.getElementById("gCheck").onclick = function () {
      let right = 0;
      t.items.forEach((q, qi) => {
        const c = document.querySelector(`input[name="g${qi}"]:checked`);
        const val = c ? parseInt(c.value) : null;
        if (val === q.answer) right++;
        document.querySelectorAll(`input[name="g${qi}"]`).forEach((inp, oi) => { inp.disabled = true; const lab = inp.closest(".option"); lab.classList.add("static"); if (oi === q.answer) lab.classList.add("right-answer"); else if (oi === val) lab.classList.add("wrong-answer"); });
        document.getElementById("gw" + qi).innerHTML = `<div class="explain"><b>${val === q.answer ? "Why this is right" : "Why the answer is different"}</b>${escapeHtml(q.why)}</div>`;
      });
      document.getElementById("gScore").textContent = right + " of " + t.items.length + " correct";
      const b = Storage.get("grammar", {}); if (b[t.id] === undefined || right > b[t.id]) { b[t.id] = right; Storage.set("grammar", b); }
      this.disabled = true;
    };
  });

  // ================= NOTES (study log and learning journal) =================
  route("notes", () => {
    setPageTitle("Notes");
    const log = (Storage.get("log", []) || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    mount(`
      <h1>Study notes</h1>
      <p class="muted">Writing down what you learned is part of learning. Keep each note short and honest. Your notes stay in this browser; use the export button to keep a copy.</p>
      <form class="card" id="nf">
        <div class="grid-3">
          <div><label class="field-label" for="nDate">Date</label><input type="date" id="nDate" value="${today()}"></div>
          <div><label class="field-label" for="nMin">Minutes studied</label><input type="number" id="nMin" min="0" max="600" value="60"></div>
          <div><label class="field-label" for="nSkill">Mainly</label><select id="nSkill">${["listening", "reading", "writing", "speaking", "words and grammar", "review", "mixed"].map(o => `<option>${o}</option>`).join("")}</select></div>
        </div>
        <label class="field-label" for="nLearn">What did I learn?</label><textarea id="nLearn" style="min-height:6rem"></textarea>
        <label class="field-label" for="nUnclear">What is still unclear?</label><textarea id="nUnclear" style="min-height:6rem"></textarea>
        <label class="field-label" for="nNext">One thing to try next time</label><input type="text" id="nNext">
        <div class="cta-row-single"><button class="btn btn-primary" type="submit">Save note</button><button class="btn" type="button" id="nExport">Export notes (Markdown file)</button></div>
      </form>
      <h2 class="mt">Your notes (${log.length})</h2>
      ${log.length ? log.map(e => `<div class="note-entry"><div class="when">${escapeHtml(e.date)}, ${escapeHtml(String(e.minutes))} min, ${escapeHtml(e.skill)} <button class="btn-icon" data-del="${escapeHtml(e.id)}" aria-label="Delete this note" title="Delete">&times;</button></div>
        ${e.learned ? `<p><strong>Learned:</strong> ${escapeHtml(e.learned)}</p>` : ""}${e.unclear ? `<p><strong>Unclear:</strong> ${escapeHtml(e.unclear)}</p>` : ""}${e.next ? `<p><strong>Next:</strong> ${escapeHtml(e.next)}</p>` : ""}</div>`).join("") : '<p class="muted">No notes yet.</p>'}
    `);
    document.getElementById("nf").onsubmit = (ev) => {
      ev.preventDefault();
      const all = Storage.get("log", []) || [];
      all.push({ id: "n_" + Date.now(), date: document.getElementById("nDate").value || today(), minutes: parseInt(document.getElementById("nMin").value) || 0, skill: document.getElementById("nSkill").value,
        learned: document.getElementById("nLearn").value.trim(), unclear: document.getElementById("nUnclear").value.trim(), next: document.getElementById("nNext").value.trim() });
      Storage.set("log", all);
      render();
    };
    document.getElementById("nExport").onclick = () => {
      const md = "# CELPIP study notes\n\n" + log.slice().reverse().map(e => `## ${e.date}, ${e.minutes} min, ${e.skill}\n\n${e.learned ? "- Learned: " + e.learned + "\n" : ""}${e.unclear ? "- Unclear: " + e.unclear + "\n" : ""}${e.next ? "- Next: " + e.next + "\n" : ""}`).join("\n");
      download("celpip-study-notes.md", md, "text/markdown");
    };
    app.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { Storage.set("log", (Storage.get("log", []) || []).filter(e => e.id !== b.dataset.del)); render(); });
  });

  // ================= STUDY-TIME TRACKING (T-030) =================
  // LEARNING NOTE: how the app counts study time on its own, and why it is built this way.
  //  - Every TRACK_TICK_MS (5 seconds) a timer asks "is the learner studying right now?". If yes, it adds 5 seconds to today's total.
  //  - "Studying" means: the tab is visible (document.hidden is false), the learner touched the page within TRACK_IDLE_MS (2 minutes:
  //    mouse, key, scroll or touch; or the voice is speaking in Listening), and the screen is one of TRACKED below.
  //  - Counting ticks, not clock differences, means a laptop that sleeps for an hour adds nothing, and a long idle gap adds nothing.
  //  - The minutes go to the skill whose screen is open (practice/reading counts for Reading); review, words, grammar, the exam and
  //    the diagnostic count as "general" because they mix skills. Time on other screens (dashboard, plan, settings) is not counted.
  //  - Stored under the key "studyTime" as { days: { "2026-11-05": { reading: 12.5 } }, manual: [...] }. Nothing leaves the browser.
  const TRACK_TICK_MS = 5000, TRACK_IDLE_MS = 120000;
  const TRACKED = ["practice", "exam", "review", "vocab", "grammar", "learn", "diagnostic"];
  const TIME_SKILLS = ["listening", "reading", "writing", "speaking", "general"];
  const MAX_TIME_DAYS = 400; // older days are dropped so the stored list cannot grow without end
  let lastActive = Date.now();
  function noteActivity() { lastActive = Date.now(); }
  ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"].forEach(ev => document.addEventListener(ev, noteActivity, { passive: true, capture: true }));
  function timeData() {
    const t = Storage.get("studyTime", null);
    return { days: t && t.days && typeof t.days === "object" && !Array.isArray(t.days) ? t.days : {}, manual: t && Array.isArray(t.manual) ? t.manual : [] };
  }
  function saveTime(data) {
    const keys = Object.keys(data.days).sort();
    while (keys.length > MAX_TIME_DAYS) delete data.days[keys.shift()];
    Storage.set("studyTime", data);
  }
  function addStudyMinutes(date, skill, minutes) {
    const data = timeData(), row = data.days[date] || {};
    row[skill] = Math.round(((Number(row[skill]) || 0) + minutes) * 100) / 100;
    data.days[date] = row;
    saveTime(data);
  }
  function trackSkill(path) {
    const parts = path.split("/").filter(Boolean);
    if (!TRACKED.includes(parts[0])) return null;
    return (parts[0] === "practice" || parts[0] === "learn") && TIME_SKILLS.includes(parts[1]) ? parts[1] : "general" /* allow-list: "constructor" or "__proto__" in the URL must not pass */;
  }
  // Returns true when it counted 5 seconds. "now" and "hidden" are passed in so the test can pretend time passed.
  function trackTick(now, hidden) {
    if (hidden) return false;
    const voice = window.speechSynthesis && window.speechSynthesis.speaking;
    if (now - lastActive > TRACK_IDLE_MS && !voice) return false;
    const skill = trackSkill(currentRoute());
    if (!skill) return false;
    addStudyMinutes(today(), skill, TRACK_TICK_MS / 60000);
    return true;
  }
  setInterval(() => trackTick(Date.now(), document.hidden), TRACK_TICK_MS);
  window.Study.tracker = { tick: trackTick, noteActivity, skillFor: trackSkill, IDLE_MS: TRACK_IDLE_MS };

  // Manual entry: validated, then stored. The note is plain text and is shown with textContent only (never as HTML).
  function addManualTime(minutes, date, skill, note) {
    const m = Math.round(Number(minutes));
    if (!Number.isFinite(m) || m < 1 || m > 600) return "Minutes must be a whole number from 1 to 600.";
    if (!Prescription.isDay(date) || date > today() || date < Prescription.addDays(today(), -365)) return "Pick a date in the last year, not in the future.";
    if (!TIME_SKILLS.includes(skill)) return "Pick a skill or General.";
    const data = timeData(), row = data.days[date] || {};
    row[skill] = Math.round(((Number(row[skill]) || 0) + m) * 100) / 100;
    data.days[date] = row;
    data.manual.push({ id: "m_" + Date.now(), date, skill, minutes: m, note: String(note || "").trim().slice(0, 140) });
    if (data.manual.length > 200) data.manual = data.manual.slice(-200);
    saveTime(data);
    return "";
  }
  function removeManualTime(id) {
    const data = timeData(), e = data.manual.find(x => x.id === id);
    if (!e) return;
    const row = data.days[e.date];
    if (row && Number.isFinite(row[e.skill])) { row[e.skill] = Math.max(0, Math.round((row[e.skill] - e.minutes) * 100) / 100); }
    data.manual = data.manual.filter(x => x.id !== id);
    saveTime(data);
  }

  // ================= MY PLAN (T-030) =================
  // LEARNING NOTE: this screen only draws. The thinking is in js/prescription.js (pure functions, easy to test). Here we read the
  // learner's data (settings, results, study time), call those functions, and turn the answers into HTML.
  // Same day-of-week order as the Settings checkboxes: Monday first.
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const FOCUS_DOW = { reading: 1, listening: 2, writing: 3, speaking: 4 }; // which weekday of the old rhythm teaches each skill (dayPlan reuse)
  const pct = (a, b) => (b ? Math.min(100, Math.round(100 * a / b)) : 0);

  route("plan", () => {
    setPageTitle("My plan");
    const { settings, history, t, latest, split, sched, wkStart, done, verdict, next, ci } = planModel();
    const templates = {};
    Object.keys(FOCUS_DOW).forEach(k => { templates[k] = dayPlan(FOCUS_DOW[k], Object.assign({}, settings, { sessionMin: sched.sessionMin })).steps; });
    const now = Prescription.todayTasks(sched, t, templates);
    const proj = Prescription.projection(settings, latest, t);
    const wk = Prescription.weeksLeft(settings, t);
    const daysLeft = Prescription.isDay(settings.examDate) ? Math.round(wk * 7) : null;
    const lastMock = history.filter(h => h.type === "exam").map(h => h.date).sort().pop();
    const mock = Prescription.mockPlan(t, settings.examDate, lastMock ? lastMock.slice(0, 10) : null, SKILLS.some(s => diagnosticFor(s.id)));
    const review = Prescription.reviewSpacing(daysLeft);
    const mil = Prescription.milestones(history, getPartStats(), wkStart, SKILLS.some(s => diagnosticFor(s.id)));
    const dayList = sched.days.map(d => DAY_NAMES[d.dow].slice(0, 3)).join(", ");

    const skillRows = SKILLS.map(s => {
      const target = Math.round(sched.weeklyMin * split.shares[s.id]), got = Math.round(done[s.id]);
      return `<li class="plan-row"><div class="plan-row-top"><strong>${s.name}</strong> <span>${got} of ${target} min (${pct(got, target)}%)</span></div><div>${statusHtml(verdict.skills[s.id])}</div><div class="bar" aria-hidden="true"><i style="width:${pct(got, target)}%"></i></div></li>`;
    }).join("");
    const totalGot = Math.round(done.total), totalPct = pct(totalGot, sched.weeklyMin);

    const projHtml = (() => {
      let h = "";
      if (proj.projected) {
        const a = proj.projected.low, b = proj.projected.high;
        h += `<p>At your pace (${Math.round(sched.weeklyMin / 6) / 10} hours a week for about ${proj.weeksLeft} week${proj.weeksLeft === 1 ? "" : "s"}), you could reach about <strong>CLB ${a === b ? a : a + " to " + b}</strong> on average by your test date.</p>`;
      }
      if (proj.hoursNeeded && proj.stepsToTarget > 0) {
        h += `<p>To bring your weakest skill up <strong>${proj.stepsToTarget} step${proj.stepsToTarget === 1 ? "" : "s"}</strong> to <strong>CLB ${proj.target}</strong> you need about <strong>${proj.hoursNeeded[0]} to ${proj.hoursNeeded[1]} hours</strong> of study in total, shared across all four skills` + (proj.neededPerWeek ? `. That is about <strong>${proj.neededPerWeek[0]} to ${proj.neededPerWeek[1]} hours a week</strong> until the test.` : ".") + `</p>`;
      }
      h += proj.messages.map(m => `<p class="muted">${escapeHtml(m)}</p>`).join("");
      return h;
    })();

    const taskHtml = now.isStudyDay
      ? `<p>Session today: about <strong>${now.sessionMin} minutes</strong>, in blocks of ${sched.blockMin} minutes` + (Prescription.timeFor(settings, new Date().getDay()) ? ` at ${escapeHtml(Prescription.timeFor(settings, new Date().getDay()))}` : "") + `. Focus: <strong>${SKILL_NAMES[now.focus]}</strong>.</p>
         <ul class="tips-list">${now.tasks.map(s => `<li><a href="${s.href}">${escapeHtml(s.text)}</a> <span class="muted">(about ${s.min} min${s.retrieval ? "" : ", not questions"})</span> <a class="btn" href="${s.href}">Start<span class="sr-only">: ${escapeHtml(s.text)}</span></a></li>`).join("")}</ul>
         <p class="muted small">${now.retrievalShare}% of today is questions and recall. The research note asks for at least 60% (Dunlosky 2013, medium confidence).</p>`
      : `<p>Today is not one of your study days (${dayList}). Next: <strong>${DAY_NAMES[(parseInt(new Date(t + "T12:00:00").getDay()) + now.nextStudyInDays) % 7]}</strong>, ${SKILL_NAMES[now.nextFocus]}.</p><p><a class="btn" href="#/practice">Study anyway</a></p>`;

    const mHtml = mil.map(m => `<li><span class="mil-state">${m.met ? "Done" : "Not yet"}</span> ${escapeHtml(m.text)} <span class="muted">(${m.detail ? escapeHtml(m.detail) : m.have + " of " + m.goal}; ${escapeHtml(m.basis)})</span></li>`).join("");

    const rhythm = sched.days.map(d => `<div class="card week-card"><div class="week-badge">${DAY_NAMES[d.dow]}<br><span class="muted small">${SKILL_NAMES[d.focus]} day</span></div><ul class="tips-list">${templates[d.focus].map(s => `<li><a href="${s.href}">${escapeHtml(s.text)}</a> <span class="muted">(about ${s.min} min)</span></li>`).join("")}</ul></div>`).join("");

    mount(`
      <h1>My plan</h1>
      <p class="muted">A study plan built from your results, your test date and the days you chose in <a href="#/settings">Settings</a>. It is a planning guide, not official CELPIP advice, and it promises no score.</p>
      ${checkInHtml({ ci, next, t })}
      <section aria-labelledby="planWeek"><h2 id="planWeek" class="mt">This week</h2>
        <div class="card">
          <p>Target <strong>${sched.weeklyMin} minutes</strong> (${Math.round(sched.weeklyMin / 6) / 10} hours a week, from Settings); done so far <strong>${totalGot} minutes (${totalPct}%)</strong>. Week of ${escapeHtml(wkStart)}.</p>
          <p>${statusHtml(verdict.overall)} <span class="muted small">(compared with the sessions planned before today; a planning guide, not a score)</span></p>
          <div class="bar" aria-hidden="true"><i style="width:${totalPct}%"></i></div>
          <ul class="plan-rows">${skillRows}</ul>
          <p class="muted small">Review, words, grammar and exam time is counted under General: ${Math.round(done.general)} min. ${split.equal ? "The split is equal until you have scores (take the diagnostic)." : "Split by gap to your target, weakest skill first, at least " + Math.round(Prescription.SKILL_FLOOR * 100) + "% each" + (split.missing.length ? "; " + split.missing.map(k => SKILL_NAMES[k]).join(", ") + " has no score yet" : "") + "."}</p>
          ${sched.belowMinimum ? `<p role="status"><strong>Below the guide minimum:</strong> the plan suggests at least ${Prescription.MIN_STUDY_DAYS} study days and ${Prescription.MIN_WEEKLY_HOURS} hours a week (planning guide, low confidence).</p>` : ""}
          <p class="muted small">Study time is counted by itself while you practise, review or learn (the tab must be showing and you must have touched the page in the last 2 minutes).</p>
          <details class="plan-add-wrap" id="addTimeDetails"><summary>Add study time you did elsewhere</summary>
          <form id="addTimeForm" class="plan-add" autocomplete="off">
            <label class="field-label" for="addMin">Minutes</label><input type="number" id="addMin" min="1" max="600" value="30">
            <label class="field-label" for="addDate">Date</label><input type="date" id="addDate" value="${t}" max="${t}">
            <label class="field-label" for="addSkill">Skill</label><select id="addSkill">${TIME_SKILLS.map(k => `<option value="${k}">${k === "general" ? "General" : SKILL_NAMES[k]}</option>`).join("")}</select>
            <label class="field-label" for="addNote">Note (optional, up to 140 characters)</label><input type="text" id="addNote" maxlength="140">
            <div class="cta-row-single"><button type="submit" class="btn" id="addTimeBtn">Add study time</button></div>
            <p id="addTimeMsg" class="muted small" role="status"></p>
          </form></details>
          <ul id="manualList" class="tips-list"></ul>
        </div>
      </section>
      <section aria-labelledby="planToday"><h2 id="planToday" class="mt">Today</h2><div class="card today">${taskHtml}</div></section>
      <section aria-labelledby="planProj"><h2 id="planProj" class="mt">Projection</h2>
        <div class="card">${projHtml}
          <p><strong>${escapeHtml(Prescription.LABEL)}.</strong> It uses about ${Prescription.HOURS_PER_STEP} hours per CLB step, shown as a range of ${Prescription.HOURS_PER_STEP_RANGE[0]} to ${Prescription.HOURS_PER_STEP_RANGE[1]}. That number is inferred from general-English study data (Cambridge), not from CELPIP (low confidence). Part of any practice gain is getting used to the test format.</p>
          <p>${escapeHtml(mock.text)}</p>
          <p>Review your mistakes about every <strong>${review.nextReviewDays} day${review.nextReviewDays === 1 ? "" : "s"}</strong> (about 15% of the days left, between 1 and 14), and bring each missed question back after ${review.ladder.join(", ")} days.</p>
        </div>
      </section>
      <section aria-labelledby="planMil"><h2 id="planMil" class="mt">Milestones</h2>
        <div class="card"><p class="muted small">Concrete targets from your history. "Guide" means a number chosen for this app, not taken from research.</p><ul class="tips-list">${mHtml}</ul></div>
      </section>
      <section aria-labelledby="planRhythm"><h2 id="planRhythm" class="mt">Your rhythm</h2>
        <p class="muted">${sched.chosen ? "Your study days: " + dayList : "You have not chosen study days, so these are suggested: " + dayList + ". Choose yours in Settings"}${timesText(sched, settings)}. Each session is about ${sched.sessionMin} minutes.</p>
        <div class="week-plan">${rhythm}</div>
        <p class="muted small mt">The order of skills is a proposal and the time split inside a day has no research behind it. Adjust it to what works for you.</p>
        <div class="card mt"><h3>Add study sessions to my calendar</h3>
          <p>This makes a small calendar file (.ics) with a weekly repeating session on ${sched.chosen ? "your" : "the suggested"} study days (${escapeHtml(dayList)}) ${timesText(sched, settings, CalendarExport.DEFAULT_TIME)}, ${sched.sessionMin} minutes long, until ${Prescription.isDay(settings.examDate) && settings.examDate > t ? "the day before your test" : CalendarExport.DEFAULT_WEEKS + " weeks from today"}. Each one has a reminder ${CalendarExport.ALARM_MIN} minutes before and lists that day's tasks.${sched.days.some(d => Prescription.timeFor(settings, d.dow)) && sched.days.every(d => Prescription.timeFor(settings, d.dow)) ? "" : " A day with no time chosen in Settings uses " + CalendarExport.DEFAULT_TIME + "."}</p>
          <p class="muted small">The file is made on this device and nothing is sent anywhere. It holds your study days, the time, the session length, each day's tasks and the end date (the day before your test); no name, no notes, no scores. Times are "floating", so they stay at the same clock time wherever you are. Open the downloaded file to add it to Google, Apple or Outlook calendar.</p>
          <button type="button" class="btn" id="icsBtn">Add study sessions to my calendar</button>
          <p id="icsMsg" class="muted small" role="status"></p>
        </div>
      </section>
    `);

    wireCheckIn(t);
    document.getElementById("icsBtn").onclick = () => {
      const r = CalendarExport.buildIcs({ sched, settings, today: t, now: new Date(), focusName: f => SKILL_NAMES[f], tasksFor: (focus, date) => Prescription.todayTasks(sched, date, templates).tasks });
      const msg = document.getElementById("icsMsg");
      if (!r.ok) { msg.textContent = r.error; return; }
      const url = URL.createObjectURL(new Blob([r.text], { type: "text/calendar;charset=utf-8" })); // a Blob is a file held in memory; the URL points at it
      const a = document.createElement("a"); a.href = url; a.download = "celpip-study-sessions.ics"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000); // free the memory later; revoking at once could cancel the download
      msg.textContent = "Calendar file made: " + r.count + " weekly session" + (r.count === 1 ? "" : "s") + " at " + r.time + ", until " + r.untilDay + ". Check your downloads.";
    };
    // The manual list is built with textContent, so a note such as <img src=x onerror=...> shows as plain text and never runs.
    const list = document.getElementById("manualList");
    function drawManual() {
      list.textContent = "";
      timeData().manual.slice(-5).reverse().forEach(e => {
        const li = document.createElement("li");
        li.textContent = e.date + ": " + e.minutes + " min, " + (e.skill === "general" ? "General" : SKILL_NAMES[e.skill]) + (e.note ? " - " + e.note : "") + " ";
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn-icon"; b.textContent = "×"; b.setAttribute("aria-label", "Remove this study time entry"); b.title = "Remove";
        b.onclick = () => { removeManualTime(e.id); render(); toast("Entry removed", "info"); };
        li.appendChild(b);
        list.appendChild(li);
      });
    }
    drawManual();
    document.getElementById("addTimeForm").onsubmit = ev => {
      ev.preventDefault();
      const err = addManualTime(document.getElementById("addMin").value, document.getElementById("addDate").value, document.getElementById("addSkill").value, document.getElementById("addNote").value);
      if (err) { document.getElementById("addTimeMsg").textContent = err; toast(err, "error"); return; }
      render(); toast("Study time added");
    };
  });

  // ================= HISTORY =================
  route("history", () => {
    setPageTitle("History");
    const history = Storage.getHistory().slice().reverse();
    mount(`
      <h1>History</h1>
      <p class="muted">Every practice and exam attempt, stored in this browser.</p>
      ${history.length === 0 ? '<p class="muted">No attempts recorded yet.</p>' : `
        <div style="overflow-x:auto"><table class="history-table"><thead><tr><th>Date</th><th>Type</th><th>Detail</th><th>Score</th><th><span class="sr-only">Delete</span></th></tr></thead><tbody>
          ${history.map(h => `<tr><td>${fmtDate(h.date)}</td><td>${h.type === "exam" ? "Full exam" : skillById(h.skill).name + " practice"}${h.diagnostic ? " (diagnostic)" : ""}${h.mode === "mcq-timed" ? " (timed)" : ""}</td>
            <td>${h.type === "exam" ? "L" + (h.breakdown.listening.clb == null ? "-" : Number(h.breakdown.listening.clb)) + " R" + (h.breakdown.reading.clb == null ? "-" : Number(h.breakdown.reading.clb)) + " W" + Number(h.breakdown.writing.clb) + " S" + Number(h.breakdown.speaking.clb) : (h.pct !== undefined ? Number(h.pct) + "%" : (h.checklistScore !== undefined ? Number(h.checklistScore) + "/" + Number(h.checklistTotal) : ""))}</td>
            <td><strong>${(h.type === "exam" ? h.overall : h.clb) == null ? "n/a" : Number(h.type === "exam" ? h.overall : h.clb)}</strong> CLB</td><td><button class="btn-icon" data-id="${escapeHtml(String(h.id))}" aria-label="Delete this attempt" title="Delete">&times;</button></td></tr>`).join("")}
        </tbody></table></div>
        <div class="cta-row-single"><button class="btn" id="clearAll">Clear all history</button></div>`}
    `);
    app.querySelectorAll(".btn-icon").forEach(b => b.onclick = () => { Storage.deleteAttempt(b.dataset.id); render(); toast("Attempt deleted"); });
    const c = document.getElementById("clearAll");
    if (c) c.onclick = () => { if (confirm("Delete all saved history? This cannot be undone.")) { Storage.clearHistory(); render(); toast("History cleared"); } };
  });

  // ================= SETTINGS =================
  route("settings", () => {
    setPageTitle("Settings");
    const st = Storage.getSettings();
    mount(`
      <h1>Settings</h1>
      <div class="card">
        <label class="field-label" for="nameInput">Your first name (optional)</label><input type="text" id="nameInput" maxlength="60" value="${escapeHtml(st.name)}" autocomplete="off">
        <label class="field-label" for="targetSlider">Target level (CLB)</label><input type="range" min="4" max="12" value="${Number(st.targetCLB)}" id="targetSlider"><div class="muted small">Target: <strong id="targetVal">${Number(st.targetCLB)}</strong></div>
        <label class="field-label" for="sessionInput">Minutes for a study session</label><input type="number" id="sessionInput" min="20" max="240" value="${Number(st.sessionMin)}">
        <label class="field-label" for="hoursSlider">Hours available per week</label><input type="range" min="2" max="30" value="${Number(st.hoursPerWeek)}" id="hoursSlider"><div class="muted small">Per week: <strong id="hoursVal">${Number(st.hoursPerWeek)}</strong> hours</div>
        <fieldset class="field-set"><legend class="field-label">Days you plan to study</legend>
          ${DAY_ORDER.map(d => `<label class="check-item"><input type="checkbox" name="studyDay" value="${d}" ${(st.studyDays || []).includes(d) ? "checked" : ""}><span>${DAY_NAMES[d]}</span></label>`).join("")}
        </fieldset>
        <label class="field-label" for="studyTimeInput">Usual time of day (optional)</label><input type="time" id="studyTimeInput" value="${escapeHtml(st.studyTime || "")}">
        <div id="dayTimes" class="field-set">${DAY_ORDER.map(d => `<div class="day-time" data-day="${d}" ${(st.studyDays || []).includes(d) ? "" : "hidden"}><label class="field-label" for="dayTime${d}">${DAY_NAMES[d]} time (optional)</label><input type="time" id="dayTime${d}" value="${escapeHtml((st.studyTimes && st.studyTimes[d]) || "")}"></div>`).join("")}<div class="muted small">Leave a day empty to use the usual time above.</div></div>
        <div class="muted small">Choose when and where you will study (for example, "Mon, Wed, Fri at 7:30 at the kitchen table"). A plan with a set time is easier to keep. My plan uses your days and shows your time.</div>
        <label class="field-label" for="examDateInput">Test date (optional)</label><input type="date" id="examDateInput" value="${escapeHtml(st.examDate)}">
        <div class="cta-row-single"><button class="btn btn-primary" id="saveSettings">Save</button></div>
      </div>
      <p class="muted small mt" id="themeHint">Theme: use the sun, moon or half-circle button in the menu.</p>
      <div class="card mt install-box" data-install-box hidden></div>
      <div class="card mt"><h3>Practise like the real test</h3>
        <label class="check-row"><input type="checkbox" id="realismToggle" ${st.examRealism ? "checked" : ""}><span class="sw-text">Practise like the real test: hide highlighter, notes and flags</span><span class="sw-word sw-off" aria-hidden="true">Off</span><span class="sw-word sw-on" aria-hidden="true">On</span></label>
        <p class="muted small">Turns off the study aids so practice feels like test day. The question dots stay. The Timed Exam always works this way, whatever this switch says.</p>
        <p id="realismMsg" class="muted small" role="status"></p>
      </div>
      <div class="card mt"><h3>Vibrate on tap</h3>
        ${typeof navigator.vibrate === "function" ? `<label class="check-row"><input type="checkbox" id="vibrateToggle" ${st.vibrate !== false ? "checked" : ""}><span class="sw-text">A light buzz when I pick an answer or flag a question</span><span class="sw-word sw-off" aria-hidden="true">Off</span><span class="sw-word sw-on" aria-hidden="true">On</span></label>
        <p class="muted small">Works on Android phones. It is never used when your device asks for reduced motion.</p>` : `<p class="muted small">This device cannot vibrate from a web page (iPhones and most computers cannot), so there is nothing to switch.</p>`}
      </div>
      <div class="card mt"><h3>Speaking transcripts</h3>
        <label class="check-row"><input type="checkbox" id="sttToggle" ${st.speechToText ? "checked" : ""}><span class="sw-text">Turn my spoken answers into text after Speaking practice</span><span class="sw-word sw-off" aria-hidden="true">Off</span><span class="sw-word sw-on" aria-hidden="true">On</span></label>
        <p class="muted small">Off unless you switch it on. A transcript lets the app count your words and pace and show what you said. To make it, your browser sends your spoken answer to an online speech service (in Chrome, Google's). Your recording itself stays on this device either way.</p>
        <p id="sttMsg" class="muted small" role="status"></p>
      </div>
      <div id="profilesCard"></div>
      <div id="transferCard"></div>
      <div class="card mt"><h3 id="dataTitle">Your data: ${escapeHtml(Profiles.active().name)}</h3>
        <p class="muted">Everything is stored only in this browser, and backup, import and reset below act on the profile named above only. Nothing is sent anywhere unless you switch on Speaking transcripts above: there is no account and no key. Export a backup file now and then; browsers can lose stored data if you clear it.</p>
        <p id="persistMsg" class="small" role="status"></p>
        <div class="cta-row-single"><button class="btn" id="exportBtn">Export this profile (JSON file)</button>
          <label class="btn" for="importFile">Import into this profile</label><input type="file" id="importFile" accept="application/json" class="sr-only"><button class="btn" id="resetAll">Reset this profile</button></div>
        <p id="dataMsg" class="muted small mt" role="status"></p>
      </div>
    `);
    if (window.AppFeel) { AppFeel.fillInstall(); AppFeel.showPersistState(document.getElementById("persistMsg")); }  // appfeel.js loads after this file, so on a reload it fills these itself
    document.getElementById("targetSlider").oninput = e => document.getElementById("targetVal").textContent = e.target.value;
    document.querySelectorAll('input[name="studyDay"]').forEach(cb => { cb.onchange = () => { const row = document.querySelector(`.day-time[data-day="${cb.value}"]`); if (row) row.hidden = !cb.checked; }; });   // a day shows its own time box only while ticked
    document.getElementById("hoursSlider").oninput = e => document.getElementById("hoursVal").textContent = e.target.value;
    document.getElementById("saveSettings").onclick = () => {
      Storage.saveSettings({ ...Storage.getSettings(), name: document.getElementById("nameInput").value.trim().slice(0, 60), targetCLB: Math.min(12, Math.max(4, parseInt(document.getElementById("targetSlider").value) || 9)), hoursPerWeek: Math.min(30, Math.max(2, parseInt(document.getElementById("hoursSlider").value) || 8)),
        examDate: /^\d{4}-\d{2}-\d{2}$/.test(document.getElementById("examDateInput").value) ? document.getElementById("examDateInput").value : "", sessionMin: Math.min(240, Math.max(20, parseInt(document.getElementById("sessionInput").value) || 75)),
        studyDays: Array.from(document.querySelectorAll('input[name="studyDay"]:checked')).map(c => parseInt(c.value)), studyTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(document.getElementById("studyTimeInput").value) ? document.getElementById("studyTimeInput").value : "",
        studyTimes: (() => { const o = {}; DAY_ORDER.forEach(d => { const v = document.getElementById("dayTime" + d).value; if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v) && document.querySelector(`input[name="studyDay"][value="${d}"]`).checked) o[d] = v; }); return o; })() });
      navigate("#/dashboard");
      toast("Settings saved");
    };
    // Saved as soon as it is ticked, so it never waits for the Save button.
    document.getElementById("sttToggle").onchange = e => {
      Storage.saveSettings({ ...Storage.getSettings(), speechToText: e.target.checked });
      document.getElementById("sttMsg").textContent = e.target.checked ? "Transcripts on. Speaking answers will be sent to your browser's speech service." : "Transcripts off. Nothing leaves this browser.";
      toast(e.target.checked ? "Transcripts on" : "Transcripts off", "info");
    };
    // Saved as soon as it is switched, like the transcripts switch.
    document.getElementById("realismToggle").onchange = e => {
      Storage.saveSettings({ ...Storage.getSettings(), examRealism: e.target.checked });
      document.getElementById("realismMsg").textContent = e.target.checked ? "On. Highlighter, notes and flags are hidden in practice." : "Off. Highlighter, notes and flags are available in practice.";
      toast(e.target.checked ? "Practising like the real test" : "Study aids back on", "info");
    };
    if (window.ProfileUI) ProfileUI.mountManage(document.getElementById("profilesCard"));
    if (window.Transfer) Transfer.mountCard(document.getElementById("transferCard"));  // profile-ui.js loads after this file, so on a reload it fills the card itself
    const vib = document.getElementById("vibrateToggle");
    if (vib) vib.onchange = e => { Storage.saveSettings({ ...Storage.getSettings(), vibrate: e.target.checked }); toast(e.target.checked ? "Vibration on" : "Vibration off", "info"); };
    document.getElementById("exportBtn").onclick = () => {
      AppFeel.exportBackup(); // shared with the Home reminder; also notes the date for the monthly reminder
      document.getElementById("dataMsg").textContent = "Backup file saved to your downloads.";
      toast("Backup exported");
    };
    document.getElementById("importFile").onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      // A backup file is typed-in data: refuse anything over 5 MB before reading it (a real backup is far smaller).
      if (f.size > 5 * 1024 * 1024) { document.getElementById("dataMsg").textContent = "That file is too big to be a backup (over 5 MB)."; toast("That file is too big to be a backup", "error"); e.target.value = ""; return; }
      const r = new FileReader();
      r.onload = () => {
        let obj = null;
        try { obj = JSON.parse(r.result); } catch (x) { obj = null; }
        const good = Storage.importAll(obj), skip = good ? Storage.importSkipped() : 0;
        const note = skip ? "Backup imported; " + skip + " entr" + (skip === 1 ? "y" : "ies") + " skipped" : "Backup imported";
        document.getElementById("dataMsg").textContent = good ? note + ". Open the dashboard to see it." : "That file could not be read as a backup, or this device is full. Nothing was changed.";
        toast(good ? note : "That file could not be read as a backup, or this device is full", good ? "ok" : "error");
      };
      r.readAsText(f);
    };
    document.getElementById("resetAll").onclick = () => { if (confirm("This erases all history, notes and settings of the profile \u201C" + Profiles.active().name + "\u201D only. Other profiles on this device are not touched. Continue?")) { Storage.resetAll(); render(); toast("Profile data erased", "info"); } };
  });

  // Everything is registered, so draw the first screen.
  render();
})();
