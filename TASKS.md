# TASKS.md

## Current task

**T-001** (blocked: needs user confirmation) — Two things this
documentation pass surfaced that only the user can resolve:
1. The `habits` DB table has no query/action/UI layer and isn't mentioned
   in any prior doc — was Habits meant to ship and got dropped, or never
   started? Decide whether to build it or drop the table.
2. `HANDOFF.md` said "Not deployed to Vercel yet" but this pass found the
   app **is** live at `helm-lovat-theta.vercel.app` — confirm whether that
   happened intentionally (a session deployed it and didn't update docs)
   and whether the live DB has been seeded yet.

See `PROJECT_STATE.md` and `DEPLOYMENT.md` for the full detail.

## Next up (from HANDOFF.md's "suggested next session", not started)

- [ ] Daily review flow — `daily_reviews` table exists, no UI (same shape
      as the already-built Weekly Review).
- [ ] Notifications — `notifications` table exists, nothing writes to it.
- [ ] NLP quick capture for Inbox (currently structured-form only).
- [ ] Wire `goal_relationships` so Goals rolls up linked project/task
      progress instead of manual tracking.

## Blocked

- None beyond T-001's confirmation need.

## Technical debt / gaps found this pass

- [ ] `notes`/`links`/`attachments` tables — schema only, no UI.
- [ ] No CI (lint/typecheck/test gate on push).
- [ ] Only one test file in the whole repo (`priority/engine.test.ts`) —
      everything else is manually verified per session. See `TESTING.md`.
- [ ] Authorization scoping (`requireUser()` + `userId` filter) was spot-
      checked on 2 of 13 `src/lib/actions/*.ts` files, not exhaustively
      audited. See `SECURITY_REVIEW.md`.

## Documentation needed

- [ ] Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` (all
      declined this pass — they write to the tree) and record results in
      `TESTING.md`/`DEPLOYMENT.md`.
- [ ] Confirm whether `main` actually auto-deploys to Vercel on push
      (assumed by convention in `DEPLOYMENT.md`, not verified by triggering
      a real deploy).

## Recently completed (this documentation pass, 2026-08-17)

- [x] Built the full core memory system from near-scratch: only
      `CLAUDE.md` (1-line stub), `HANDOFF.md`, `ARCHITECTURE.md`, and
      `README.md` pre-existed and were real/current; created
      `PROJECT_STATE.md`, `TASKS.md` (this file), `SESSION_LOG.md`,
      `FILE_MAP.md`, `FEATURES.md`, `DECISIONS.md`, `DATABASE.md`,
      `UI_SYSTEM.md`, `SECURITY_REVIEW.md`, `TESTING.md`, `DEPLOYMENT.md`,
      `ROADMAP.md`, `CHANGELOG.md`; rewrote `CLAUDE.md`.
- [x] Verified the live deploy directly (content, not just status code)
      and corrected the stale "not deployed" claim.
- [x] Confirmed repo is public on GitHub (`gh repo view`) → named the
      security doc `SECURITY_REVIEW.md` instead of `SECURITY.md`.
- [x] Spot-verified `ARCHITECTURE.md`'s authorization claim against real
      action-file code (2 files) rather than trusting the doc as written.
- [x] Found the undocumented `habits` table gap via direct grep, not
      inherited from any prior note.

## Rejected ideas

None recorded yet — this section exists so a future rejected proposal
doesn't get re-proposed; populate it when one comes up.
