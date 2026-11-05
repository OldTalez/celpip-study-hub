# Learning guide: CELPIP Study Hub (version 2)

Written for someone new to programming. Every code file starts with a LEARNING NOTE. Version 2 was built on 2026-10-22 from version 1 (the folder `Celpip Test`, left untouched). Agent: Ufok. The look and frame were rebuilt on 2026-11-05 (T-029 turn A, Agent: Nsikak): see "The frame" below.

## What it is
A study website for the CELPIP English test. Open `index.html` in a browser: it runs completely on your computer, with no server, no install, no account, no outside library and no network call. It has lessons, practice by skill and by part, a timed section, a full timed exam, answer explanations, model answers, spaced review of your mistakes, word cards, grammar drills, a study plan, a study log with notes, and a light and a dark theme. Practice scores are rough estimates for study, not predictions of an official score.

## Open it
Double-click `index.html`. If your browser blocks something when opened as a file, run `python -m http.server 8000` in this folder and visit `http://127.0.0.1:8000`.

## How it works, end to end
1. `index.html` is the only page. It has a left menu (wide screens), a top bar and bottom tab bar (phones), a footer and an empty area called `app`. Before anything draws, a tiny script sets the light or dark theme.
2. The scripts at the bottom load in a fixed order: data files, then `shell.js`, `storage.js`, `scoring.js`, `app.js`, and last `study.js`. Order matters because each file uses names defined by the ones before it.
3. `app.js` is the engine: timers, speech, the microphone, the router, the multiple-choice practice, the writing and speaking runners, and the full exam.
4. `study.js` registers the screens (dashboard, learn, review, words, grammar, notes, plan, history, settings) and adds the study tools. At the very end it calls `render()`, which draws the screen for the current address.
5. The address after the `#` picks the screen (for example `#/review`). This is a "router". Click a link, the address changes, `render()` swaps the screen.
6. When you check a reading or listening passage, `app.js` calls `Study.recordMcq`, which saves each wrong answer in a review queue and updates your per-part accuracy. `Study.explanationHtml` shows the explanation under each question.
7. Everything you do is saved by `storage.js` in the browser's `localStorage`. Nothing leaves your computer.

## The files
| File | Job |
|---|---|
| `index.html` | The single page and the script load order |
| `css/style.css` | How everything looks; colours, shapes and the motion scale are named variables at the top, with a light and a dark set |
| `js/tools.js` | The practice tools (turn B): toasts, the question dots with Flag buttons, time per question, the highlight and notes pop-up, the word-count bar and the audio progress bar. Read its LEARNING NOTE first |
| `js/shell.js` | The frame around every screen: menu highlighting, Light / Dark / Auto theme, the More sheet, focus mode with its Exit question, header behaviour on scroll, and the lesson contents list |
| `fonts/` | The two bundled font families as small Latin-only WOFF2 files, with their licence (`OFL.txt`) |
| `js/app.js` | Engine: timers, speech, recording, router, practice runs, timed section, exam |
| `js/study.js` | The study screens and the `Study` helper (explanations, mistakes, model answers) |
| `js/storage.js` | Saving and loading history, settings and study data; converts a percentage to an estimated level |
| `js/scoring.js` | Scores writing and speaking text with simple maths (no network) |
| `js/data/*.js` | The original practice content (78 listening and 52 reading passages, 34 writing prompts, 72 speaking prompts) |
| `js/data/new/*.js` | Generated study material: explanations, model answers, words, grammar, lessons |
| `tools/build-data.js` | Rebuilds `js/data/new/*.js` from the JSON in `tools/work/out/` |
| `tools/validate-data.js` | The data self-check: unique ids, one correct option per question, no empty fields, counts |
| `tools/e2e-test.cjs` | Drives the whole app in a headless browser and reports PASS/FAIL (see its LEARNING NOTE) |
| `tools/check-contrast.js` | Checks text and background colours for readability in both themes |
| `tools/patch_app.py`, `tools/patch_app2.py` | The one-off scripts that changed version 1's `app.js` into this one (kept so the change can be audited) |
| `tools/work/` | The inputs and outputs used to write the study material |

## Ideas worth learning from this code
- **Data separate from logic.** Questions and material live in `js/data/`, so content can grow without touching the screens. To add a question, copy an entry and give it a new unique `id`, then run `node tools/validate-data.js`.
- **Spaced review (the Leitner method).** A wrong answer goes into box 0 and returns today. Each time you get it right it moves up a box and returns later: after 1, 3, 7, 14, 30 and then 60 days. A wrong answer sends it back to box 0. The code is in `Study.recordMcq` and the `review` route.
- **Late work must check the screen is still there.** Speech ending, a recording being saved or a fallback timer can finish after you have moved to another page. `render()` raises a counter, `screenId`; such work remembers the value it started with and checks `onScreen(id)` before drawing. `render()` also switches off the microphone, speech-to-text and the exam's leave warning, because those belong to the screen being left.
- **A link to the page already showing.** The browser sends no "hashchange" event when an address doesn't change, so a click handler in `app.js` redraws the page itself (this is what makes "Practice Again" work).
- **Escaping.** Anything typed by a person, or any text from data, passes through `escapeHtml` before it is shown, so it cannot run as code.
- **Plain SVG charts.** The progress chart is drawn with arithmetic and text tags, with no library. It uses dash patterns as well as colour, and a table below it holds the same numbers.
- **Accessibility.** Contrast of 4.5:1 or more (checked by a script), visible focus on every control, no colour-only signals (answers say "correct" or "your answer" in words), no emoji used as buttons.

- **One helper per job, used everywhere.** Every countdown shows its time through `paintTimer`, which also marks low time (clock icon and words) and the last seconds (red pill with an alert icon) and tells screen readers once. Every question form counts its answers through `watchAnswered`. Fixing or restyling one place fixes them all.
- **Sound as numbers.** The Speaking microphone bars (`MicMeter`) use the Web Audio API: an analyser hands over the sound wave as numbers, and how far they swing from silence is the loudness. Nothing leaves the device.
- **Highlighting is cutting text into pieces.** The Reading highlighter (`markRange`) walks each piece of text in the passage, splits out the selected part and wraps it in `<mark>`. In the exam the marked passage is kept per tab, so switching tabs keeps your marks.
- **Opt-in for anything that leaves the device.** Speech-to-text sends audio to an online service in Chrome and Edge, so it runs only when "Speaking transcripts" is switched on in Settings (off by default).

## The frame (added 2026-11-05, "A Lakeline")
- **Two menus, one rule.** At 1000px wide and up a left sidebar lists all 11 pages. Below that, a bottom tab bar holds Dashboard, Practice, Review, Exam and More; More opens a sheet with the other seven pages. The switch point is the number 1000 in `css/style.css` (two media queries) and in `shell.js` (the contents list). The current page is marked with `aria-current="page"` plus a bar, pill or bold text, so it is not colour alone.
- **Fonts.** Plus Jakarta Sans (headings) and Atkinson Hyperlegible (reading) are files in `fonts/`, so the site works offline and sends nothing to a font server. `font-display: swap` shows text at once and swaps when the file arrives; the two "Fallback" font faces in the CSS size a system font to match, so nothing jumps.
- **Theme.** Light, Dark or Auto, saved in `localStorage` under `celpip_theme`. Auto (the default) follows the device and changes live (`matchMedia("(prefers-color-scheme: dark)")`). The page carries the shown value in `data-theme`; the choice is in `data-theme-pref`. A saved "light" or "dark" from the old button still works; any other value means Auto.
- **Focus mode.** When a practice run or the Timed Exam starts, `Shell.focusMode.enter()` sets `data-mode="focus"` on the body: the menus slide away and a task bar with an Exit button appears. Exit (or Esc) opens a native `<dialog>` that asks first. `render()` always ends focus mode, so leaving by any route restores the menus. The exam still keeps its tab-close warning (`onbeforeunload`).
- **View Transitions.** `goToRoute()` in `app.js` wraps a screen change in `document.startViewTransition`, so the browser cross-fades old and new screens. If the browser lacks it, the route is unchanged, or the person asked for reduced motion, the screen simply switches.
- **Contents list.** On a Learn page, headings marked `data-toc` become a list of links (`Shell.contents`). An IntersectionObserver marks the section in view with `aria-current="location"`. The links scroll with JavaScript because the address after `#` is the router's.
- **One motion scale.** `--dur-1` to `--dur-4` and three easing curves are the only timings in the CSS; with reduced motion the durations become 0.

## Practice tools (added 2026-11-05, T-029 turn B, `js/tools.js`)
- **Question dots and Flag.** One dot per question: filled = answered, plain ring = not yet, accent outline = the question you are on, flag badge = marked for review. The dot's label says all of that in words too. Clicking a dot scrolls to and focuses that question. The dots repaint from the same `watchAnswered` counter that writes "3 of 6 answered", so there is one counter.
- **Time per question (method).** The question you touched last (focus, click, answer, dot) is "current"; its seconds go up while it is on screen, measured with clock readings (`Date.now`), paused while the browser tab is hidden or you are on another exam tab. `Storage.saveAttempt` stores `timing: { totalSec, perQuestionSec: [...], perPassageSec: [...] }` on each Reading/Listening attempt (exams: the multiple-choice sections only). A passage the timer cut off counts as zeros. "This question 0:48" shows beside the timer.
- **Highlight and notes.** Select words in a passage and a small pop-up offers Highlight and Add note (Tab from the passage reaches it, arrow keys move, Esc closes). The bar above the passage has the same actions as buttons, plus the old Highlighter pen. Notes are at most 280 characters, shown as plain text (`textContent`) in a tooltip, in a "Highlights and notes" list and in an edit box. They live only in memory for that screen (kept when you switch exam tabs); they are never saved to localStorage, History or the backup.
- **Practise like the real test.** A Settings switch (`examRealism`). On: no highlighter, notes, flags or "This question" clock, and the Listening audio plays once. The Timed Exam always works this way (`EXAM_REALISM.alwaysOn` in `tools.js`, one place to change).
- **Bars.** The Writing bar fills toward the target range and says Under / In range / Over in words; the Listening bar follows the voice's `boundary` events (character position / script length) and falls back to elapsed time against an estimate.
- **Toasts.** `toast("Saved")` shows one short message at a time (`role="status"`, fades after about 3 seconds; errors stay until dismissed). Written to `#toastHost` in `index.html`.

## Dashboard tiles (added 2026-11-05, T-029 turn C, `js/study.js`)
- **Radar chart** (`radarTile`): four arms (Listening top, Reading right, Writing bottom, Speaking left), the latest level as a filled shape, the target as a dashed outline, rings at 3, 6, 9, 12. A skill with no score is drawn at 0 and labelled "no score". "View as table" shows the same numbers.
- **Pace** (`paceTile`): average seconds per question over the last 10 timed attempts, compared with one constant, `PACE_GUIDE_SEC` (90). Zeros in the timing mean the clock cut a passage off, so they are left out.
- **Mastery grid** (`masteryTile`): percent right per part, from the same `partStats` the weak spots use. Each cell is a button that starts that part. Shading is capped so text stays readable, and the number is always printed.
- **Toolbar and toasts:** the passage bar now has "Highlight selection" and "Clear highlights"; a toast left over from the screen before is cleared on each screen change (`Toast.clear`, called by `render()`).

## What changed from version 1
- Removed the optional AI grading. It sent your text to a cloud service with a key kept in plain text in the browser. Version 2 also deletes any key an older version saved. Writing and speaking now use only the local scoring and a self-rating.
- Removed the Chart.js dependency (it was loaded from the internet).
- Replaced the blue theme and emoji icons with a light and dark theme and small drawn icons. The look is now the Board-approved "A Lakeline" (teal on cool greys); the earlier orange palette is gone.
- Added: diagnostic, weak-spot view, review queue, timed section, explanations for all 956 questions, model answers for all 34 writing prompts and 72 speaking prompts, 285 vocabulary cards, 24 grammar topics with 144 drill questions, 20 part lessons, 12 study tips, a study log with export, and a backup export and import.
- Your old saved history and settings still work (same storage names).

## Material quality, plainly
All new material was written by AI assistants on 2026-10-22, in the style of the test, and has not been reviewed by a person. Answer explanations flag 7 questions as "check this answer key". Speaking phrase lists and delivery tips repeat by task type rather than being unique per prompt. Treat the material as practice, not as authority.

## Glossary
- **Router**: code that shows a different screen depending on the text after the `#` in the address.
- **localStorage**: a small box of text the browser keeps for this site.
- **JSON**: a plain text way to write lists and records, used for saving and for the data files.
- **IIFE**: a function that runs as soon as it is defined; used to keep names private.
- **Leitner box**: a numbered level that says how well you know a card.
- **CLB**: Canadian Language Benchmark, the 1 to 12 level scale CELPIP reports.
- **Contrast ratio**: a number from 1 to 21 for how readable text is on its background; 4.5 or more is the guideline for normal text.
- **SVG**: a text format for drawings.
- **Validator**: a program that checks data for mistakes.
- **Bento grid**: a dashboard of tiles of different sizes, like a lunch box.
- **Web Audio API**: the browser's toolkit for working with sound inside the page.
- **View Transition**: a browser feature that animates between two versions of the page.
- **Dialog (`<dialog>`)**: the browser's own pop-up box; it traps the Tab key inside and closes on Esc.
- **Token**: a named value such as `--accent` that the CSS reuses.
- **aria-live**: marks a part of the page whose changes a screen reader reads out.
- **Range**: the browser's description of a selection (where it starts and ends).
- **Toast**: a small message that appears for a moment and fades away.
- **textContent**: puts text on the page as plain letters, so typed HTML cannot run.
- **Boundary event**: the browser voice announcing that it is about to say the next word.

## Theme icons and the folding sidebar (T-029 follow-up)
- The theme switch is three icon buttons (sun = Light, moon = Dark, half circle = Auto). Each has an `aria-label` and a `title`, so screen readers and hover tooltips still say the words. The word "Theme" is visually hidden in the sidebar and the More sheet, and visible in Settings.
- On wide screens the hamburger button folds the sidebar. `<html data-sidebar="open|folded">` drives the CSS, `localStorage` key `celpip_sidebar` remembers it, and the folded sidebar gets `inert` so Tab skips it. The slim top bar then shows the logo, so it is always visible.
- Glossary: **inert** = an HTML attribute that makes an element unreachable by keyboard and screen readers; **radiogroup** = a set of options where exactly one is chosen.
