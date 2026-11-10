# Security Policy

## Scope

SornDi is a fully client-side application. It has no server, no accounts, and no network calls. The security surface is therefore:

1. **Local data integrity** — classroom data in the browser's local storage.
2. **Export safety** — generated CSV/Markdown/HTML/JSON files.
3. **Supply chain** — the repo contains zero runtime dependencies; CI runs only the Node test suite.

## Supported versions

| Version | Supported |
| --- | --- |
| 2.0.x | Yes |
| 1.x (previous private build) | No |

## Reporting a vulnerability

Open a [security advisory](https://github.com/Tulip9ZZZA/sorndi/security/advisories/new) rather than a public issue. Include the browser/OS, a minimal reproduction, and the impact. You will get a response within 7 days; we aim to ship a fix within 30 days for confirmed issues.

## Known design boundaries (not vulnerabilities)

- Local storage is readable by anything running in the same browser origin. If a teacher shares a computer with students, they should use a separate browser profile and lock the machine between classes. SornDi stores data in the origin `file://` or the serving origin — treat the device as the trust boundary.
- HTML exports are generated from escaped strings, but you should still not open exports on machines you do not trust.
- The quiz "shared device" and "projector" modes intentionally have no student identity. Do not use them as an assessment of record without your own invigilation.

## Data protection expectations

SornDi is designed for data minimisation: no student accounts, no health data, no behavioural scoring, no telemetry. Deployments that add servers or sync layers inherit the responsibility to review child-data obligations in their jurisdiction before going live.
