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
  route("dashboard", () => {
    setPageTitle("Dashboard");
    const history = Storage.getHistory();
    const settings = Storage.getSettings();
    const latest = {};
    SKILLS.forEach(s => { latest[s.id] = latestClbForSkill(history, s.id); });
    const known = Object.values(latest).filter(v => v !== null);
    const overall = known.length ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null;
    const due = dueMistakes().length, vDue = vocabDue().length, sk = streak();
    const weak = weakSpots(3);
    const plan = dayPlan(new Date().getDay(), settings);
    const diagDone = SKILLS.filter(s => diagnosticFor(s.id)).length;
    let weeks = null;
    if (settings.examDate) weeks = Math.ceil((new Date(settings.examDate) - new Date()) / (7 * DAY));

    const lastExam = history.filter(h => h.type === "exam").pop();
    const gauge = overall === null ? 0 : Math.round(100 * overall / 12);

    // LEARNING NOTE: a "bento" layout is a grid of tiles of different sizes, like a lunch box. The grid has four
    // columns on a wide screen, two on a tablet and one on a phone; span-2 and span-4 tiles take more columns.
    mount(`
      <h1>${settings.name ? "Hello, " + escapeHtml(settings.name) : "Your study desk"}</h1>
      <section class="bento">
        <div class="card tile span-2 tile-level">
          <div class="ring-wrap small">
            <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-track" cx="60" cy="60" r="54"/><circle class="ring-fill" cx="60" cy="60" r="54" pathLength="100" style="stroke-dashoffset:${100 - gauge}"/></svg>
            <div class="ring-num"><strong>${overall === null ? "n/a" : overall}</strong><span class="muted small">of 12</span></div>
          </div>
          <div>
            <h2>Overall level</h2>
            <p class="muted">${overall === null ? "No scores yet. Start with the diagnostic so the plan fits you." : `Estimated CLB <strong>${overall}</strong> against your target of <strong>${settings.targetCLB}</strong>.`}</p>
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
          ${weeks !== null ? `<div class="tile-num">${weeks > 0 ? weeks : 0}</div><p class="muted small">${weeks > 0 ? `week${weeks === 1 ? "" : "s"} to go` : "Your test date has arrived or passed."}</p>` : `<p class="muted small">No date yet.</p><a class="btn btn-sm" href="#/settings">Add your test date</a>`}
        </div>
        ${diagDone < 4 ? `<div class="card tile span-4 today"><h2>Start here: the diagnostic</h2><p>A short cold test in each skill (${diagDone} of 4 done). It sets your starting point and shapes your plan. Do it before you study, without looking anything up.</p><a class="btn btn-primary" href="#/diagnostic">Open the diagnostic</a></div>` : ""}
        <div class="card tile span-2 today">
          <span class="badge">Today</span> <strong>${plan.label}</strong>
          <ul class="tips-list mt">${plan.steps.map(s => `<li><a href="${s.href}">${escapeHtml(s.text)}</a> <span class="muted">(about ${s.min} min)</span></li>`).join("")}</ul>
        </div>
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
              return `<li><strong>${SKILL_NAMES[w.skill]}, ${escapeHtml((parts[w.part - 1] || { name: "Part " + w.part }).name)}</strong>: ${w.pct}% right over ${w.total} questions. <button class="btn btn-sm" data-skill="${w.skill}" data-part="${w.part}">Drill this part</button></li>`;
            }).join("")}</ul>` : `<p class="muted">Answer at least four questions in a part and your lowest-scoring parts will appear here.</p>`}
        </div>
        <a class="card tile cta" href="#/review"><h3>Mistakes to review</h3><div class="tile-num">${due}</div><p class="muted small">due now</p></a>
        <a class="card tile cta" href="#/vocab"><h3>Word cards</h3><div class="tile-num">${vDue}</div><p class="muted small">ready</p></a>
        <div class="card tile span-4"><h2>Progress over time</h2>${lineChart(history, settings.targetCLB) || '<p class="muted">Your chart appears after your first scored practice. Target: CLB ' + settings.targetCLB + '.</p>'}</div>
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
        <h2 class="mt">Part by part</h2>
        ${ov.parts.map((p, i) => {
          const les = lessons[i];
          return `<details class="model"><summary>${escapeHtml(p.name)}</summary>
            <p class="muted">${escapeHtml(p.desc)}</p>
            ${les ? `<p><strong>What it tests:</strong> ${escapeHtml(les.whatItTests)}</p>
              <h4>Strategy</h4><ul class="tips-list">${les.strategy.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
              <h4>Pitfalls</h4><ul class="tips-list">${les.pitfalls.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
              <p><strong>How to practise:</strong> ${escapeHtml(les.howToPractice)}</p>
              ${les.structure ? `<h4>A simple structure</h4><div class="passage-text model-text">${escapeHtml(les.structure)}</div>` : ""}` : ""}
            <a class="btn" href="#/practice/${skill.id}">Practise ${skill.name}</a></details>`;
        }).join("")}
        <div class="grid-2 mt"><div class="card"><h3>Strategy tips</h3><ul class="tips-list">${ov.tips.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>
        ${ov.rubricCriteria ? `<div class="card"><h3>What is assessed</h3><ul class="tips-list">${ov.rubricCriteria.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>` : ""}</div>
        <p class="muted small mt">Lessons are general study advice written for this app. They are not official guidance.</p>
      `);
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
        <div class="run-header"><span class="tag">Review ${i + 1} of ${queue.length}</span><span class="muted small">${SKILL_NAMES[m.skill]}, ${escapeHtml(p.part)}. Box ${m.box} of 6.</span></div>
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
        <div class="grid-3">${topics.map(x => `<a class="card cta" href="#/grammar/${x.id}"><h3>${escapeHtml(x.topic)}</h3><p class="muted small">${best[x.id] !== undefined ? "Best: " + best[x.id] + " of " + x.items.length : "Not tried"}</p></a>`).join("")}</div>`);
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

  // ================= PLAN =================
  route("plan", () => {
    setPageTitle("Plan");
    const settings = Storage.getSettings(), history = Storage.getHistory();
    const base = {};
    SKILLS.forEach(s => { const d = diagnosticFor(s.id); base[s.id] = d ? d.clb : latestClbForSkill(history, s.id); });
    const gaps = SKILLS.map(s => ({ s, clb: base[s.id], gap: base[s.id] === null ? null : Math.max(0, settings.targetCLB - base[s.id]) }));
    const known = gaps.filter(g => g.gap !== null).sort((a, b) => b.gap - a.gap);
    const weeks = settings.examDate ? Math.ceil((new Date(settings.examDate) - new Date()) / (7 * DAY)) : null;
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const order = [1, 2, 3, 4, 5, 6, 0];
    mount(`
      <h1>Study plan</h1>
      <p class="muted">A weekly rhythm built around sessions of about ${settings.sessionMin} minutes (change this in Settings). The rhythm itself is a proposal you can ignore or adapt.</p>
      ${known.length ? `<div class="card"><h3>Where you are against CLB ${settings.targetCLB}</h3><ul class="tips-list">${gaps.map(g => `<li><strong>${g.s.name}:</strong> ${g.clb === null ? "no score yet (take the diagnostic)" : "about CLB " + g.clb + (g.gap ? `, ${g.gap} level${g.gap === 1 ? "" : "s"} below target` : ", at or above target")}</li>`).join("")}</ul>
        <p>Biggest gap: <strong>${known[0].s.name}</strong>${known[0].gap ? "." : " (none; keep practising to stay there)."} Add one extra half-session on that skill each week.</p></div>`
        : `<div class="card today"><p>You have no scores yet, so the plan cannot point at a weak skill. <a href="#/diagnostic">Take the diagnostic first</a>.</p></div>`}
      ${weeks !== null ? `<div class="card mt"><p>${weeks > 0 ? `Your test date is in about <strong>${weeks}</strong> week${weeks === 1 ? "" : "s"}.` : "Your test date has arrived or passed."} Plan one timed full exam about two weeks before.</p></div>` : `<p class="muted mt">Add a test date in <a href="#/settings">Settings</a> to see a countdown.</p>`}
      <h2 class="mt">The week</h2>
      <div class="week-plan">${order.map(d => { const p = dayPlan(d, settings); return `<div class="card week-card"><div class="week-badge">${names[d]}<br><span class="muted small">${p.label}</span></div><ul class="tips-list">${p.steps.map(s => `<li><a href="${s.href}">${escapeHtml(s.text)}</a> <span class="muted">(about ${s.min} min)</span></li>`).join("")}</ul></div>`; }).join("")}</div>
      <p class="muted small mt">Time estimates are a guide. There is no research behind the exact split; adjust it to what works for you.</p>
    `);
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
            <td>${h.type === "exam" ? "L" + h.breakdown.listening.clb + " R" + h.breakdown.reading.clb + " W" + h.breakdown.writing.clb + " S" + h.breakdown.speaking.clb : (h.pct !== undefined ? h.pct + "%" : (h.checklistScore !== undefined ? h.checklistScore + "/" + h.checklistTotal : ""))}</td>
            <td><strong>${h.type === "exam" ? h.overall : h.clb}</strong> CLB</td><td><button class="btn-icon" data-id="${h.id}" aria-label="Delete this attempt" title="Delete">&times;</button></td></tr>`).join("")}
        </tbody></table></div>
        <div class="cta-row-single"><button class="btn" id="clearAll">Clear all history</button></div>`}
    `);
    app.querySelectorAll(".btn-icon").forEach(b => b.onclick = () => { Storage.deleteAttempt(b.dataset.id); render(); });
    const c = document.getElementById("clearAll");
    if (c) c.onclick = () => { if (confirm("Delete all saved history? This cannot be undone.")) { Storage.clearHistory(); render(); } };
  });

  // ================= SETTINGS =================
  route("settings", () => {
    setPageTitle("Settings");
    const st = Storage.getSettings();
    mount(`
      <h1>Settings</h1>
      <div class="card">
        <label class="field-label" for="nameInput">Your first name (optional)</label><input type="text" id="nameInput" value="${escapeHtml(st.name)}" autocomplete="off">
        <label class="field-label" for="targetSlider">Target level (CLB)</label><input type="range" min="4" max="12" value="${st.targetCLB}" id="targetSlider"><div class="muted small">Target: <strong id="targetVal">${st.targetCLB}</strong></div>
        <label class="field-label" for="sessionInput">Minutes for a study session</label><input type="number" id="sessionInput" min="20" max="240" value="${st.sessionMin}">
        <label class="field-label" for="hoursSlider">Hours available per week</label><input type="range" min="2" max="30" value="${st.hoursPerWeek}" id="hoursSlider"><div class="muted small">Per week: <strong id="hoursVal">${st.hoursPerWeek}</strong> hours</div>
        <label class="field-label" for="examDateInput">Test date (optional)</label><input type="date" id="examDateInput" value="${escapeHtml(st.examDate)}">
        <div class="cta-row-single"><button class="btn btn-primary" id="saveSettings">Save</button></div>
      </div>
      <div class="card mt"><h3>Speaking transcripts</h3>
        <label class="check-row"><input type="checkbox" id="sttToggle" ${st.speechToText ? "checked" : ""}><span>Turn my spoken answers into text after Speaking practice</span></label>
        <p class="muted small">Off unless you switch it on. A transcript lets the app count your words and pace and show what you said. To make it, your browser sends your spoken answer to an online speech service (in Chrome, Google's). Your recording itself stays on this device either way.</p>
        <p id="sttMsg" class="muted small" role="status"></p>
      </div>
      <div class="card mt"><h3>Your data</h3>
        <p class="muted">Everything is stored only in this browser. Nothing is sent anywhere unless you switch on Speaking transcripts above: there is no account and no key. Export a backup file now and then; browsers can lose stored data if you clear it.</p>
        <div class="cta-row-single"><button class="btn" id="exportBtn">Export a backup (JSON file)</button>
          <label class="btn" for="importFile">Import a backup</label><input type="file" id="importFile" accept="application/json" class="sr-only"><button class="btn" id="resetAll">Reset all data</button></div>
        <p id="dataMsg" class="muted small mt" role="status"></p>
      </div>
    `);
    document.getElementById("targetSlider").oninput = e => document.getElementById("targetVal").textContent = e.target.value;
    document.getElementById("hoursSlider").oninput = e => document.getElementById("hoursVal").textContent = e.target.value;
    document.getElementById("saveSettings").onclick = () => {
      Storage.saveSettings({ ...Storage.getSettings(), name: document.getElementById("nameInput").value.trim(), targetCLB: parseInt(document.getElementById("targetSlider").value), hoursPerWeek: parseInt(document.getElementById("hoursSlider").value),
        examDate: document.getElementById("examDateInput").value, sessionMin: Math.max(20, parseInt(document.getElementById("sessionInput").value) || 75) });
      navigate("#/dashboard");
    };
    // Saved as soon as it is ticked, so it never waits for the Save button.
    document.getElementById("sttToggle").onchange = e => {
      Storage.saveSettings({ ...Storage.getSettings(), speechToText: e.target.checked });
      document.getElementById("sttMsg").textContent = e.target.checked ? "Transcripts on. Speaking answers will be sent to your browser's speech service." : "Transcripts off. Nothing leaves this browser.";
    };
    document.getElementById("exportBtn").onclick = () => download("celpip-backup-" + today() + ".json", JSON.stringify(Storage.exportAll(), null, 1), "application/json");
    document.getElementById("importFile").onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        let obj = null;
        try { obj = JSON.parse(r.result); } catch (x) { obj = null; }
        document.getElementById("dataMsg").textContent = Storage.importAll(obj) ? "Backup imported. Open the dashboard to see it." : "That file could not be read as a backup.";
      };
      r.readAsText(f);
    };
    document.getElementById("resetAll").onclick = () => { if (confirm("This erases all history, notes and settings in this browser. Continue?")) { Storage.resetAll(); render(); } };
  });

  // ---------- Theme button in the header ----------
  const themeBtn = document.getElementById("themeBtn");
  function syncTheme() { const dark = document.documentElement.getAttribute("data-theme") === "dark"; themeBtn.setAttribute("aria-pressed", String(dark)); }
  themeBtn.onclick = () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("celpip_theme", next); } catch (e) {}
    syncTheme();
  };
  syncTheme();

  // Everything is registered, so draw the first screen.
  render();
})();
