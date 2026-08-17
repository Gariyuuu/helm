# DATABASE.md

Neon Postgres, accessed via `@neondatabase/serverless` + Drizzle ORM.
Schema: `src/lib/db/schema.ts`. No migration files yet — `pnpm db:push`
(drizzle-kit push) applies the schema directly; `pnpm db:generate` exists
for when migration history starts mattering.

## Connection

`src/lib/db/client.ts` reads `DATABASE_URL` (falls back to a clearly-fake
`postgresql://user:***@localhost:5432/not_configured` placeholder if unset,
so a missing env var fails loudly rather than silently). `.env.local` holds
the real Neon connection string (gitignored, pulled from Vercel per
`HANDOFF.md` — never read or copy its value into any doc).

## Tables (33, per `pgTable(...)` declarations in `schema.ts`) [Verified — grepped the file directly]

Grouped by the vertical they back:

- **Core identity**: `users`, `settings`, `life_domains`, `categories`
- **People**: `contacts`, `companies`
- **Work system (the universal object model)**: `projects`, `milestones`,
  `work_items`, `dependencies` — `work_items` is the one table every
  vertical either reads directly or scopes into (see `ARCHITECTURE.md`'s
  "Domain-scoped pages" section)
- **Goals**: `goals`, `goal_relationships` (schema exists; not wired into
  any UI — goals track progress manually, per `HANDOFF.md`)
- **Calendar / time**: `events`, `focus_sessions`, `time_logs`
- **Career**: `applications`, and `contacts`/`companies` above
- **Research**: `research_projects`
- **School**: `semesters`, `courses`, `assignments`
- **Learning**: `skills`
- **Opportunities / waiting**: `opportunities`, `waiting_items`
- **Notes/attachments**: `notes`, `links`, `attachments` — schema exists,
  **no query/action/UI layer** (confirmed: not present in any file under
  `src/lib/queries/` or `src/lib/actions/` as of 2026-08-17)
- **Notifications**: `notifications` — schema exists, nothing writes to it
  (per `HANDOFF.md`)
- **Habits**: `habits` — schema exists; not referenced in `HANDOFF.md`'s
  "what's built" list, so treat as **schema-only, unverified UI** until
  checked directly
- **Travel**: `travel_projects`
- **Logging / analytics**: `activity_logs`, `priority_snapshots`
- **Reviews**: `weekly_reviews` (wired up, has UI), `daily_reviews`
  (schema exists, no UI per `HANDOFF.md`)
- **AI**: `ai_summaries` — schema exists, `src/lib/ai/provider.ts` is a
  no-op, so nothing populates this yet

## Enums

`work_item_status`, `priority_override`, `energy_level`, `reversibility`,
`project_status`, and others defined at the top of `schema.ts` via
`pgEnum(...)` — read the file directly for the full value lists rather than
duplicating them here, since Postgres enums are exactly the kind of thing
that silently drifts if restated in two places.

## Design notes worth knowing

- `work_items.type` is a **curated Zod enum validated at the app layer**,
  not a Postgres enum — the type vocabulary (assignment, exam, application,
  errand, date, trip, habit, reading, interview, ...) is expected to keep
  growing, so a rigid DB-level enum would require a migration per new type.
  [Per `ARCHITECTURE.md`, not re-verified against the Zod schema this pass.]
- `work_items.priority_score` exists as a column but is **not the source of
  truth** — every read path recomputes the score live via
  `src/lib/priority/from-db.ts` → `computePriority()`. The column is there
  for a future SQL-level sort/filter optimization at scale, not currently
  read for display. There is therefore no cache-invalidation logic to
  reason about today.
- `events.recurring_rule` and `work_items.recurring_rule` are stored
  columns with no expansion logic anywhere (per `HANDOFF.md`) — a
  recurring event/task shows as a single row, not repeated instances.

## Seeding

`src/lib/db/seed.ts` (`pnpm db:seed`) needs `SEED_CLERK_ID` (a real Clerk
user id) to attach demo data to your actual account; without it, data
attaches to a placeholder account you'll never see signed in. `SEED_EMAIL`
is a secondary seed-script env var (name only, not inspected further this
pass).

## What this pass did NOT verify

Did not run `pnpm db:push` or connect to the live Neon database (would
write to the tree / a live resource — needs the user's go-ahead per
`repo-memory`'s rules). Table list is from static analysis of `schema.ts`
only; actual row counts / whether the schema currently deployed to Neon
matches this file's `schema.ts` 1:1 is `[Unknown]`.
