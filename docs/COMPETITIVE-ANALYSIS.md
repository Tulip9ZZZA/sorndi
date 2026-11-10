# SORNDI Competitive Analysis

**Method:** REA-style evidence discipline — publicly observable marketing and product surfaces only, every observation dated, every limitation recorded. No proprietary code, assets, or private product data were accessed, and none should be.
**Live capture date:** 10 November 2026, via a headless Chromium session.
**Author:** SORNDI founder working document, consolidated for the v2 rebuild.

## 1. What we captured, and what we could not

| Product | Capture result on 2026-11-10 | Evidence used |
| --- | --- | --- |
| Additio (additioapp.com) | Full homepage text captured | Live capture |
| iDoceo (idoceo.net) | Full homepage text captured | Live capture |
| Wayground / Quizizz (wayground.com) | Full homepage text captured | Live capture |
| Nearpod (nearpod.com) | Full homepage text captured | Live capture |
| Wordwall (wordwall.net) | Full homepage text captured | Live capture |
| ClassDojo (classdojo.com) | Full homepage text captured | Live capture |
| Gimkit (gimkit.com) | Full homepage text captured | Live capture |
| Kahoot! (kahoot.com) | Full homepage text captured | Live capture |
| HiClass (myhiclass.com) | **Blocked** — anti-bot verification challenge never cleared in a headless browser | Earlier in-house teardown dated 26 Aug 2026 (founder Notion research) |
| Blooket (blooket.com) | **Blocked** — Cloudflare IP-level block | Earlier in-house notes |
| Moodle (moodle.org) | **Blocked** — captcha interstitial | Public architecture knowledge, unverified today |
| Google Classroom | Not fetched — signin-walled product page adds little beyond well-documented assignment workflow | Public knowledge |

Blocked sites are recorded as blocked. Where we rely on the earlier in-house teardown instead of a live capture, the table says so. Nothing below is inferred from anything we could not read.

## 2. What each competitor actually says it is (verbatim positioning, captured 2026-11-10)

| Product | Headline / positioning as captured | Pricing signal |
| --- | --- | --- |
| Additio | "Evalúa, planifica y enseña con la ayuda de la IA" — formative evaluation, classroom management and planning, "now with integrated AI" | Teachers Standard vs Teachers Pro AI plans; schools plan |
| iDoceo | "Your classroom. Beautifully in hand." — gradebook, planner and classroom tools together | **One-time purchase**, "no subscriptions or in-app purchases" |
| Wayground | "What will you teach today?" — "Teacher AI and Resources"; positions as consolidating "5 tools into 1" | Free signup for teachers, quote for admins |
| Nearpod | "Foster a love of learning in every student" — interactive instructional delivery, 22,000+ lesson library | "Sign up for FREE" + schools quote |
| Wordwall | "More teaching, less prep." — "Create interactive activities in just one minute" | Sign up free; paid plans for full library |
| ClassDojo | "Where classrooms become communities" — "Free for teachers, forever" | Free for teachers; school/district tiers |
| Gimkit | "Gimkit - live learning game show", founder story: "I'm Josh! I started Gimkit as a high school project." | Free signup, group pricing |
| Kahoot! | "Make learning awesome!" | Kahoot!+ from $3/mo, tiers to $19/mo, Black-Friday discounting |

## 3. Feature signals worth learning from (and what SORNDI does with each)

### iDoceo — proof that teacher-owned, offline records sell
iDoceo leads with three promises SORNDI shares: **one-time purchase, works offline, your data stays yours**. It bundles gradebook with custom formulas, planner and diary with attachments, a visual seating plan with attendance, shareable templates, and PDF/XLS/CSV export. Its "iDoceo Connect" layer publishes assessments to students in a browser with live team challenges, and it integrates with Moodle, Google Classroom and Microsoft Teams.
**SORNDI take:** the offline, teacher-owned record is not a niche demand — it is a headline. SORNDI matches it with local-first storage in the browser, human-readable exports, and adds what iDoceo does not have: a connected teaching-session record and open source.

### Additio — where the AI money is going
Additio's entire new plan tier is AI: rubrics generated automatically, AI-assisted class planning, an AI chat assistant. It claims "more than 150 functionalities" and 25,000+ schools across its parent group.
**SORNDI take:** competitors are converting AI into a subscription tier. SORNDI deliberately keeps the core deterministic and offline, and treats generation as optional — an edit, never an authority. The planning engine uses fixed evidence-informed templates (retrieval practice, worked examples, task-based learning) that always produce an editable draft.

### Wayground — the consolidation pitch and accommodations
Wayground sells breadth ("assessments, presentations, homework, videos, flashcards") with AI generation from a topic, doc, standard, or upload, plus a built-in accommodations set (reading supports, translation, focus) and the argument that "every response, every data point... feeds into the record."
**SORNDI take:** "everything feeds one record" is the strongest sentence any competitor said, and Wayground means it inside their cloud account. SORNDI makes the same sentence true in a file the teacher owns: session → attendance → game results → reflection → export, all one JSON.

### Nearpod and Wordwall — lesson libraries and the printable fallback
Nearpod sells a 22,000+ standards-aligned library and real-time formative insight; Wordwall sells 1-minute authoring, 30+ activity types, a 30-million-activity community library, and — unique — a **printable fallback** for every activity, backed by cited classroom studies.
**SORNDI take:** the printable/projector fallback matters more for SORNDI's market than a giant library. The quiz runner is designed to work with zero student devices (tally mode), which none of the live-game competitors offer as a first-class mode.

### ClassDojo — community is adjacent, not core
ClassDojo is communication: messages translated into 190+ languages, stories, portfolios, points, plus a small Teacher Toolkit (attendance sheets, timers).
**SORNDI take:** family communication is out of scope for v2. The lesson worth taking is the toolkit idea — small utilities (randomizer, timer, team maker) live inside the same app because teachers reach for them mid-class.

### Gimkit and Kahoot! — game loops and join codes
Gimkit's loop is answer → earn cash → buy upgrades, self-paced, with 10+ modes, homework auto-grading, and KitCollab (students submit questions). Kahoot! sells the live join-code game show at subscription tiers.
**SORNDI take:** one reliable game mode beats ten shallow ones for v2. SORNDI ships a live quiz with join-code and projector modes, keeps results as evidence attached to the teaching session (never a public leaderboard), and leaves the game-mode zoo for later.

## 4. The gap SORNDI occupies

Four things no captured competitor offers together:

1. **One connected teaching-session record** — attendance, lesson, game results, evidence and reflection reference the same session object and export coherently.
2. **Local-first and open source** — the whole app is one HTML file; data lives in the teacher's browser; a JSON backup is a complete exit. iDoceo owns data but is closed and paid; Moodle is open but is an institution LMS, not a daily teacher cockpit.
3. **Transparent arithmetic** — missing ≠ zero, excused ≠ zero, and every weighted total shows its own formula. None of the captured competitors advertises showing the math.
4. **Works with zero student devices and zero accounts** — projector/tally quiz mode, printable exports, no signup, no cloud.

## 5. What SORNDI deliberately does not compete on

- Not a school ERP, LMS, parent-messaging network, or marketplace in v2.
- Not "more features than X" — Additio claims 150+; feature-count wars are unwinnable and undesirable.
- Not AI-first: no feature requires an API key, an account, or a connection.
- Not gamification pressure: no points for points' sake, no public child rankings, no confetti.

## 6. Dated watch list

Re-check quarterly: Additio's AI tier pricing, Wayground's consolidation messaging, iDoceo's Windows/Android expansion, Kahoot!'s classroom tier limits, and whether any competitor ships a local-first or open-source offering (none captured as of 2026-11-10).
