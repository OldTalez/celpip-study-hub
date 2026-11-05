/* CELPIP Study Hub v2: builds a calendar file (.ics) from the study plan. Pure functions: text in, text out.
 *
 * LEARNING NOTE (for beginners): an ".ics" file is plain text that any calendar app (Google, Apple, Outlook) can import. The format
 * is a standard called iCalendar (RFC 5545). The file is made inside your browser from your own plan and handed to you as a download;
 * nothing is sent anywhere. The screen code in js/study.js calls buildIcs() and offers the result as a file.
 * The format has strict rules, and each one has a reason:
 *   - Lines end with CRLF (carriage return + line feed, "\r\n"), not just "\n".
 *   - A line may not be longer than 75 bytes, so longer lines are "folded": cut, then the next line starts with one space.
 *   - In text values, the characters backslash, semicolon and comma and real line breaks must be escaped (written \\ \; \, \n), because the
 *     format uses them as separators. Escaping also means no typed text can add a line of its own to the file (a "line injection").
 *   - "Floating" time means a clock time with no time zone ("07:30" wherever you are). It avoids time-zone mistakes, and an event that
 *     repeats every week stays at 07:30 on your calendar even when daylight saving time changes.
 * What goes into the file: day, time, session length, the focus skill and the task list, all from the plan. What never goes in: your name,
 * your notes, your scores or anything you typed in free text. The only learner-typed values used are the study days, time and test date,
 * and those were checked when they were saved (and are checked again here).
 * Loaded after js/prescription.js and before js/study.js (see index.html).
 */
const CalendarExport = (() => {
  "use strict";
  const DEFAULT_TIME = "18:00";   // guide: used only when the learner has not chosen a time in Settings; the page says so
  const ALARM_MIN = 10;           // reminder 10 minutes before the session (Board brief, T-030 turn 2)
  const DEFAULT_WEEKS = 12;       // guide: repeat for 12 weeks when there is no usable test date (Board brief)
  const MAX_OCTETS = 75;          // RFC 5545 section 3.1: lines are at most 75 octets (bytes), not counting the CRLF
  const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const pad = n => String(n).padStart(2, "0");
  const stamp = d => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00"; // floating: no "Z", no zone
  const utcStamp = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  const dayStamp = ymd => ymd.replace(/-/g, "");
  const enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  const octets = ch => enc ? enc.encode(ch).length : unescape(encodeURIComponent(ch)).length;

  // Escape a text value. Order matters: backslashes first, or the ones we add would be doubled.
  function escapeText(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
  }
  // Fold one logical line into physical lines of at most 75 octets. Never cuts inside a multi-byte character.
  function foldLine(line) {
    const out = []; let cur = "", n = 0;
    for (const ch of line) {                 // "for ... of" walks whole characters, not half-characters
      const b = octets(ch), limit = out.length ? MAX_OCTETS - 1 : MAX_OCTETS; // continuation lines begin with a space, which costs 1
      if (n + b > limit) { out.push(cur); cur = ""; n = 0; }
      cur += ch; n += b;
    }
    out.push(cur);
    return out.map((l, i) => (i ? " " : "") + l).join("\r\n");
  }

  // input: { sched, settings, today ("YYYY-MM-DD"), now (Date), focusName(focus), tasksFor(focus, dateStr) -> [{text, min}] }
  // Returns { ok:true, text, count, untilDay, usedDefaultTime, time } or { ok:false, error }.
  function buildIcs(input) {
    const { sched, settings, today, now, focusName, tasksFor } = input;
    const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
    // each weekday has its own time if given (settings.studyTimes), else the shared time, else the default
    const timeOf = dow => { const own = settings.studyTimes && Object.prototype.hasOwnProperty.call(settings.studyTimes, String(dow)) ? settings.studyTimes[String(dow)] : ""; return HHMM.test(String(own)) ? own : HHMM.test(String(settings.studyTime || "")) ? settings.studyTime : DEFAULT_TIME; };
    const ownOrShared = dow => { const o = settings.studyTimes && Object.prototype.hasOwnProperty.call(settings.studyTimes, String(dow)) ? settings.studyTimes[String(dow)] : ""; return HHMM.test(String(o)) || HHMM.test(String(settings.studyTime || "")); };
    const used = [];
    let defaulted = false;   // true when some day had no time of its own and no shared time
    const day = s => new Date(s + "T12:00:00");
    const plus = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
    // Last day events may start: the day before the test, or 12 weeks ahead.
    const examOk = /^\d{4}-\d{2}-\d{2}$/.test(String(settings.examDate || "")) && !isNaN(day(settings.examDate)) && settings.examDate > today;
    const untilDay = examOk ? plus(settings.examDate, -1) : plus(today, DEFAULT_WEEKS * 7);
    const hhmmNow = pad(now.getHours()) + ":" + pad(now.getMinutes());
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MacKenzie Enterprise//CELPIP Study Hub//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:CELPIP study sessions"];
    let count = 0;
    sched.days.forEach(d => {
      // First date: the next day with this weekday, today only if the session time has not passed yet.
      const time = timeOf(d.dow), [hh, mm] = time.split(":").map(Number);
      let first = today;
      for (let i = 0; i < 8; i++) { first = plus(today, i); if (day(first).getDay() === d.dow && !(i === 0 && time <= hhmmNow)) break; }
      if (first > untilDay) return; // the test is too close for a session on this weekday
      const start = day(first); start.setHours(hh, mm, 0, 0);
      const end = new Date(start.getTime() + d.minutes * 60000);
      const name = focusName(d.focus);
      const tasks = (tasksFor(d.focus, first) || []).map(t => "- " + t.text + " (about " + t.min + " min)");
      const desc = ["Planned from your CELPIP Study Hub plan. A planning guide, not official CELPIP advice.", "Tasks:"].concat(tasks.length ? tasks : ["- Open the app and follow today's plan."]).join("\n");
      lines.push("BEGIN:VEVENT",
        "UID:celpip-study-" + d.dow + "-" + dayStamp(first) + "@celpip-study-hub.local", // same UID every time: importing again updates, not duplicates
        "DTSTAMP:" + utcStamp(now),
        "DTSTART:" + stamp(start),
        "DTEND:" + stamp(end),
        "RRULE:FREQ=WEEKLY;BYDAY=" + BYDAY[d.dow] + ";UNTIL=" + dayStamp(untilDay) + "T235959", // floating start needs a floating UNTIL (RFC 5545 3.3.10)
        "SUMMARY:" + escapeText("CELPIP study: " + name),
        "DESCRIPTION:" + escapeText(desc),
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + escapeText("CELPIP study in " + ALARM_MIN + " minutes"), "TRIGGER:-PT" + ALARM_MIN + "M", "END:VALARM",
        "END:VEVENT");
      count++; used.push(time); if (!ownOrShared(d.dow)) defaulted = true;
    });
    if (!count) return { ok: false, error: "There is no planned study day before your test date, so there is nothing to add." };
    lines.push("END:VCALENDAR");
    return { ok: true, text: lines.map(foldLine).join("\r\n") + "\r\n", count, untilDay, time: used.every(x => x === used[0]) ? used[0] : "a time for each day", times: used, usedDefaultTime: defaulted };
  }

  const api = { buildIcs, escapeText, foldLine, DEFAULT_TIME, ALARM_MIN, DEFAULT_WEEKS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  return api;
})();
