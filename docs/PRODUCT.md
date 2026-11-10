# SornDi Product Notes

**Product promise:** everything a teacher needs to plan, teach, record, and export — without locking the essential classroom workflow behind an account.

**Name:** SornDi, from the Thai สอนดี, "teach well". **Tagline:** Plan less. Teach better. Share what works.

## The one-paragraph thesis

A teacher's day is one connected sequence — prepare, teach, record, review — but the software market sells it as disconnected pieces: a planner here, an attendance sheet there, a quiz game somewhere else, and a gradebook that only half-agrees with any of them. SornDi keeps one connected record per teaching session and gives the teacher the file. Version 2 proves the loop: class → roster → lesson → session → attendance → quiz → reflection → export, entirely offline, entirely local.

## Non-negotiable product rules

1. **One connected session record.** Attendance, quiz results, evidence and reflection reference the same session object. Exports read that object.
2. **Untouched is not absent.** An attendance row never marked stays *not recorded* and is never silently averaged into anything.
3. **Missing and excused are not zero.** Weighted totals exclude them and say so.
4. **The math is on the page.** Every total can show its formula and included entries.
5. **Teachers approve.** Templates produce drafts; nothing becomes "ready" without a teacher saying so.
6. **Games are evidence, not verdicts.** Quiz results attach to the session for teacher review; no public child rankings.
7. **Local-first means it.** The core loop runs with no server, no account, and no internet. Sync features are additive adapters, never a dependency.

## Domain model (v2)

```text
Teacher settings
  └── Classroom (subject, grade, room, term, timetable slots)
        ├── Students (numbered, active/archived)
        ├── Lessons (objective, template, stages[], status draft→ready→taught)
        ├── TeachingSessions (date, time, lesson link, reflection, next action)
        │     ├── AttendanceRecords (status, note, correction history[])
        │     ├── DailyRecordEntries (template fields, absence default)
        │     └── QuizRuns (mode, per-question tallies, team scores)
        ├── Assessments (max, weight, category, objective link)
        │     └── Scores (number | missing | excused)
        └── RecordTemplates (teacher-defined fields)
```

Storage: a single JSON document in `localStorage` under `sorndi.v2`; a backup is that document, human-readable, versioned.

## The five lesson templates

| Template | Stages (minutes) | Evidence-informed basis |
| --- | --- | --- |
| Retrieval + new content | 8 / 5 / 12 / 12 / 10 / 3 | Retrieval practice, cumulative review |
| Worked example | 10 / 15 / 15 / 5 | Worked examples → guided → independent practice |
| Discussion & comparison | 5 / 10 / 15 / 10 | Prediction, discussion, error analysis |
| Task / project | 10 / 25 / 10 / 5 | Task-based learning with share & feedback |
| Spaced review | 10 / 15 / 15 / 5 | Spaced practice, reteach from results |

Validation warns (never blocks) when a plan has no objective, no stages, or stages exceeding the shortest timetable slot. Teachers can override with one click — the warning exists to be seen, not obeyed.

## Quiz runner modes

| Mode | Devices | How answers are captured |
| --- | --- | --- |
| Projector / tally | 0 student devices | Teacher shows the question, students respond by hand or mini-whiteboard, teacher taps A–D per response |
| Shared device | 1 | Teams pass one device or tablet and answer in turns; scores accumulate per team |

Both modes run offline on the teacher's device. Results are saved as aggregate tallies per question — never as public student leaderboards.

## Explicit non-goals (v2)

No school ERP, no parent messaging, no payments or marketplace, no AI generation as a headline, no student accounts, no health data, no behavioural scoring, no cloud sync promise until local-network play ships and works.

## Sustainability

Free core, forever, MIT-licensed. If SornDi ever costs money, it will be paid hosting, training, or creator content — never attendance, scores, exports, or the ability to teach.
