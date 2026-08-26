# SORNDI

SORNDI is an English-first, Thai-menu-ready **local-first teacher operating system**. This MVP turns a teacher’s daily classroom flow into one connected workspace: the next lesson, attendance, formative observation scores, evidence, and a portable CSV record.

## What this MVP includes

| Area | Available now |
| --- | --- |
| Today desk | A live current-class context, next action, and connected teaching evidence thread. |
| Attendance | Present, late, excused, absent, sick, and not-recorded states; bulk present action; browser-local save. |
| Scorebook | One formative observation assessment with editable scores and visible calculation policy. |
| Thai navigation | An in-app `EN / ไทย` control changes primary navigation and key command labels without removing entered work. |
| Export | Download current attendance and observation values as a CSV file. |
| Search foundations | Descriptive metadata, robots directives, and `SoftwareApplication` JSON-LD without fabricated reviews or ratings. |

## Important MVP boundary

This is a static frontend preview. Classroom data is intentionally stored in the browser only for the preview. It does **not** yet provide login, sync, multi-device backup, team permissions, QR workflows, official PDF generation, or production-grade data protection. Do not rely on this build as the only location for real student records.

## Run locally

```bash
pnpm install
pnpm dev
```

Check the code and create a production build:

```bash
pnpm check
pnpm build
```

## Design system

The original **Field Ledger** visual system is documented in [`DESIGN.md`](./DESIGN.md). Product direction and MVP scope are in [`ideas.md`](./ideas.md). The implementation uses a warm paper canvas, ink navigation, Sorndi Orange for active teaching work, an editorial display face, and a threaded-evidence motif.

## Next build slices

The intended next steps are account-backed encrypted sync, data import/export, class setup, real lesson plans, configurable daily records, scorebook categories and weights, printable reports, QR assistance, and an English/Thai route strategy for content-level localisation.

## License

License choice is intentionally deferred until the project owner chooses the open-source terms for SORNDI.

