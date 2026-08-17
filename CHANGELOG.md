# CHANGELOG.md

This project already maintains a real, user-facing version log in-app:
`src/lib/patch-notes.ts` (rendered at `/patch-notes`), currently through
version `0.6.0` ("Accent, everywhere — plus custom backgrounds",
2026-08-12). **That file is the canonical changelog** — this file doesn't
duplicate its entries; read `patch-notes.ts` directly for the real
version-by-version history. This file exists only so the repo has the
canonical doc-audit trail alongside it.

## [Unreleased / undated] — repo-memory documentation audit — 2026-08-17

- Created the missing core memory files (`PROJECT_STATE.md`, `TASKS.md`,
  `SESSION_LOG.md`) plus `FILE_MAP.md`, `FEATURES.md`, `DECISIONS.md`,
  `DATABASE.md`, `UI_SYSTEM.md`, `SECURITY_REVIEW.md`, `TESTING.md`,
  `DEPLOYMENT.md`, `ROADMAP.md`, and this file. Rewrote `CLAUDE.md` (was a
  1-line `@AGENTS.md` stub) into a real operating manual.
- **No product behavior was intentionally changed.** No code, schema,
  dependency, or config file was edited — documentation only.
- Found and corrected a real staleness: `HANDOFF.md` (2026-08-11) claimed
  "Not deployed to Vercel yet"; this pass confirmed
  `https://helm-lovat-theta.vercel.app` is live (content-verified, not
  just HTTP 200) and a Vercel project is linked (`.vercel/project.json`).
- Found an undocumented gap: the `habits` DB table has no query/action/UI
  layer anywhere in the codebase — not previously flagged in `HANDOFF.md`.
  See `ROADMAP.md`.
