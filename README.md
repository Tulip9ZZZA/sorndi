# SORNDI

> **A teacher-owned classroom record that keeps planning, attendance, evidence, and assessment connected.**

SORNDI is an English-first teacher workspace with Thai navigation support. Version One helps a teacher create a classroom, maintain a roster, plan lessons, open teaching sessions, record attendance, capture evidence, score assessments, and export a portable classroom record from one connected desk.

This repository contains the SORNDI web application: a React interface backed by an Express and tRPC server, Manus OAuth, Drizzle ORM, and a MySQL-compatible database.

## What Version One does

| Teaching need | Version One capability |
| --- | --- |
| Set up a class | Create teacher-owned classrooms with subject, level, room, and visual ledger-tab details. |
| Maintain a roster | Add active students with teacher-supplied names, student numbers, and optional notes. |
| Plan instruction | Draft and mark lessons ready, then connect them to teaching sessions. |
| Record attendance | Save multiple attendance statuses and notes for a selected session, then review the correction trail with actor and timestamp. |
| Capture evidence | Keep session-level teaching notes and follow-up actions alongside the relevant class record. |
| Assess learning | Create weighted assessments, enter recorded/missing/excused scores, inspect transparent totals, and see each student’s weighted total in the scorebook. |
| Take records with you | Export the active classroom’s attendance and first assessment as CSV. |
| Work bilingually | Use English as the primary product language and switch the navigation and key interface copy to Thai. |

The server protects Version One classroom reads and writes through authenticated, teacher-owned routes. Classroom detail data combines the roster, lessons, teaching sessions, attendance history, evidence, assessments, and calculated totals in one application contract. See the [teacher workflow router][workflow-router] and [database schema][schema] for the implementation surface.

## Classroom flow

1. **Sign in** through the configured OAuth provider.
2. **Create a classroom** and add the real student roster you are responsible for.
3. **Create a lesson** and open a teaching session for the appropriate school date.
4. **Record attendance** for that session. Subsequent status or note changes create an audit entry.
5. **Add evidence** and a next action while the lesson context is still available.
6. **Create an assessment**, enter scores, review weighted totals, and export the active record when needed.

> **Data note:** SORNDI Version One stores classroom data in its configured application database. Use authentic classroom data only when your deployment, access controls, and local privacy obligations are ready for it.

## Architecture

```mermaid
flowchart LR
  Teacher[Teacher] --> UI[React teacher desk]
  UI -->|tRPC| API[Express application server]
  API -->|Protected procedures| Auth[Manus OAuth session]
  API -->|Drizzle ORM| DB[(MySQL-compatible database)]
  DB --> Records[Classrooms, rosters, lessons, sessions, attendance, evidence, assessments, scores]
```

## Quick start

### Prerequisites

Use **pnpm** (the repository’s declared package manager) and a MySQL-compatible database. The database configuration requires `DATABASE_URL` for Drizzle commands.[config]

```bash
git clone https://github.com/Tulip9ZZZA/sorndi.git
cd sorndi
pnpm install
```

Create a local environment file using values for your own OAuth and database setup. Do not commit it.

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
JWT_SECRET="replace-with-a-secure-local-secret"
VITE_APP_ID="your-oauth-app-id"
OAUTH_SERVER_URL="your-oauth-server-url"
VITE_OAUTH_PORTAL_URL="your-oauth-portal-url"
OWNER_OPEN_ID="your-owner-open-id"
```

Generate and apply database migrations after `DATABASE_URL` is configured:

```bash
pnpm db:push
```

Start the development server:

```bash
pnpm dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server with file watching. |
| `pnpm check` | Run the TypeScript type check. |
| `pnpm test` | Run the Vitest test suite. |
| `pnpm build` | Build the Vite client and bundled application server. |
| `pnpm start` | Run the built server in production mode. |
| `pnpm db:push` | Generate and apply Drizzle migrations; requires `DATABASE_URL`. |
| `pnpm format` | Format the repository with Prettier. |

## Data model and record behavior

| Record | Relationship | Version One behavior |
| --- | --- | --- |
| Classroom | Owned by one authenticated teacher | Holds the roster, lessons, sessions, assessments, and appearance details. |
| Teaching session | Belongs to one classroom and can reference one lesson | Anchors attendance, evidence, reflection, and session status. |
| Attendance record | One student per session | Supports present, late, excused, absent, sick, remote, and other practical statuses. |
| Attendance correction | Belongs to an attendance record | Stores previous/next status and note, the actor, and the change time. |
| Assessment and score | An assessment belongs to a classroom; scores belong to students | Keeps recorded, missing, and excused work distinct so missing or excused work is not silently treated as zero. |

Timestamps are handled as UTC application timestamps, while teaching dates are stored as ISO school-calendar dates in the product schema.[schema]

## Project map

```text
client/
  src/pages/          Teacher workspace routes and user interface
  src/components/     Shared interface components
server/
  sorndiRouter.ts     Protected teacher workflow procedures
  gradebook.ts        Weighted-score calculations
  db.ts               Database access helpers
drizzle/
  schema.ts           Classroom record schema
  migrations/         Generated database migrations
```

## Testing and quality checks

The repository includes Vitest coverage for authentication logout behavior and weighted-score calculations. Run the full local verification sequence before opening a pull request:

```bash
pnpm check
pnpm test
pnpm build
git diff --check
```

## Contributing

Keep changes focused, run the verification sequence above, and describe the classroom workflow affected by your change. Do not add student data, access tokens, connection strings, or other private classroom information to commits, fixtures, screenshots, or issue reports.

## License

The package metadata declares the project as **MIT**. A root `LICENSE` file has not yet been added; add the final license text before distributing or accepting external contributions under those terms.

## Project resources

The Field Ledger interface direction is documented in [DESIGN.md][design], and the original product brief is available in [ideas.md][ideas].

[workflow-router]: ./server/sorndiRouter.ts
[schema]: ./drizzle/schema.ts
[config]: ./drizzle.config.ts
[design]: ./DESIGN.md
[ideas]: ./ideas.md
