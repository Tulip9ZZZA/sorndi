# SORNDI Brand Guide

**Name:** SORNDI — from the Thai สอนดี, "teach well".
**Tagline:** Plan less. Teach better. Share what works.
**Character:** calm, exact, a little warm. A toolmaker's product for expert practitioners — never gamified, never loud.

## Logo

The mark is the **Ledger S**: one continuous stroke with flat, paper-tab terminals. It reads three ways — the initial letter, a record flowing through the day, and a ledger tab. The wordmark is custom monoline geometry drawn to match the mark's stroke rhythm; it is not a stock font.

Files in `assets/logo/`:

| File | Use |
| --- | --- |
| `sorndi-symbol.svg` | Primary mark on light surfaces |
| `sorndi-symbol-white.svg` | Mark on dark or photographic surfaces |
| `sorndi-symbol-green.svg` | Mark in Ledger Green, single-colour contexts |
| `sorndi-wordmark.svg` | Wordmark alone |
| `sorndi-lockup-horizontal.svg` | Default lockup (mark + wordmark) |
| `sorndi-lockup-horizontal-white.svg` | Lockup for dark surfaces |
| `sorndi-lockup-stacked.svg` | Square placements |
| `favicon.svg` | Browser tab |
| `sorndi-app-icon.svg` / `-green.svg` | App tiles |

Rules: clear space equal to the stroke width on all sides; minimum height 16 px for the symbol, 20 px cap height for the wordmark; never add gradients, shadows, rotations or colours outside the palette; never rebuild the wordmark in a font.

## Palette

Warm paper neutrals with one accent, **Ledger Green** — the calm of a chalkboard without the clichés (no apples, pencils, owls, or graduation caps). Contrast verified against WCAG AA.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| paper | `#FAF9F6` | `#14120F` | Canvas |
| subtle | `#F2F0EB` | `#1B1915` | Sidebar, table headers |
| raised | `#FFFFFF` | `#201D18` | Cards, dialogs |
| ink | `#1C1915` | `#F4F2ED` | Primary text |
| ink-secondary | `#57534B` | `#B5AFA4` | Labels, metadata |
| ink-muted | `#7A7468` | `#8B8478` | Hints |
| border | `#E6E3DC` | `#2E2B25` | Hairlines |
| border-strong | `#8A8479` | `#55504A` | Active boundaries |
| accent | `#1F6E4E` | `#2E7D58` | Primary action, selection |
| accent-text | `#175A3E` | `#4FB084` | Accent as text |

Attendance/status colours (toned, never neon): red `#B3403A`, amber `#9A6B15`, slate `#4A6B8A`, clay `#A8552F`, teal `#2E7D74`.

## Typography

SornDi must render identically offline, so it ships **no webfonts**.

- **Interface:** system sans stack (`-apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Thai", sans-serif`)
- **Editorial (lesson narratives, landing headline):** Georgia / charter serif stack
- **Data (numbers, dates, IDs, formulas):** system mono stack, `tabular-nums`

Weights 400 and 500, 600 for rare emphasis. Sentence case everywhere. No uppercase tracked labels.

## Voice

Direct, precise, respectful of the teacher's expertise. Short labels. Numbers over adjectives. No exclamation marks, no hype words, no claims we cannot check. A warning says what is wrong and how to override it.

## Signature details

- The **ledger tab** — the mark's flat terminal — reappears as the active-navigation indicator and section markers.
- **Ruled hairlines** like a paper gradebook: table rows and section dividers stay 1px, never shaded bands.
- **Status stamps** — attendance states are quiet tinted chips with text, not coloured confetti.
- **The math is on the page** — wherever a total appears, the formula that produced it is one click away.
