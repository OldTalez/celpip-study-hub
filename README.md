# CELPIP Study Hub

An unofficial study tool for the CELPIP test: practice for all four skills, a full timed exam, lessons, word cards, grammar drills and a study plan. It is not affiliated with or endorsed by the organisation that runs the CELPIP test.

**Open it:** https://oldtalez.github.io/celpip-study-hub/

- Runs in the browser with no account. Your history and settings stay in that browser (export a backup from Settings).
- Works offline after the first visit, and can be added to a phone's home screen.
- Speaking transcripts are off by default. If you switch them on in Settings, your browser sends your spoken answer to an online speech service to turn it into text.
- The practice material was written for this app by AI assistants and has not been reviewed by a person. Treat it as practice, not as authority.

## For developers
Plain HTML, CSS and JavaScript, with no build step. `LEARNING-GUIDE.md` explains how it fits together.

- `node tools/check-contrast.js` checks colour contrast in both themes.
- `node tools/validate-data.js` checks the practice data.
- `tools/e2e-test.cjs` drives every screen in a headless browser (see the note at its top).

The working copy lives in the MacKenzie Enterprise vault (`Celpip Test v2/`); this repository is the published copy.
