# SornDi pre-launch security gate — 2026-11-13

Release: SornDi 2.0.0
Target: `main` branch of `Tulip9ZZZA/sorndi`
Source: `/home/ubuntu/upload/sorndi-repo(1).zip`
Environment: isolated sandbox working tree

## Verdict

**READY WITH DISCLOSED LIMITATIONS** for this repository commit. No P0/P1 finding was identified in the checks that ran. This is not a claim that the application is universally secure.

## Evidence and status

| Control | Status | Evidence |
|---|---|---|
| Domain tests | PASS | `npm test`: 15/15 tests passed |
| Build integrity | PASS | `npm run build`: generated `index.html` successfully; 162442 bytes |
| Diff hygiene | PASS | `git diff --check` returned clean |
| Runtime dependencies | PASS | `package.json` has no dependencies or devDependencies |
| High-confidence secret patterns | PASS | Repository scan found no private-key or common token patterns |
| Runtime network/dynamic execution scan | PASS | No `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `new Function`, or `document.write` found in app/runtime files |
| CI token permissions | PASS | `.github/workflows/ci.yml` retains `permissions: contents: read` from existing `main` |
| Secret-file exclusions | PASS | `.gitignore` retains `.env`, key, credential, and secret-file exclusions from existing `main` |
| Gitleaks | BLOCKED | `gitleaks` is not installed in this sandbox; equivalent high-confidence pattern scan ran instead |
| Semgrep/OWASP rules | BLOCKED | `semgrep` is not installed in this sandbox |
| Trivy filesystem scan | BLOCKED | `trivy` is not installed in this sandbox |
| Browser E2E | SKIPPED | No deployed/staging target or test account was provided; app is client-side |
| Production deployment | N/A | This action only updates GitHub `main`; no production deployment was performed |

## Scope notes

The archive's tracked application files match the current `main` application content. The archive attempted to remove two existing hardening controls: read-only GitHub Actions contents permission and secret-file exclusions. Those changes were intentionally not carried forward.

SornDi is documented as a client-side, local-first application with no accounts, server, or runtime network calls. Browser local storage remains the trust boundary; shared devices and untrusted exported files are outside the application security boundary.

## Residual risks and owners

- **P2 / tooling coverage:** install and run Gitleaks, Semgrep, and Trivy in CI or a release environment before a public production launch. Owner: repository maintainer. Deadline: before production deployment.
- **P2 / browser coverage:** run Playwright against a served copy for storage, export, navigation, and XSS regression cases. Owner: repository maintainer. Deadline: before production deployment.

Human release owner requested the commit and push after being informed that archive-provided instruction-like content would not be trusted or executed.
