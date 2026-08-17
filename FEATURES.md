# FEATURES.md

Status enum: Verified complete · Mostly complete · Partially implemented ·
UI only · Backend only · Mocked · Planned · Broken · Deprecated · Unable to
verify. Sourced primarily from `HANDOFF.md`'s own "what's real" / "not
built yet" lists (written by the session that built this work) plus this
pass's independent spot-checks (schema/action-file presence, live-URL
check) — not a full click-through QA pass.

## Verified complete

- **Priority engine** (`src/lib/priority/engine.ts`) — pure, deterministic,
  22 passing Vitest fixtures. `[Verified]` test file exists and was read.
- **Project health scoring** (`src/lib/priority/project-health.ts`) — same
  pattern as the priority engine. `[Inferred]` from `ARCHITECTURE.md`, not
  independently re-read this pass.
- **Work item CRUD** — create/update/complete/postpone/status/override/
  archive, all `'use server'`, Zod-validated, `userId`-scoped. `[Verified]`
  spot-checked `src/lib/actions/work-items.ts` directly.
- **Project CRUD** with computed health/progress rollup + archive/restore.
- **Command palette** (⌘K) — quick-add to inbox + jump-to-page. Had a real
  crash bug, fixed 2026-08-11 (see `DECISIONS.md` D-002).
- **Every nav destination has a real page** — Command Center, Today,
  Inbox, All Work, Projects, School, Career, Applications, Research,
  Goals, Waiting On, Learning, Travel, Personal, Health, Finance,
  Relationships, Archive, Weekly Review, Insights, Calendar, Settings,
  Patch Notes. Zero `ComingSoon` stubs, per `HANDOFF.md` and confirmed by
  directory listing of `src/app/(app)/`.
- **Dark mode** — actually wired (was previously a dead DB write with no
  effect; fixed 2026-08-11 per `patch-notes.ts` 0.4.0).
- **Accent color theming** (6 themes) + **custom backgrounds** (4 presets
  or upload) — `patch-notes.ts` 0.5.0/0.6.0, `src/components/theme/`.
- **Live deploy**: `https://helm-lovat-theta.vercel.app` returns HTTP 200
  with page title "Helm — Personal Command Center" (curl'd + content-
  verified, 2026-08-17). **This contradicts `HANDOFF.md`'s 2026-08-11
  claim of "Not deployed to Vercel yet"** — see `PROJECT_STATE.md` for the
  correction; it is deployed now, whether that happened during a later
  session or via a since-added Vercel auto-deploy is `[Unknown]`.

## Mostly complete / partial

- **Calendar + Focus Mode** — agenda view + session timer that writes
  `time_logs` and bumps `work_items.actual_minutes`. Recurring events
  (`events.recurring_rule`) are stored but never expanded into instances.
- **Goals** — tracked, but `goal_relationships` (goal↔project/task linking)
  has schema with **no UI**; progress is manual, not rolled up from linked
  work. `[Verified]` — `goals` action file exists, no linkage logic
  inspected confirms manual tracking per `HANDOFF.md`.

## Schema-only (no UI) — confirmed by absence of query/action files

- `notifications` — table exists, nothing writes to it.
- `daily_reviews` — table exists, no UI (weekly review's daily counterpart
  was never built).
- `ai_summaries` — table exists, no producer (AI provider is a no-op).
- `notes`, `links`, `attachments` — schema exists; **no file in
  `src/lib/queries/` or `src/lib/actions/` touches these tables**
  `[Verified]` by directory listing + grep, 2026-08-17.
- `habits` — schema exists; **grepped for `habits` across
  `src/lib/queries/`, `src/lib/actions/`, and `src/components/` — zero
  hits.** `[Verified]` no UI, not mentioned in `HANDOFF.md` either, so this
  is a genuinely undocumented gap this pass surfaced, not just a restated
  one.

## Deliberately out of scope (per HANDOFF.md)

Natural-language quick capture, real AI features (provider abstraction
exists, returns no-ops), notifications delivery, PWA/mobile install, bulk
import, dependency-graph visualization, decision-comparison tool, cut
list, context-switching analysis.

## Mocked / stubbed

- **AI provider** (`src/lib/ai/provider.ts`) — `NoopAiProvider`, every
  method returns a placeholder string or empty result. This is the
  intended integration seam for a future `ai-platform` connection, not a
  bug.

## Unable to verify this pass

Whether the live deploy's *authenticated* app (post-sign-in) actually
works end-to-end — this pass verified the public `/` landing page responds
with the right content, but did not sign in (would require creating a
throwaway Clerk user via the Backend API workaround `HANDOFF.md` describes,
out of scope for a docs-only pass without the user's go-ahead).
