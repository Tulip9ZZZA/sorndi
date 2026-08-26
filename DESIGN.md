# SORNDI Design System

## Product context

**Artifact:** Local-first teacher operations dashboard.

**Primary user:** A teacher preparing or recording a live classroom session under time pressure.

**Core outcome:** Complete today’s teaching work while keeping the lesson, attendance, evidence, and scores visibly connected.

**Brand essence:** A grounded, precise, encouraging teaching desk that gives educators direct control of their records.

**Aesthetic commitment:** Field Ledger — contemporary editorial workspace meets class register and carefully indexed curriculum notebook.

**Signature move:** The **evidence thread**: a narrow connector line and indexed nodes that link preparation, attendance, evidence, and follow-up. It must always communicate a real order or relationship, never fill empty space.

## Source influences

The interface selectively transposes productivity-workspace rules from a design-system study: restrained radii, a readable action hierarchy, tinted surfaces used by meaning, and high-density clarity. It does not reproduce any other product’s brand, logo, illustrations, copy, or layout.

## Tokens

### Colour roles

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Canvas | `--paper` | `oklch(0.982 0.009 79)` | Application background |
| Ink | `--ink` | `oklch(0.225 0.025 251)` | Main reading text and navigation |
| Ink muted | `--ink-muted` | `oklch(0.48 0.025 251)` | Secondary explanations |
| Ledger line | `--ledger-line` | `oklch(0.89 0.016 79)` | Dividers and table rules |
| Current surface | `--surface-ink` | `oklch(0.277 0.031 251)` | Sidebar and dark operational blocks |
| Sorndi Orange | `--sorndi-orange` | `oklch(0.66 0.16 39)` | Primary action and active teaching state |
| Sage | `--sage` | `oklch(0.84 0.07 145)` | Prepared and present states |
| Sky | `--sky` | `oklch(0.86 0.055 234)` | Attendance context |
| Sand | `--sand` | `oklch(0.93 0.06 81)` | Pending/review context |
| Error | `--error` | `oklch(0.59 0.19 27)` | Destructive/error only |

Palette distribution targets neutral-first hierarchy, an ink navigation anchor, and sparing orange emphasis. No gradients are permitted.

### Typography

| Role | Family | Weight | Use |
| --- | --- | --- | --- |
| Display | Fraunces | 600–700 | Dates, page titles, narrative status |
| UI and Thai | IBM Plex Sans Thai | 400–700 | Navigation, controls, Thai menu labels, helper text |
| Data | IBM Plex Sans Thai | 500–700 | Counts, time, assessment values with tabular numerals |

**Scale:** 1.2 ratio from a 16px base: 12, 14, 16, 19, 23, 28, 34, 41px.

### Space, radii, and depth

- Base unit: 4px; common groups: 8, 12, 16, 24, 32, 48px.
- Radius: 12px for cards and 8px for controls. No larger radii in the product UI.
- Depth: defined edge or soft elevation, never both. Primary panels use a 1px ledger line; floating command areas may use one restrained shadow.
- Motion: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and durations of 140ms, 180ms, and 220ms. Animate only opacity and transform.

## Layout grammar

Desktop uses a fixed 80px icon rail, a wide central work ledger, and a narrow contextual rail. Mobile collapses navigation into an accessible horizontal command bar while preserving Today’s action list before data details. Data tables keep text left aligned and numeric values right aligned using tabular figures.

## Components and state requirements

| Element | Required behaviour |
| --- | --- |
| Primary button | Orange fill, dark ink text, hover darkens, visible focus, active scale 0.97 |
| Secondary button | Paper fill, defined border, operational rather than decorative |
| Status pill | Always includes a text label and not colour alone |
| Attendance row | Whole row has a clear selected state; keyboard-accessible status switcher; neutral `Not recorded` exists separately from absence |
| Class card | Shows next action, current context, readiness state, and open action |
| Data table | Fine separators, readable 14px minimum, tabular right-aligned values, no dense visual boxes |
| Toast/feedback | Explicit action/result language; no vague success messages |

## Accessibility

- Minimum 4.5:1 normal text contrast and visible 2px focus treatment with offset.
- Minimum 44px touch targets for primary and navigation controls.
- Meaning never relies on colour alone; include text, icon, or pattern.
- Decorative images use empty alt. Content imagery uses intent-specific alt text.
- Keyboard navigation, reduced motion, and language toggle are first-class requirements.

## SEO and language strategy

English is the canonical primary content language. The in-app Thai menu changes interface labels for Thai teachers while the document retains clear `lang="en"` metadata; a future standalone Thai route should use a Thai document language and reciprocal hreflang pair. The MVP will expose descriptive title, description, Open Graph metadata, robots directives, and `SoftwareApplication` JSON-LD with no fabricated ratings or reviews.

## Slop audit

**Pass target:** No generic purple/indigo gradients; no Inter, Roboto, Arial, or system UI as primary face; no fake metrics, testimonials, reviews, or placeholder claims; no rounded-card-only composition; no copied commercial brand details; no AI-stock people-pointing imagery.

**Current result:** Passed in design specification. Implementation must be tested against this file before delivery.

## Changelog

- `2026-08-26` — Initial Field Ledger system created for SORNDI MVP.
- `2026-08-26` — Review pass strengthened primary SORNDI chrome, operational right-rail semantics, recurring vertical ledger tabs, and next-action labels.
