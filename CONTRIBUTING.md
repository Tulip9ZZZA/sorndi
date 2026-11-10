# Contributing to SornDi

Thank you for helping make the teacher's day simpler. SornDi is deliberately small and dependency-free, so contributions stay reviewable.

## The ground rules

1. **No student data, ever.** Never commit, screenshot, or paste real student names, scores, health notes, or school identifiers. Test with the built-in demo class or clearly fictional names.
2. **No new dependencies in the app.** `index.html` must stay a single self-contained file with vanilla JS and CSS. If a feature seems to need a framework, the feature probably needs rethinking.
3. **Keep the design system.** Colours, spacing, type and voice are defined in [docs/BRAND.md](docs/BRAND.md). If your change introduces a new colour, it is probably a regression.
4. **Domain logic goes in `lib/sorndi-core.mjs`.** Pure functions there, DOM glue in the app. If you change grading, attendance, or export logic, add or update tests in `tests/run-tests.mjs`.

## Workflow

```bash
npm test                       # node tests/run-tests.mjs
python3 scripts/build.py       # if you changed app source modules (see below)
```

If your change touches the app itself, edit the source modules under `scripts/app_src/` (kept in this repo for maintainability) and rebuild `index.html` with the build script, or edit `index.html` directly and mirror the change in the sources.

## Pull requests

- One focused change per PR, with a sentence on which teaching workflow it improves.
- Behaviour changes need a test or a manual step list that a reviewer can repeat.
- UI changes: attach before/after screenshots.
- Accessibility and Thai/English parity are part of "done": new UI strings need both `en` and `th` entries in the i18n dictionary.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, browser and OS. Attach the JSON backup **only after** replacing all student names and notes with fictional ones.

## Feature ideas

Open a discussion first for anything that adds a new data type (new record kinds, new export formats, integrations). The roadmap in the README is the current agreement; argue with it there.
