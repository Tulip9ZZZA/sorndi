# Changelog

All notable changes to SornDi are documented here. Format based on Keep a Changelog; versioning is SemVer.

## [2.0.0] - 2026-11-10

The complete rebuild. SornDi v2 is a local-first, single-file teacher OS with no accounts and no server — replacing the v1 web app that required OAuth and a MySQL database.

### Added
- Single-file app (`index.html`): no install, no build step for users, no runtime dependencies.
- Today view: sessions due, attendance pending, missing reflections, upcoming timetable slots.
- Classrooms with subject, grade, room, term and weekly timetable.
- Roster with numbered students, notes, archive, and one-per-line paste import.
- Lessons: objective plus editable stages generated from five evidence-informed templates (retrieval, worked example, discussion, task, spaced review), with over-time and no-objective warnings.
- Teaching sessions linked to lessons, with reflection and next action.
- Attendance: eight statuses plus *not recorded*, mark-all-present, notes, live counts, keyboard entry (P/L/A/S/E/R), and correction history with actor and timestamp.
- Scorebook: weighted assessments, missing/excused kept distinct from zero, per-student weighted totals, and a show-the-calculation panel.
- Configurable daily record templates with an explicit, overridable absence rule.
- Quiz studio and runner: projector/tally mode and shared-device team mode, timer, explanations, aggregate results saved to the session.
- Tools: random student picker (no repeats until the roster is exhausted), team maker, class timer.
- Exports: attendance CSV, scorebook CSV, daily log Markdown, printable class report, quiz results CSV, full JSON backup and restore, verified erase.
- English/ไทย interface with Thai Buddhist-calendar dates; light/dark/system themes; mobile layout.
- Domain library `lib/sorndi-core.mjs` shared by the app and the test suite; `npm test` runs it on Node 18+.

### Changed
- Brand rebuilt: Ledger-S mark, custom monoline wordmark, warm paper palette with Ledger Green accent, documented in docs/BRAND.md.
- README and documentation rebuilt with dated competitive evidence (docs/COMPETITIVE-ANALYSIS.md).

### Removed
- Manus OAuth, server, tRPC, MySQL, and all cloud dependencies from v1.

[2.0.0]: https://github.com/Tulip9ZZZA/sorndi/releases/tag/v2.0.0
