# SORNDI — Design Direction

## Three stylistic approaches

### 1. Field Ledger
**Very Brief Intro:** A calm, desk-ready teaching workspace inspired by field notebooks, classroom registers, and thoughtfully indexed curriculum materials. It makes operational work feel steady, legible, and human rather than bureaucratic.

**Probability:** 0.074

### 2. Playful Lesson Lab
**Very Brief Intro:** A bright modular environment with colorful learning blocks, visual activity cues, and energetic transitions. It foregrounds classroom momentum and makes planning feel like composing an engaging session.

**Probability:** 0.031

### 3. Night Shift Console
**Very Brief Intro:** A low-light operational dashboard built around high-contrast telemetry and condensed data panels. It positions teaching administration as a rigorous command centre for the most data-heavy users.

**Probability:** 0.087

## Chosen approach: Field Ledger

### Design Movement
**Contemporary editorial workspace** with quiet influences from field journals, archival index cards, and studio management tools. The system borrows the productivity clarity of a workspace study, but uses an original educational identity and does not reproduce another product’s assets or visual marks.

### Core Principles
1. **Next action before total count:** Every main card explains the next teaching action, status, and consequence.
2. **Evidence stays visible:** Lesson plans, attendance, marks, and reflections are connected through short, readable timelines.
3. **Warm utility, not school bureaucracy:** Surface texture, typographic contrast, and restrained colour make record-keeping feel approachable while preserving precision.
4. **Teacher control is explicit:** Derived values expose source, policy, and override state instead of looking automatic or opaque.

### Color Philosophy
The canvas is a warm rice-paper white to lower visual strain over a full teaching day. Charcoal and ink-blue establish long-reading contrast; **Sorndi Orange** signals prepared, ready-to-teach actions without turning the interface into a generic blue dashboard. Soft sage, sky, and sand tints distinguish planning, attendance, and assessment while preserving semantic clarity.

### Layout Paradigm
An **asymmetric desk layout**: a fixed narrow navigation rail, a central working ledger for the day, and a contextual right-hand strip for timeline and operational status. Large editorial headings interrupt the data rhythm so the dashboard reads like a living teaching record, not a spreadsheet.

### Signature Elements
1. **Ledger rules:** Fine horizontal divider rules and tiny index labels structure cards and lists.
2. **Lesson tabs:** Solid vertical colour bands identify active class contexts and statuses.
3. **Threaded evidence trail:** Small nodes and connector lines tie preparation, attendance, evidence, and follow-up together.

### Interaction Philosophy
Interactions should shorten a teacher’s next step: mark all present, open the current lesson, inspect a calculation, or record a reflection. Hover reveals secondary controls; focus states use the brand orange outline. Language switching must be immediate and preserve user context.

### Animation
Use short 140–220ms transform-and-opacity transitions with a crisp ease-out. On page load, important daily actions enter in a subtle 40ms stagger. Status changes use a brief checkmark scale from 0.95, never flashy colour bursts. Honour `prefers-reduced-motion` by removing non-essential motion.

### Typography System
**Fraunces** provides an editorial, humane voice for the date and primary page titles. **IBM Plex Sans Thai** delivers clear English/Thai UI labels and data alignment. Use sans-serif at 14–16px for operational text, 12px uppercase-style index labels where appropriate, and 30–40px display titles with tight letter spacing. Never use Inter as the default UI face.

### Brand Essence
**SORNDI is a local-first teaching desk for teachers who need planning, classroom records, and evidence to stay connected without surrendering control.**

Personality: **grounded, precise, encouraging.**

### Brand Voice
Headlines are direct and teacher-aware; calls to action name the real classroom task. Avoid generic productivity language and vague promises.

Example lines:

> “Science 6/1 begins in 42 minutes. Your lesson is ready.”

> “Mark the room present, then keep exceptions visible.”

### Wordmark & Logo
The logo is an abstract **open ledger / rising sun** symbol: two offset pages form an `S`-shaped centre fold and a small orange sun node represents the day’s teaching moment. It appears without text in the app chrome, paired with a custom tightened SORNDI wordmark in product contexts.

### Signature Brand Color
**Sorndi Orange — `#E5663F`**. It represents the first warm light on a desk before a school day and is reserved for primary action, current context, and active teaching state.

## MVP product scope

The first usable MVP focuses on the daily teacher flow: a **Today** dashboard, class cards, a live attendance roster with “mark all present” and exception statuses, a transparent scorebook snapshot, a lesson/evidence timeline, and export-ready state. The app runs client-side with local browser persistence for this preview; it does not claim cloud sync, account security, or production data durability.

English remains the primary content language. The primary navigation and key commands support **Thai** through an in-app `EN / ไทย` menu toggle. The language toggle changes labels without discarding entered attendance state.

## Style Decisions

- Use warm off-white backgrounds, charcoal text, ink-blue navigation, and Sorndi Orange only for active/primary cues.
- Avoid generic gradients, uniform oversized rounded cards, centered-only layouts, neon styling, and copied brand details.
- Keep cards lightly rounded (12–16px), use fine rules and offset tab motifs, and give data dense areas generous breathing room.
- Meet visible focus, keyboard, touch-target, alt-text, contrast, and reduced-motion requirements from the outset.
- Keep the open-ledger/rising-sun mark plus tightened SORNDI wordmark visible in primary desktop chrome; never let the product begin as anonymous generic workspace UI.
- Repeat the Field Ledger grammar on every major surface through fine rules, index labels, vertical lesson tabs, and threaded evidence connectors.
- Use documentary imagery only as classroom evidence: lesson materials, desks, boards, rooms, and records — never lifestyle-decoration stock.
