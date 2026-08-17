# TESTING.md

## Automated tests

Vitest (`pnpm test` → `vitest run`). **One test file exists in the whole
repo**: `src/lib/priority/engine.test.ts` — 22 fixtures covering the
priority-scoring engine (final exam, internship OA, flight, gym session,
quick networking email, etc.), including a reasoning test that a closer-
but-trivial deadline shouldn't outrank a further-but-high-stakes one.
`[Verified]` — file read directly, confirmed by `find` across the repo
(excluding `.agents/`) that no other `*.test.ts` exists.

No component tests, no integration tests, no E2E test suite committed to
the repo. `vitest.config.mts` exists but only this one suite runs against
it.

## Manual verification (how the building session actually tested)

Documented in `HANDOFF.md`: no test-mode Clerk instance is configured, so
`/sign-up` hits a Cloudflare Turnstile bot-check in normal use. Worked
around via the Clerk **Backend API**: create a throwaway user
(`POST /v1/users`, `skip_password_checks: true`), mint a single-use sign-in
token (`POST /v1/sign_in_tokens`), navigate to
`/sign-in?__clerk_ticket=<token>` (skips bot detection), then delete the
throwaway user after (cascade-deletes its rows). Playwright was installed
ad hoc into a scratch dir for this (not a repo dependency) — browsers
reused from `~/Library/Caches/ms-playwright`.

Every new page and the command-palette fix were click-tested end-to-end
this way with zero console/pageerror/5xx, cross-checked against dev-server
terminal output (which echoes browser console messages and every server
action's status code).

## Manual smoke-test checklist (for the next session — not yet automated)

1. Sign up / sign in (via the Backend-API-ticket workaround above, or a
   real account) → lands on `/command-center`.
2. Quick-add via ⌘K → item appears in `/inbox`.
3. Create a work item with a deadline → check it appears correctly bucketed
   on `/today` and shows a reasonable priority badge.
4. Create a project, link work items, archive one → project health/
   progress updates; archived item shows in `/archive` with a working
   Restore.
5. Start a Focus Mode session on `/calendar`, stop it → `time_logs` row
   created, `work_items.actual_minutes` bumped.
6. Change theme (light/dark), accent color, and background in Settings →
   persists across a reload.
7. Visit every nav destination once → confirm none render a `ComingSoon`
   stub (per `FEATURES.md`, none should).

## What this pass verified

Ran `find` for test files and read the one that exists;
confirmed `pnpm test`'s script definition in `package.json`. Did **not**
run `pnpm test`, `pnpm typecheck`, `pnpm lint`, or `pnpm build` — those
write to `.next`/`tsconfig.tsbuildinfo` or otherwise touch the tree, so per
this documentation pass's rules they need the user's go-ahead first. If
approved next session, running all four and recording the exact output
here would meaningfully raise this repo's handoff readiness.

## Env vars needed for tests

None that `engine.test.ts` requires — it's pure-function testing with no
DB/auth dependency (confirmed by reading the file's imports).
