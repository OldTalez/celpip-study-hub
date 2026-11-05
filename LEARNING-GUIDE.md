# Learning guide: CELPIP Study Hub (version 2)

Written for someone new to programming. Every code file starts with a LEARNING NOTE. Version 2 was built on 2026-10-22 from version 1 (the folder `Celpip Test`, left untouched). Agent: Ufok. The look and frame were rebuilt on 2026-11-05 (T-029 turn A, Agent: Nsikak): see "The frame" below.

## What it is
A study website for the CELPIP English test. Open `index.html` in a browser: it runs completely on your computer, with no server, no install, no account, no outside library and no network call. It has lessons, practice by skill and by part, a timed section, a full timed exam, answer explanations, model answers, spaced review of your mistakes, word cards, grammar drills, a study plan, a study log with notes, and a light and a dark theme. Practice scores are rough estimates for study, not predictions of an official score.

## Open it
Double-click `index.html`. If your browser blocks something when opened as a file, run `python -m http.server 8000` in this folder and visit `http://127.0.0.1:8000`.

## How it works, end to end
1. `index.html` is the only page. It has a left menu (wide screens), a top bar and bottom tab bar (phones), a footer and an empty area called `app`. Before anything draws, a tiny script sets the light or dark theme.
2. The scripts at the bottom load in a fixed order: `data/meta.js` (a small summary of the data) and `loader.js`, then `shell.js`, `storage.js`, `prescription.js`, `calendar.js`, `scoring.js`, `app.js`, and last `study.js`. Order matters because each file uses names defined by the ones before it.
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
| `js/pagewipe.js` | The circle wipe when a menu page is pressed (T-033 B2b), and the Settings switch's storage key `celpip_pagewipe` |
| `js/shell.js` | The frame around every screen: menu highlighting, Light / Dark / Auto theme, the More sheet, focus mode with its Exit question, header behaviour on scroll, and the lesson contents list |
| `fonts/` | The two bundled font families as small Latin-only WOFF2 files, with their licence (`OFL.txt`) |
| `js/loader.js` | Loads the big practice data files only when a screen needs them (T-032). Read its LEARNING NOTE first |
| `js/data/meta.js` | Generated small summary of the data (part names, passage ids, word ids), always loaded |
| `tools/build-meta.js` | Writes `meta.js` from the real data; `--check` compares without writing |
| `js/app.js` | Engine: timers, speech, recording, router, practice runs, timed section, exam |
| `js/study.js` | The study screens and the `Study` helper (explanations, mistakes, model answers) |
| `js/calendar.js` | Builds the `.ics` calendar file from the plan: escaping, line folding, weekly repeats and reminders. Pure text in, text out |
| `js/prescription.js` | The "My plan" engine: pure functions (no page, no storage) that split the week, pick today's tasks, project a range and list milestones |
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

## My plan (added 2026-11-05, T-030 turn 1, `js/prescription.js` and `js/study.js`)

The old Plan page became "My plan" (the address is still `#/plan`). It answers: how much should I study this week, on which days, on what, and what can I reasonably reach?

- **Pure functions.** `js/prescription.js` takes plain data in (settings, latest level per skill, study-time log, today's date) and gives plain data out. It never touches the page or storage, so the test can call it with fixed inputs. `js/study.js` does the drawing.
- **Where every number comes from.** The constants at the top of `prescription.js` each name their source: the evidence note `Knowledge/Research/2026-11-05 celpip-study-prescription-evidence.md`, the official score chart (celpip.ca, supplied by the Board), or "guide" (a number chosen for this app). Most are low confidence, and the page says so.
- **Ranges, never promises.** The projection shows a range from 50 to 150 hours per level step (about 70 in the middle), labelled "Planning estimate, not official". If scores or the test date are missing, it says what is missing and does not guess.
- **Split of the week.** Each skill's weight is its gap to your target plus 0.5; the weakest skill gets the most, and nobody falls below 10%.
- **Study time.** The app counts time by itself every 5 seconds while the tab is showing, you touched the page in the last 2 minutes, and you are on a practice, exam, review, words, grammar or learn screen. You can also add time by hand (with an optional note that is shown as plain text). It is saved under `studyTime`.
- **Your days.** Settings holds the days and time of day you chose. The weekly rhythm is laid on those days.

Words to know: *retrieval* (answering questions from memory, which research rates highly) and *spacing* (reviewing at growing gaps).

## My plan, part 2 (added 2026-11-05, T-030 turn 2)

- **Projection fix.** Hours come from the largest single-skill gap, not the sum over four skills. The hours-per-level figure is about overall proficiency, so adding four gaps counted the same hours four times. Study time is shared across skills (`skillShares`); it is not added up.
- **On track.** `Prescription.onTrack` compares minutes done with the minutes of sessions planned BEFORE today (today is still open). 80% or more is on track, 50% to 80% a little behind, under 50% behind. These thresholds are "guide" numbers, named at the top of the file.
- **Check-in.** `Prescription.checkIn` counts planned days since the learner last studied. One means "your streak is safe"; two or more means the streak count restarts and a catch-up of at most +25% a day over at most 3 sessions is offered. The banner can be dismissed for today (one date in `localStorage`, key `celpip_checkin_v1`). Wording never blames.
- **Calendar file.** `js/calendar.js` writes iCalendar (RFC 5545) text. Floating times have no time zone; text values are escaped so typed text can never add a line; lines are folded at 75 bytes; each event has a reminder 10 minutes before. The file is made in the browser and only downloaded: nothing is sent.
- **Home.** The first screen is now called Home (one constant, `HOME_LABEL`; the route is still `#/dashboard`). Its "My plan" card is a heading link stretched over the whole card (`.card-link::after`), so one click opens the plan without putting buttons inside a link.
- **Glossary additions:** *floating time* (a clock time with no zone), *RRULE* (the repeat rule in a calendar event), *VALARM* (a reminder inside an event), *line folding* (cutting long lines so none passes 75 bytes).

## Installing the app (added 2026-11-05, T-031 turn A, `js/appfeel.js`)
A website becomes an installable app when the browser finds three things: a manifest (`manifest.webmanifest`: name, colours, icons, start page), a service worker (`sw.js`, which keeps the files for offline use) and a secure address (https, or localhost while testing). This app has all three. Chrome can be asked "why is this not installable?" and `tools/e2e-test.cjs` asks it on every run.
- **Icons** are drawn by `tools/make-icons.py` (a speech bubble with a C, white on the Lakeline teal) and `favicon.svg` uses the same shapes. A *maskable* icon fills the whole square with teal and keeps the drawing inside the middle 80%, because phones cut it to a circle or squircle. Run the script again to rebuild every size.
- **Install button** (`AppFeel.fillInstall`): Chrome, Edge and Android announce `beforeinstallprompt`; the app keeps that event and shows "Install app" in Settings and the More sheet. Only a tap calls `prompt()`, so nothing pops up uninvited. iPhone and iPad Safari have no such event, so the same place shows the two steps (Share, then Add to Home Screen). When the app already runs full screen (`display-mode: standalone`, or `navigator.standalone` on iPhone) the box is hidden.
- **Update notice**: when a new `sw.js` takes over, the browser fires `controllerchange`. The page shows "New version ready" with a Refresh button and never reloads by itself; during practice or the exam it waits. To publish a new version: change `CACHE` in `sw.js` (for example `celpip-v8`) and add any new file to `FILES`.
- **Offline pill**: `navigator.onLine` plus the `online` and `offline` events show a small "Offline" pill (icon and word).
- **Keeping data safe**: after the first saved attempt the app asks the browser once (`navigator.storage.persist()`) not to clear its stored data when space runs low. Settings shows the answer. A monthly "Export a backup" card on Home is the safety net. Reset clears these two small notes too.
- **Icon badge**: `navigator.setAppBadge(n)` shows how many mistakes are due on the installed app's icon, where the browser supports it.
- **iPhone fit**: `viewport-fit=cover` lets the page fill the screen; `env(safe-area-inset-top)` and `-bottom` keep the bars off the notch and home bar; `overscroll-behavior-y: contain` stops a pull-down from reloading the page.
New words: *manifest*, *service worker*, *maskable icon*, *safe area*, *feature detection* (check a browser feature exists before using it).

## Profiles and moving to another device (added 2026-11-05, T-031 turn B)
Read in this order: `js/profiles.js` (who is studying), `js/storage.js` (how the notes are labelled and cleaned), `js/profile-ui.js` (the buttons and pop-ups), `js/transfer.js` (share a file, QR codes), `js/shortcuts.js` (keys and the tap buzz).
- **One device, several learners.** Every per-learner note in `localStorage` now has the learner's id in its label, for example `celpip_p_k3x9a2bq_history_v1`. `Profiles.key("celpip_history_v1")` builds the label for the active learner, and `Storage` asks it at the moment of every read and write, so no screen needed to change. The theme (`celpip_theme`) and the sidebar fold (`celpip_sidebar`) stay device-wide. The list of profiles sits under `celpip_profiles_v1`.
- **Migration.** The first time this version runs, the old un-labelled notes are moved into a first profile named from the saved first name (or "Me"). The profile list is written first and the move is checked note by note, so stopping half-way is finished on the next load, and running it twice changes nothing.
- **Switching** calls `render()`, which already stops timers, the camera, the microphone and speech and clears the old screen. Switching is refused during a practice run or the exam.
- **Names** are typed by a person: `Profiles.cleanName` removes control characters and cuts to 40 characters, and the screens use `textContent`, never HTML.
- **Backup, import and reset** act on the active profile only. Reset says so and names the profile.
- **Share backup file.** `navigator.canShare({ files })` asks "can this browser share a file?". If yes the share sheet opens; if not the file is downloaded. The app itself sends nothing.
- **QR transfer.** Backup JSON, squeezed with gzip, written as base64url, cut into pieces of about 1000 characters, each with a header `CSH1|id|3/31|fingerprint|data`. The receiver accepts pieces in any order, shows "12 of 31 received", checks the fingerprint (SHA-256, first 16 hex characters), un-squeezes (stopping at 2 MB), and sends the result through `Storage.cleanBundle`, the same cleaner as a backup file. Then the learner picks "Add as new profile" or "Replace this profile".
- **Libraries** (loaded only when a QR screen opens): `js/vendor/qrcode.js` draws codes; `js/vendor/jsQR.js` reads them where the browser has no `BarcodeDetector`. See `js/vendor/VENDOR.md`.
- **Keyboard and buzz.** Shortcuts "click" the same buttons a mouse would; they are ignored while typing. `navigator.vibrate(10)` is skipped under reduced motion or when the learner switches it off.
- Glossary: **profile** = one learner's set of notes; **base64url** = letters, digits, `-` and `_` only, safe to put in a QR code; **gzip** = a way to squeeze text; **fingerprint (hash)** = a short summary that changes if any letter changes; **Web Share API** = the browser's way to open the phone's share sheet.

## What changed from version 1
- Removed the optional AI grading. It sent your text to a cloud service with a key kept in plain text in the browser. Version 2 also deletes any key an older version saved. Writing and speaking now use only the local scoring and a self-rating.
- Removed the Chart.js dependency (it was loaded from the internet).
- Replaced the blue theme and emoji icons with a light and dark theme and small drawn icons. The look is now the Board-approved "A Lakeline" (teal on cool greys); the earlier orange palette is gone.
- Added: diagnostic, weak-spot view, review queue, timed section, explanations for all 956 questions, model answers for all 34 writing prompts and 72 speaking prompts, 285 vocabulary cards, 24 grammar topics with 144 drill questions, 20 part lessons, 12 study tips, a study log with export, and a backup export and import.
- Your old saved history and settings still work (same storage names).

## Material quality, plainly
All new material was written by AI assistants on 2026-10-22, in the style of the test, and has not been reviewed by a person. Answer explanations flag 7 questions as "check this answer key". Speaking phrase lists and delivery tips repeat by task type rather than being unique per prompt. Treat the material as practice, not as authority.

## Glossary

- **Pure function:** a function that only turns inputs into an output and changes nothing else (see `js/prescription.js`).
- **Tick:** one 5-second check of whether you are studying, used to count study time.- **Router**: code that shows a different screen depending on the text after the `#` in the address.
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

## Practice drafts, Reading pace per part, and the device checklist (T-031 turn C)
- `js/drafts.js` keeps an unfinished Reading, Listening or Writing practice as a **draft** (answers, flags, writing text, time used; never notes). The practice screen shows "Resume where you left off?" with Resume and Start fresh. One draft per practice type per profile; it is cleaned every time it is read, removed by Reset, left out of the backup file and the QR transfer, and cleared when you finish. The Timed Exam and Speaking keep no draft.
- Reading pace: `PACE_GUIDE` in `js/study.js` is one table. The official 43 to 56 minutes is shared out by each part's question count in the app's own passages (11, 8, 9, 10). The counts are not official, so the tile says so. Because the split follows question count, every part has the same seconds per question (68 to 88); the parts differ in how many minutes the whole part is worth.
- Writes that can fail (full device): `Storage.writeSafely` copies what is there first and puts it back if a write fails.
- `DEVICE-CHECKLIST.md`: what to try on a real iPhone, Android phone and computer, with boxes to tick. Glossary: **draft** = a saved, unfinished attempt; **snapshot** = a copy taken before a risky change so it can be restored.
- Checklist: [[Celpip Test v2/DEVICE-CHECKLIST]]
- Turn C follow-up: the Settings card no longer repeats the theme switch (one hint line instead); it lives in the menu, the folded top bar, the phone top-bar button and the More sheet.

## Loading data on demand (added 2026-11-05, T-032, `js/loader.js`, `js/data/meta.js`)
- **Why.** The practice data (passages, explanations, model answers, words, grammar, lessons) is about 1.0 MB of script files (1,009,881 bytes; about 296 KB compressed). Loading all of it before Home drew made the first visit heavy, so `index.html` no longer lists those files.
- **`Loader.needData(["reading", "explanations"])`** returns a Promise. It adds a `<script>` tag for each file not loaded yet, runs "pools before gatherers" (a gatherer such as `reading.js` joins the pool lists when it runs), never loads a file twice, and rejects with a plain message if a file cannot be fetched. The failed file is forgotten so Retry tries again. The table of bundles is in the LEARNING NOTE at the top of `loader.js`.
- **Routes say what they need.** `route("vocab", handler, { needs: ["vocab"], label: "Loading word cards" })`. `render()` in `app.js` asks the Loader first. If everything is already here it draws in the same moment as before. If not, the old screen is cleared at once (so it can never be seen), `#app` gets `aria-busy="true"`, and only after 150 ms a "Loading practice..." card with a spinner appears. When the files arrive, `onScreen(id)` is checked: if you went elsewhere meanwhile, nothing is drawn. On failure a heading, a message and a Retry button appear.
- **Buttons on a screen already showing** (the Home mastery cells, the diagnostic Start buttons) use `withData(needs, fn)`: run now if loaded, else load, then run unless you moved on; a failure is an error toast, and pressing again retries.
- **`meta.js`** holds what Home, Learn and My plan need without the pools: each skill's overview (part names, tips), every passage id with its part number and question count, and every word id. `SKILLS[i].overview` comes from it; `SKILLS[i].data` is a getter that throws a clear error if the data is not loaded yet. It is generated: after changing data run `node tools/build-meta.js`; `--check` and an e2e step both compare it with the real data.
- **Offline is unchanged.** `sw.js` still saves every data file on install (cache `celpip-v10`) and answers script requests from the saved copy, so every route works offline after the first visit. The first visit still downloads everything once, in the background, through the service worker; what changed is what the page itself waits for.
- **Safety.** Script addresses come only from the fixed table in `loader.js`; a name that is not in it is refused. The part after `#` is never used as a script address.
- **Explanations load when you check answers (follow-up, same day).** Practice start loads only the passages. When you press Check Answers, `showReview` in `app.js` draws the review at once with an empty slot under each question and a "Loading explanations..." line; `fillExplanations` then fetches `explanations.js` and fills the slots. If you pressed Next Passage first, the slots are gone and nothing is drawn. On failure the line says so with a Retry button and your score stays. The full exam never shows explanations, so it does not load them; Review loads them itself.
- **Compression.** GitHub Pages sends these files gzipped (for example `reading_pool_1.js` arrives as 29,247 bytes), so live downloads are about 30% of the sizes the local test server shows (it sends them plain).

## Island navigation (T-033 turn A, 2026-11-05, `css/style.css`, `js/shell.js`, `index.html`)
Design: `Company/Work/2026-11-05 T-033 island-nav/design-spec.md`. Turn B1a (below) built the collapse behaviour, the phone drawer and the four-item bar. Still to come: the profile panel (B1b), the Arrange menu and the page wipe (B2).
- **Themes.** Light page and cards are `#FFFFFF`; dark page is `#000000` and cards `#0E0E0E` (black pixels are off on an OLED screen). Cards get a hairline and, in light, a soft `--card-shadow`. `tools/check-contrast.js` checks every pair.
- **One theme-color tag.** `<meta name="theme-color" id="metaTheme">` has no `media` attribute, so it follows the app's own Light/Dark/Auto choice, not the phone's. `Shell.paintTheme` copies `--bg` into it on every change (and Auto's device listener calls the same function); the head script sets it before the first frame. The iPhone status bar style is `black-translucent` (Board D1): the page colour shows behind the clock, but iOS always draws the clock white, so it is hard to read on the white page. The manifest colours are both `#FFFFFF` (D7).
- **Rail and island.** 1000px and up: the rail (72px, icons, names as a tooltip on hover and keyboard focus; Esc hides it) or the island (264px, with round arrow chips). At 1200px and up the island is pinned unless folded with the X (`celpip_sidebar` = `folded` now means rail); from 1000 to 1199px the rail's Expand button opens the island as a modal overlay (dimmed page, `inert` page behind, Tab kept inside, Esc closes). `<html data-nav="pinned|rail">` and `data-overlay="open"` drive the CSS. The rail is built by `buildRail()` from the island's own page list, so the two cannot drift. The theme switch left the island: the top-bar button cycles Light, Dark, Auto.
- **The slit.** The page title (first `h1`, class `.screen-title`) is the sticky box and reaches up behind the top bar with its own padding, so the bar and title overlap instead of touching; no typed-in `top: 56px` and no seam. This differs from the spec's literal `.stack` wrapper because the heading lives inside `#app`, which the screens rebuild.
- **Collapsing bar (B1a, from the Board-approved Variant A demo).** `onScroll` in `shell.js` keeps `y` and `run` (distance in the current direction). The numbers are in `Shell.SETTINGS`: collapse when `y > 96` and the downward `run > 24`; come back only after an upward run of `expandRunUpScreens` (0.6) of the window height, or at `y <= 24`; the greeting (`.screen-title`) shows only when `y <= titleMaxY` (160). Collapsing never changes the layout (the bar and greeting only fade, they are never `display:none`, because that would change the page height and fire a second scroll event). `<html>` carries `data-collapsed`, `data-scrolled` and `data-title`; the CSS reads them. Hairlines: one under the greeting near the top, one under the bar row mid-page, none while collapsed; each fades out in 90ms before the other fades in. Only the bar row has a background mid-page (`--bar-row-bg` on `.topbar`).
- **Wide screens, scrolled down.** The pinned island or the rail fades (opacity only) and keeps its space. Its logo mark stays: `placeAnchor()` measures the logo and puts the fixed `#anchor` button over it; the anchor turns from the logo into a hamburger and opens the island as an overlay that slides in from the left (scrim, X, Esc, Tab kept inside, focus returns to the anchor). The theme button stays at the window's top right and gets a ring. The column (`main#app`) is centred in the window: `--col` is `min(1200px, 100% - 2 x --off)`; it does not move when the island fades. Folding or pinning the island adds the class `glide` to `<html>` for a moment so the width animates; scrolling never does.
- **Phone (under 1000px).** The bar (menu button, wordmark, theme) melts into a centred pill (`#mini`: menu, Home mark, theme): the bar's controls slide towards it while it grows. The floating bottom bar has four items (Home, Practice, My plan, Exam; `SETTINGS.barSections`). The menu button opens the same `#sidebar` element as a side drawer from the left; it lists only the pages not in the bar (`data-in-bar` links are hidden by CSS). The old More sheet is gone: the install button and profile button live in the drawer, the theme button cycles Light, Dark, Auto.
- **Repeated ideas.** `paintNav()` in `shell.js` is the one place that decides what shows and what is `inert`; other functions only change state and call it. Animations use only `transform`, `opacity` and the separate `scale` property so they stay smooth.
- **Logo.** Every logo is a link to `#/dashboard`. In practice or the exam it opens the same Leave question as Exit (`Shell.focusMode.ask({ to, returnTo })`). The task bar shows the logo mark, Exit (icon only at 360px and narrower) and a two-part title ("Timed Exam" over "Reading").
- Glossary: **anchor** = the fixed button over the logo spot that becomes a hamburger; **drawer** = the island seen from the left edge on a phone; **overlay** = a menu drawn over the page on a dimmed background; **hysteresis** = two different trigger points so a small wobble cannot flip a state back and forth; **sticky** = stays at an edge while the page scrolls under it.

## The circle wipe (T-033 B2b, `js/pagewipe.js`)

- **What happens.** Press a page in the menu (side menu, rail, open menu panel, phone drawer) and a teal disc grows from the spot you pressed (240ms), the page changes underneath, and the disc shrinks to the middle (280ms). Colour: `--wipe` in `css/style.css` (light #0B6477, dark #0B3A45); it is decorative and has no text.
- **It builds on the existing page-change code.** `js/app.js` (`goToRoute`) already wraps route changes in the browser's View Transitions fade. The wipe holds the click back, grows the disc, then sets `location.hash`; while it runs, `PageWipe.running()` makes `goToRoute` draw the page plainly, so the two animations never overlap. Check with `typeof PageWipe`, never `window.PageWipe`, because the file may not have loaded yet.
- **Where it does not play.** The phone bottom bar (quick fade only), practice and the exam (focus mode), reduced motion, and when "Page transition" is off in Settings.
- **The switch.** `celpip_pagewipe` in `localStorage`, device-wide. Only the exact word `off` turns it off (an allow-list); any other value means on.
- **The "Transition was skipped" error.** When one view transition starts while another runs, the browser skips the first and rejects its `ready` promise. Nobody was listening, so it surfaced as an uncaught error. `goToRoute` and the theme change now end with `.ready.catch(() => {})`.
- **New words.** *clip-path*: the visible area of an element. *Web Animations API*: `element.animate()`, used to move the disc. *Capture phase*: a click listener that runs before the page's other listeners.
