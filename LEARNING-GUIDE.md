# Learning guide: CELPIP Study Hub (version 2)

Written for someone new to programming. Every code file starts with a LEARNING NOTE. Version 2 was built on 2026-10-22 from version 1 (the folder `Celpip Test`, left untouched). Agent: Ufok.

## What it is
A study website for the CELPIP English test. Open `index.html` in a browser: it runs completely on your computer, with no server, no install, no account, no outside library and no network call. It has lessons, practice by skill and by part, a timed section, a full timed exam, answer explanations, model answers, spaced review of your mistakes, word cards, grammar drills, a study plan, a study log with notes, and a light and a dark theme. Practice scores are rough estimates for study, not predictions of an official score.

## Open it
Double-click `index.html`. If your browser blocks something when opened as a file, run `python -m http.server 8000` in this folder and visit `http://127.0.0.1:8000`.

## How it works, end to end
1. `index.html` is the only page. It has a header, a footer and an empty area called `app`. Before anything draws, a tiny script sets the light or dark theme.
2. The scripts at the bottom load in a fixed order: data files, then `storage.js`, `scoring.js`, `app.js`, and last `study.js`. Order matters because each file uses names defined by the ones before it.
3. `app.js` is the engine: timers, speech, the microphone, the router, the multiple-choice practice, the writing and speaking runners, and the full exam.
4. `study.js` registers the screens (dashboard, learn, review, words, grammar, notes, plan, history, settings) and adds the study tools. At the very end it calls `render()`, which draws the screen for the current address.
5. The address after the `#` picks the screen (for example `#/review`). This is a "router". Click a link, the address changes, `render()` swaps the screen.
6. When you check a reading or listening passage, `app.js` calls `Study.recordMcq`, which saves each wrong answer in a review queue and updates your per-part accuracy. `Study.explanationHtml` shows the explanation under each question.
7. Everything you do is saved by `storage.js` in the browser's `localStorage`. Nothing leaves your computer.

## The files
| File | Job |
|---|---|
| `index.html` | The single page and the script load order |
| `css/style.css` | How everything looks; colours are named variables at the top, with a light and a dark set |
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

- **One helper per job, used everywhere.** Every countdown shows its time through `paintTimer`, which also marks low time (an orange pill) and the last seconds (red) and tells screen readers once. Every question form counts its answers through `watchAnswered`. Fixing or restyling one place fixes them all.
- **Sound as numbers.** The Speaking microphone bars (`MicMeter`) use the Web Audio API: an analyser hands over the sound wave as numbers, and how far they swing from silence is the loudness. Nothing leaves the device.
- **Highlighting is cutting text into pieces.** The Reading highlighter (`markRange`) walks each piece of text in the passage, splits out the selected part and wraps it in `<mark>`. In the exam the marked passage is kept per tab, so switching tabs keeps your marks.
- **Opt-in for anything that leaves the device.** Speech-to-text sends audio to an online service in Chrome and Edge, so it runs only when "Speaking transcripts" is switched on in Settings (off by default).

## What changed from version 1
- Removed the optional AI grading. It sent your text to a cloud service with a key kept in plain text in the browser. Version 2 also deletes any key an older version saved. Writing and speaking now use only the local scoring and a self-rating.
- Removed the Chart.js dependency (it was loaded from the internet).
- Replaced the blue theme and emoji icons with a light and dark theme and small drawn icons. The palette (paper, ink, rust, deep green) is a proposal, not an approved style.
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
- **aria-live**: marks a part of the page whose changes a screen reader reads out.
- **Range**: the browser's description of a selection (where it starts and ends).
