/* CELPIP Study Hub v2: the study-prescription engine ("My plan"), pure functions only.
 *
 * LEARNING NOTE (for beginners): a "pure function" takes inputs and returns an answer, and touches nothing else: no
 * page, no storage, no clock (today's date is passed in). That makes it easy to test: give it fixed inputs and check the
 * output. The screen code in js/study.js reads the learner's data, calls these functions, and draws the result.
 * Every number below is a named constant with a comment saying where it comes from. The source is the evidence note
 *   Knowledge/Research/2026-11-05 celpip-study-prescription-evidence.md  (Usung, retrieved 2026-11-05), called "the note".
 * Confidence labels are the note's: High / Medium / Low. Most numbers here are Low: planning guides, not facts.
 * Numbers marked "guide" are Nsikak's own choice (the note has no figure); the screen says so where it matters.
 * Nothing here promises a score or a date. Hours-per-level is INFERRED from general-English data, not official.
 * Loaded after js/storage.js and before js/study.js (see index.html). Also loadable in Node for quick checks.
 */
const Prescription = (() => {
  "use strict";

  // ---------- Constants (every one traceable) ----------
  const SKILL_IDS = ["listening", "reading", "writing", "speaking"];
  // Hours per CLB step: about 70 (Board-supplied celpip.ca "Test Format & Scoring" score chart, 2026-11-05: CLB 7-9 = CEFR B2, so one
  // B2 band holds 3 CLB steps; Cambridge's ~200 guided hours per CEFR band / 3 = ~70). The note's earlier 100 is replaced. Low confidence;
  // INFERRED from general-English data, not official CELPIP. CLB 10-11 = C1 and 12 = C2, CLB 5-6 = B1, 3-4 = A2: outside CLB 7-9 the same
  // 70 is used but confidence is even lower (see LOW_CONFIDENCE_OUTSIDE).
  const HOURS_PER_STEP = 70;
  const LOW_CONFIDENCE_FROM = 7, LOW_CONFIDENCE_TO = 9; // the CLB band (B2) where the 70 is best supported
  const HOURS_PER_STEP_RANGE = [50, 150]; // note: "shown as 50 to 150" (kept). Low. Always show the range, never the single number.
  const MIN_STUDY_DAYS = 3;               // note, Rules: weekly minimum 3 study days. Low (Dunlosky 2013 supports spacing; "3" is inferred).
  const MIN_WEEKLY_HOURS = 3;             // note, Rules: ... and 3 hours, else "off track". Low.
  const BLOCK_MIN = 25, BLOCK_MAX = 45;   // note, Rules: session blocks of 25 to 45 minutes. Low, no source.
  const WEIGHT_OFFSET = 0.5;              // note, Rules: skill weight = (target - current) + 0.5. Low, inferred.
  const SKILL_FLOOR = 0.10;               // note, Rules: floor 10% each, so no skill drops to zero. Low.
  const RETRIEVAL_MIN_SHARE = 0.6;        // note, Rules: at least 60% of time on questions / recall. Medium (Dunlosky 2013).
  const REREAD_MAX_SHARE = 0.2;           // note, Rules: under 20% rereading. Medium. (Shown on screen; the app has almost no rereading steps.)
  const REVIEW_FRACTION = 0.15;           // note, Rules: next review after about 15% of the days left. Medium (Cepeda 2006: 10 to 20%).
  const REVIEW_MIN_DAYS = 1, REVIEW_MAX_DAYS = 14; // note, Rules: clamp 1 to 14 days.
  const REVIEW_LADDER = [1, 3, 7, 14, 30]; // note, Rules: mistake and vocab ladder 1, 3, 7, 14, 30 days. Low (inferred).
  const MOCK_EVERY_DAYS = 14;             // note, Rules: a full mock about every 2 weeks. Low (cadence from C-grade plans).
  const MOCK_WEEKLY_WITHIN_DAYS = 21;     // note, Rules: weekly in the last 3 weeks. Low.
  const MOCK_NONE_WITHIN_DAYS = 2;        // note, Rules: none in the last 2 days. Low.
  // Milestone targets. The note gives no passage or task counts, so these are the guide's (Nsikak, 2026-11-05), small enough to do in
  // a week of about 8 hours. They are labelled "guide" on screen. The 80% / 75% accuracy bars are the guide's too.
  const READING_PASSAGES_PER_WEEK = 3, READING_PASSAGE_PCT = 80, READING_TIMED_BEFORE_TEST = 2;
  const WRITING_TASKS_PER_WEEK = 2;
  const SPEAKING_TASKS_PER_WEEK = 6;
  const LISTENING_PART_PCT = 75, LISTENING_PART_MIN_QUESTIONS = 8;
  const MOCKS_BEFORE_TEST = 2;            // note, Q4: third-party plans suggest 2 to 3 full mocks in the last two weeks. Low (grade C).
  const DAY_MS = 24 * 60 * 60 * 1000;

  // ---------- Small helpers ----------
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseDay = s => new Date(s + "T12:00:00"); // noon, so a daylight-saving change never moves the date
  const isDay = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseDay(s));
  const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return ymd(d); };
  const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / DAY_MS); // b minus a, whole days
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const round1 = v => Math.round(v * 10) / 10;
  // Hours to show: whole numbers, or one decimal when under 1 (so 0.4 does not become 0). No false precision such as "44.4".
  const niceHours = v => v < 1 ? round1(v) : Math.round(v);
  const isNum = v => typeof v === "number" && Number.isFinite(v);

  // Preferred days arrive from storage, which could hold anything: keep only whole numbers 0 (Sunday) to 6, once each.
  function cleanDays(days) {
    if (!Array.isArray(days)) return [];
    return Array.from(new Set(days.filter(d => Number.isInteger(d) && d >= 0 && d <= 6))).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // Monday first
  }
  // Monday of the week containing the given date (weeks run Monday to Sunday, matching the day checkboxes in Settings).
  function weekStart(dateStr) { const dow = parseDay(dateStr).getDay(); return addDays(dateStr, -((dow + 6) % 7)); }
  function weeksLeft(settings, today) {
    if (!isDay(settings.examDate)) return null;
    const d = daysBetween(today, settings.examDate);
    return d < 0 ? 0 : d / 7;
  }

  // ---------- 1. Split of the week across skills ----------
  // latest = { listening: 7, reading: null, ... } (null = no score yet). Returns shares that add to 1.
  function skillShares(latest, target) {
    const known = SKILL_IDS.filter(s => isNum(latest[s]));
    const missing = SKILL_IDS.filter(s => !isNum(latest[s]));
    const shares = {};
    if (!known.length) { SKILL_IDS.forEach(s => { shares[s] = 1 / SKILL_IDS.length; }); return { shares, missing, equal: true }; }
    const w = {};
    known.forEach(s => { w[s] = Math.max(0, target - latest[s]) + WEIGHT_OFFSET; });
    // A skill with no score has no gap to weigh; give it the average weight of the others until it is measured (the diagnostic fixes that).
    const avg = known.reduce((a, s) => a + w[s], 0) / known.length;
    missing.forEach(s => { w[s] = avg; });
    // Floor: any share under 10% is lifted to 10%; the others are scaled down so the total stays 1.
    let total = SKILL_IDS.reduce((a, s) => a + w[s], 0);
    SKILL_IDS.forEach(s => { shares[s] = w[s] / total; });
    const low = SKILL_IDS.filter(s => shares[s] < SKILL_FLOOR);
    if (low.length) {
      const rest = SKILL_IDS.filter(s => !low.includes(s));
      const restTotal = rest.reduce((a, s) => a + shares[s], 0);
      const room = 1 - SKILL_FLOOR * low.length;
      low.forEach(s => { shares[s] = SKILL_FLOOR; });
      rest.forEach(s => { shares[s] = shares[s] / restTotal * room; });
    }
    return { shares, missing, equal: false };
  }

  // ---------- 2. Weekly target, days and sessions ----------
  function weeklyMinutes(settings) { return Math.round(clamp(Number(settings.hoursPerWeek) || 8, 2, 30) * 60); }

  // Days: the learner's preferred days; if none are chosen, spread enough days to fit the weekly minutes into their usual session length.
  function schedule(settings, shares) {
    const weekly = weeklyMinutes(settings);
    let days = cleanDays(settings.studyDays), chosen = days.length > 0;
    if (!chosen) {
      const n = clamp(Math.ceil(weekly / (clamp(Number(settings.sessionMin) || 75, 20, 240))), MIN_STUDY_DAYS, 7);
      const spread = { 3: [1, 3, 5], 4: [1, 2, 4, 6], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6], 7: [1, 2, 3, 4, 5, 6, 0] }; // suggested, Monday first
      days = spread[n];
    }
    const sessionMin = Math.round(weekly / days.length);
    const blocks = sessionMin <= BLOCK_MAX ? 1 : Math.ceil(sessionMin / BLOCK_MAX);
    const blockMin = Math.round(sessionMin / blocks);
    // Which skill leads each session: share the sessions among skills by their minutes (largest remainder), biggest share first.
    const order = SKILL_IDS.slice().sort((a, b) => shares[b] - shares[a]);
    const counts = {}; let used = 0;
    order.forEach(s => { counts[s] = Math.floor(shares[s] * days.length); used += counts[s]; });
    order.slice().sort((a, b) => (shares[b] * days.length - Math.floor(shares[b] * days.length)) - (shares[a] * days.length - Math.floor(shares[a] * days.length)))
      .slice(0, days.length - used).forEach(s => { counts[s]++; });
    // Spread repeats apart: round-robin through the skills that have sessions.
    const rotated = []; const left = Object.assign({}, counts);
    while (rotated.length < days.length) order.forEach(s => { if (left[s] > 0 && rotated.length < days.length) { rotated.push(s); left[s]--; } });
    const plan = days.map((dow, i) => ({ dow, focus: rotated[i], minutes: sessionMin }));
    return { weeklyMin: weekly, days: plan, chosen, belowMinimum: days.length < MIN_STUDY_DAYS || weekly < MIN_WEEKLY_HOURS * 60, sessionMin, blocks, blockMin };
  }

  // ---------- 3. Today's tasks ----------
  // templates = { reading: [ {min, text, href}, ... ], ... } built by the screen from the existing weekly rhythm (dayPlan).
  // A step counts as "retrieval" (questions, recall, timed work) unless it is a study note or a look at the dashboard.
  const NOT_RETRIEVAL = /^#\/(notes|dashboard|learn)/;
  const isRetrieval = step => !NOT_RETRIEVAL.test(step.href);
  function todayTasks(sched, today, templates) {
    const dow = parseDay(today).getDay();
    const mine = sched.days.find(d => d.dow === dow);
    if (!mine) {
      const next = sched.days.map(d => ({ d, gap: ((d.dow - dow + 7) % 7) || 7 })).sort((a, b) => a.gap - b.gap)[0];
      return { isStudyDay: false, nextStudyInDays: next ? next.gap : null, nextFocus: next ? next.d.focus : null, tasks: [], sessionMin: sched.sessionMin, retrievalShare: null };
    }
    // Copy the steps and scale them to the session length, then enforce the 60% retrieval rule.
    let steps = (templates[mine.focus] || []).map(s => ({ min: s.min, text: s.text, href: s.href, retrieval: isRetrieval(s) }));
    const sum = steps.reduce((a, s) => a + s.min, 0) || 1;
    steps.forEach(s => { s.min = Math.max(5, Math.round(s.min * sched.sessionMin / sum)); });
    const retr = () => steps.filter(s => s.retrieval).reduce((a, s) => a + s.min, 0);
    const total = () => steps.reduce((a, s) => a + s.min, 0);
    const lead = steps.find(s => s.retrieval);
    let guard = 0;
    while (lead && retr() / total() < RETRIEVAL_MIN_SHARE && guard++ < 50) {
      const other = steps.filter(s => !s.retrieval && s.min > 5).sort((a, b) => b.min - a.min)[0];
      if (!other) break;
      const move = Math.min(5, other.min - 5); other.min -= move; lead.min += move; // move minutes from notes to questions, 5 at a time
    }
    if (lead && retr() / total() < RETRIEVAL_MIN_SHARE) steps = steps.filter(s => s.retrieval); // a note step that cannot shrink further is dropped
    return { isStudyDay: true, focus: mine.focus, sessionMin: sched.sessionMin, tasks: steps, retrievalShare: steps.length ? Math.round(100 * retr() / total()) : null };
  }

  // ---------- 4. Review spacing and mock cadence ----------
  function reviewSpacing(daysLeft) {
    const base = daysLeft === null ? REVIEW_MAX_DAYS : Math.round(daysLeft * REVIEW_FRACTION); // no test date: the longest gap is fine
    return { nextReviewDays: clamp(base, REVIEW_MIN_DAYS, REVIEW_MAX_DAYS), ladder: REVIEW_LADDER.slice() };
  }
  // lastMock = date string of the latest full exam (or null); hasDiagnostic = any diagnostic taken.
  function mockPlan(today, examDate, lastMock, hasDiagnostic) {
    const left = isDay(examDate) ? daysBetween(today, examDate) : null;
    if (!hasDiagnostic) return { kind: "diagnostic", text: "Take the diagnostic first: a cold timed attempt in each skill. It tells the plan where you start.", dueInDays: 0 };
    if (left !== null && left < 0) return { kind: "none", text: "Your test date has passed. Set a new one in Settings.", dueInDays: null };
    if (left !== null && left <= MOCK_NONE_WITHIN_DAYS) return { kind: "none", text: "No mock exam now: rest and light review only in the last " + MOCK_NONE_WITHIN_DAYS + " days.", dueInDays: null };
    const every = left !== null && left <= MOCK_WEEKLY_WITHIN_DAYS ? 7 : MOCK_EVERY_DAYS;
    const since = lastMock ? daysBetween(lastMock, today) : null;
    const due = since === null ? 0 : Math.max(0, every - since);
    return { kind: "mock", every, dueInDays: due, text: (due === 0 ? "A full timed mock exam is due now" : "Next full timed mock exam in about " + due + " day" + (due === 1 ? "" : "s")) + " (about one every " + (every === 7 ? "week in the last 3 weeks" : "2 weeks") + ")." };
  }

  // ---------- 5. Projection (ranges only, never a promise) ----------
  const LABEL = "Planning estimate, not official";
  function projection(settings, latest, today) {
    const target = clamp(Number(settings.targetCLB) || 9, 4, 12);
    const known = SKILL_IDS.filter(s => isNum(latest[s]));
    const out = { label: LABEL, target, messages: [], missing: [], hoursPerStep: HOURS_PER_STEP, stepRange: HOURS_PER_STEP_RANGE.slice() };
    if (!known.length) out.missing.push("scores");
    const wk = weeksLeft(settings, today);
    if (wk === null) out.missing.push("test date");
    if (out.missing.includes("scores")) out.messages.push("No scores yet, so there is no projection. Take the diagnostic so the plan can see where you start.");
    if (out.missing.includes("test date")) out.messages.push("No test date, so the app cannot say what you can reach by then. Add one in Settings.");
    if (known.length && known.length < SKILL_IDS.length) out.messages.push("No score yet for " + SKILL_IDS.filter(s => !known.includes(s)).join(", ") + ", so " + (SKILL_IDS.length - known.length === 1 ? "it is" : "they are") + " left out of the numbers below.");
    if (!known.length) return out;
    // WHY THE LARGEST SINGLE GAP (turn 2 fix, 2026-11-05): the hours-per-level figure is about overall proficiency (Cambridge's ~200 guided
    // hours move a learner up one whole CEFR band), not "hours per skill". Adding up the gaps of four skills and multiplying counted the same
    // hours about four times over (a 44 to 133 hours-a-week answer). The goal is CLB 9 in EVERY skill, so the weakest skill sets the pace:
    // the hours come from the largest single-skill gap, and the study time is shared across the skills (see skillShares) rather than added up.
    const gaps = known.map(s => Math.max(0, target - latest[s]));
    const steps = Math.max(...gaps);
    out.stepsToTarget = steps;
    out.lowConfidence = target > LOW_CONFIDENCE_TO || known.some(s => latest[s] < LOW_CONFIDENCE_FROM);
    if (out.lowConfidence) out.messages.push("Confidence is lower here: the hours figure is best supported between CLB " + LOW_CONFIDENCE_FROM + " and " + LOW_CONFIDENCE_TO + ", and your levels or target reach outside that.");
    out.hoursNeeded = [steps * HOURS_PER_STEP_RANGE[0], steps * HOURS_PER_STEP_RANGE[1]]; // whole numbers already: steps and the range are whole
    if (steps === 0) out.messages.push("You are at or above CLB " + target + " in every scored skill. Keep practising to stay there.");
    if (wk === null) return out;
    if (wk <= 0) { out.messages.push("Your test date has arrived or passed, so there is no time left to project."); return out; }
    const weeklyHours = weeklyMinutes(settings) / 60;
    const availHours = weeklyHours * wk;
    // Average level now, and the gain that the available hours buy: hours / hours-per-step = steps of overall level (not divided by four).
    const avgNow = known.reduce((a, s) => a + latest[s], 0) / known.length;
    const gainLow = availHours / HOURS_PER_STEP_RANGE[1], gainHigh = availHours / HOURS_PER_STEP_RANGE[0];
    out.weeksLeft = Math.round(wk);
    out.availableHours = Math.round(availHours);
    out.projected = { low: Math.min(12, Math.round(avgNow + gainLow)), high: Math.min(12, Math.round(avgNow + gainHigh)), avgNow: round1(avgNow) };
    out.neededPerWeek = steps === 0 ? null : [niceHours(out.hoursNeeded[0] / wk), niceHours(out.hoursNeeded[1] / wk)];
    // Too short? Compare the hours left with the hours the gap needs, at the fast end, the middle and the slow end of the range.
    if (steps > 0) {
      const mid = steps * HOURS_PER_STEP;
      out.timeStatus = availHours < out.hoursNeeded[0] ? "short" : availHours < mid ? "tight" : "enough";
      if (out.timeStatus === "short") out.messages.push("The time left is short for this gap: even at the fast end of the range you would need about " + Math.round(out.hoursNeeded[0]) + " hours and you have about " + Math.round(availHours) + ". Consider a later test date or more hours a week.");
      else if (out.timeStatus === "tight") out.messages.push("The time left is tight for this gap: it fits only if you learn at the fast end of the range.");
    }
    return out;
  }

  // ---------- 6. Milestones ("to be good at X, do Y") ----------
  // h = list of attempts (date ISO, type, skill, mode, pct); partStats = { "listening|1": {right,total} };
  // weekStartDate = Monday as "YYYY-MM-DD". Each milestone: { skill, text, done, goal, have, met, basis }.
  const dayOf = a => { const d = new Date(a.date); return isNaN(d) ? null : ymd(d); };
  function milestones(history, partStats, weekStartDate, hasDiagnostic) {
    const inWeek = a => { const d = dayOf(a); return d !== null && d >= weekStartDate && d <= addDays(weekStartDate, 6); };
    const list = [];
    const add = (skill, text, have, goal, basis) => list.push({ skill, text, have: Math.min(have, goal), goal, met: have >= goal, basis });
    const mcqReading = history.filter(a => a.type === "practice" && a.skill === "reading" && isNum(a.pct));
    add("reading", "Reading: " + READING_PASSAGES_PER_WEEK + " passages this week at " + READING_PASSAGE_PCT + "% or better", mcqReading.filter(a => inWeek(a) && a.pct >= READING_PASSAGE_PCT).length, READING_PASSAGES_PER_WEEK, "guide");
    add("reading", "Reading: " + READING_TIMED_BEFORE_TEST + " timed sections before the test", history.filter(a => a.type === "practice" && a.skill === "reading" && a.mode === "mcq-timed").length, READING_TIMED_BEFORE_TEST, "guide; timed practice from the note, Roediger 2006");
    for (let part = 1; part <= 6; part++) {
      const s = partStats["listening|" + part];
      const total = s ? s.total : 0, pct = total ? Math.round(100 * s.right / total) : 0;
      list.push({ skill: "listening", text: "Listening part " + part + ": " + LISTENING_PART_PCT + "% or better over at least " + LISTENING_PART_MIN_QUESTIONS + " questions", have: total >= LISTENING_PART_MIN_QUESTIONS ? pct : 0, goal: LISTENING_PART_PCT, met: total >= LISTENING_PART_MIN_QUESTIONS && pct >= LISTENING_PART_PCT, basis: "guide", detail: total ? pct + "% over " + total + " questions" : "no questions yet", percent: true });
    }
    add("writing", "Writing: " + WRITING_TASKS_PER_WEEK + " timed tasks this week, each compared with the model answer", history.filter(a => a.type === "practice" && a.skill === "writing" && inWeek(a)).length, WRITING_TASKS_PER_WEEK, "guide");
    add("speaking", "Speaking: " + SPEAKING_TASKS_PER_WEEK + " recorded tasks this week", history.filter(a => a.type === "practice" && a.skill === "speaking" && inWeek(a)).length, SPEAKING_TASKS_PER_WEEK, "guide");
    add("all", "Take the diagnostic (a cold timed attempt in each skill)", hasDiagnostic ? 1 : 0, 1, "note, Q4 (grade C)");
    add("all", "Full timed mock exams before the test: " + MOCKS_BEFORE_TEST, history.filter(a => a.type === "exam").length, MOCKS_BEFORE_TEST, "note, Q4 (grade C)");
    return list;
  }

  // ---------- 7. This week's minutes ----------
  // studyTime = { "2026-11-05": { reading: 20, general: 15 } }. Returns minutes per skill (+general) in the Monday-to-Sunday week.
  function weekDone(days, weekStartDate) {
    const out = { listening: 0, reading: 0, writing: 0, speaking: 0, general: 0, total: 0 };
    for (let i = 0; i < 7; i++) {
      const day = days && days[addDays(weekStartDate, i)];
      if (!day) continue;
      Object.keys(out).forEach(k => { if (k !== "total" && isNum(day[k])) { out[k] += day[k]; out.total += day[k]; } });
    }
    Object.keys(out).forEach(k => { out[k] = Math.round(out[k] * 10) / 10; });
    return out;
  }

  // ---------- 8. On track or behind (T-030 turn 2) ----------
  // The week is compared with what the plan expected BY NOW, not with the whole week: on Monday morning nobody is "behind" a target
  // for Sunday. Expected so far = the minutes of the planned sessions on days BEFORE today (today is still open, so it never counts against you).
  // Thresholds are the guide's own (the note gives none for "on track"); they line up with the note's missed-day rule: one missed
  // session out of a few is "a little behind" (Lally 2010: one missed day does not matter much), two or more is "behind".
  const ON_TRACK_MIN_RATIO = 0.8;         // guide: 80% or more of the minutes expected so far counts as on track
  const LITTLE_BEHIND_MIN_RATIO = 0.5;    // guide: 50% to 80% is "a little behind"; under 50% is "behind"
  const SKILL_MIN_EXPECTED = 10;          // guide: a skill with under 10 minutes expected so far is too small to judge, so it reads "on track"
  function expectedSoFar(sched, today) {
    const wkStart = weekStart(today);
    return sched.days.reduce((a, d) => a + (addDays(wkStart, (d.dow + 6) % 7) < today ? sched.sessionMin : 0), 0);
  }
  function judge(expected, got) {
    const behindMin = Math.max(0, Math.round(expected - got));
    if (expected <= 0 || got >= expected * ON_TRACK_MIN_RATIO) return { status: "ontrack", text: "On track", behindMin: 0, expectedMin: Math.round(expected), doneMin: Math.round(got) };
    const little = got >= expected * LITTLE_BEHIND_MIN_RATIO;
    return { status: little ? "little" : "behind", text: (little ? "A little behind: " : "Behind: ") + behindMin + " min to catch up", behindMin, expectedMin: Math.round(expected), doneMin: Math.round(got) };
  }
  // done = weekDone(...) result. Time filed under "general" (review, words, grammar, exams, manual General) is shared across skills by their split.
  function onTrack(sched, shares, done, today) {
    const expected = expectedSoFar(sched, today);
    const skills = {};
    SKILL_IDS.forEach(k => {
      const exp = expected * shares[k], got = done[k] + done.general * shares[k];
      skills[k] = exp < SKILL_MIN_EXPECTED ? judge(0, got) : judge(exp, got);
    });
    return { overall: judge(expected, done.total), skills };
  }
  // The next planned session at or after "now" (a Date): { date, dow, focus, minutes, time (HH:MM or ""), daysAway }, or null.
  // The time for one weekday (T-031 turn C): its own time if the learner gave one, else the shared "usual time", else "".
  const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
  function timeFor(settings, dow) {
    const own = settings && settings.studyTimes && Object.prototype.hasOwnProperty.call(settings.studyTimes, String(dow)) ? settings.studyTimes[String(dow)] : "";
    if (HHMM.test(String(own))) return own;
    return settings && HHMM.test(String(settings.studyTime || "")) ? settings.studyTime : "";
  }
  // timeOf is either one "HH:MM" string (the old way) or a function from weekday number to a time.
  function nextSession(sched, timeOf, now) {
    const t = ymd(now), hhmm = pad(now.getHours()) + ":" + pad(now.getMinutes());
    for (let i = 0; i <= 7; i++) {
      const date = addDays(t, i), dow = parseDay(date).getDay(), d = sched.days.find(x => x.dow === dow);
      if (!d) continue;
      const timeStr = typeof timeOf === "function" ? timeOf(dow) : timeOf;
      if (i === 0 && timeStr && hhmm >= timeStr) continue; // today's session time has passed
      return { date, dow, focus: d.focus, minutes: d.minutes, time: timeStr || "", daysAway: i };
    }
    return null;
  }

  // ---------- 9. Check-in after missed days (T-030 turn 2) ----------
  // Rules from the note ("Streak" and "Catch-up", Low to Medium confidence): one missed day keeps the habit; two in a row resets the
  // streak count; make-up time is spread over at most the next 3 study days at no more than +25% a day, and dropped after 7 days.
  const CHECKIN_LOOKBACK_DAYS = 7;        // note: catch-up is dropped after 7 days, so older gaps are not counted
  const CHECKIN_RESET_AT = 2;             // note: two missed days in a row reset the streak
  const CATCHUP_MAX_DAYS = 3;             // note: spread over the next 3 study days
  const CATCHUP_MAX_EXTRA = 0.25;         // note: at most +25% a day
  // studied = Set of "YYYY-MM-DD" days with any study; firstDay = the earliest day the learner ever studied (null = never: nothing to check in on).
  // "Missed" = planned days since the learner last studied at all, before today. Studying on a different day than planned is not penalised.
  function checkIn(sched, studied, today, firstDay) {
    const none = { kind: "none", missed: [], catchUp: [], extraMin: 0 };
    if (!sched.chosen || !firstDay) return none; // only days the learner chose themselves can be "missed"
    const planned = new Set(sched.days.map(d => d.dow));
    const missed = [];
    for (let i = 1; i <= CHECKIN_LOOKBACK_DAYS; i++) {
      const d = addDays(today, -i);
      if (d < firstDay || studied.has(d)) break;
      if (planned.has(parseDay(d).getDay())) missed.push(d);
    }
    missed.reverse();
    if (!missed.length) return none;
    if (missed.length < CHECKIN_RESET_AT) return { kind: "one", missed, catchUp: [], extraMin: 0 };
    // Catch-up: the minutes of the missed sessions, but never more than +25% on each of up to 3 coming sessions.
    const upcoming = [];
    for (let i = 0; i <= CHECKIN_LOOKBACK_DAYS && upcoming.length < CATCHUP_MAX_DAYS; i++) {
      const d = addDays(today, i), dow = parseDay(d).getDay();
      if (planned.has(dow)) upcoming.push({ date: d, dow });
    }
    const cap = Math.floor(sched.sessionMin * CATCHUP_MAX_EXTRA);
    const each = upcoming.length ? Math.min(cap, Math.ceil(missed.length * sched.sessionMin / upcoming.length)) : 0;
    const catchUp = upcoming.map(u => ({ date: u.date, dow: u.dow, extraMin: each }));
    return { kind: "many", missed, catchUp, extraMin: each * catchUp.length };
  }

  const api = { niceHours, onTrack, nextSession, timeFor, checkIn, expectedSoFar, ON_TRACK_MIN_RATIO, LITTLE_BEHIND_MIN_RATIO, SKILL_MIN_EXPECTED, CHECKIN_LOOKBACK_DAYS, CHECKIN_RESET_AT, CATCHUP_MAX_DAYS, CATCHUP_MAX_EXTRA, parseDay, ymd, SKILL_IDS, HOURS_PER_STEP, HOURS_PER_STEP_RANGE, MIN_STUDY_DAYS, MIN_WEEKLY_HOURS, BLOCK_MIN, BLOCK_MAX, WEIGHT_OFFSET, SKILL_FLOOR, RETRIEVAL_MIN_SHARE, REREAD_MAX_SHARE,
    REVIEW_FRACTION, LABEL, LOW_CONFIDENCE_FROM, LOW_CONFIDENCE_TO, cleanDays, weekStart, weeksLeft, skillShares, weeklyMinutes, schedule, todayTasks, reviewSpacing, mockPlan, projection, milestones, weekDone, addDays, isDay };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  return api;
})();
