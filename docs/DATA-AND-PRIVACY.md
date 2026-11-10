# Data and Privacy

SornDi handles information about children. These rules are the product, not a policy page.

## Where data lives

- Everything is one JSON document in your browser's `localStorage`, key `sorndi.v2`.
- The app makes **zero network requests**: no analytics, no fonts, no CDNs, no error reporting. Verify with any network inspector.
- A backup (`Exports → Full backup`) is the same document as a file. Restoring replaces current data. Treat the JSON as the canonical export for migration between devices.

## What we collect

Nothing. No account, no email, no telemetry, no crash reports.

## What we never build

- Student accounts or public student profiles.
- Health or BMI tracking.
- Behavioural surveillance, emotion inference, or "ability" scoring.
- Public pages that display student names, attendance, scores, or work.
- Automated high-stakes grading. Scores are teacher-entered; totals are arithmetic.

## Built-in minimisation

- Students are local records with a number, a name, and optional notes — nothing else is required.
- The quiz runner records **aggregate tallies per question**, not per-student answer histories, unless the teacher explicitly uses shared-device team mode, which stores team names derived from the roster on the same device.
- Archives over deletes: deactivating a student keeps the record coherent for past sessions while hiding them from new ones.

## Practical guidance for teachers

1. **Shared computers:** use a browser profile only you open, and lock the screen between classes. Anything in a browser profile is readable by other users of that profile.
2. **Backups:** the JSON file contains your whole classroom record. Store it where student records are allowed to live in your jurisdiction — not in a personal cloud drive by default.
3. **Before a school pilot:** check your local rules on storing student data (in Thailand, PDPA applies; elsewhere, FERPA/GDPR equivalents). SornDi's local-first model is designed to make compliance easier — the data never leaves the device — but the deployment choice is yours.
4. **Erasing:** `Exports → Erase all data` removes the storage key. Deleting the browser profile removes everything else.

## If you extend SornDi

Any fork that adds a server, sync, or analytics inherits full responsibility for child-data protection, consent, and jurisdiction-specific obligations. The SornDi name and repo should not be attached to a deployment that displays student data publicly.
