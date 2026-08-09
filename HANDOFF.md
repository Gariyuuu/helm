# Handoff

Status as of this session: **Phase 1 (Foundation) + Phase 2 (Core Work System) done**,
plus a working slice of Phase 3 (Priority Engine) and Phase 4 (Command Center) — see
the master spec's §83 build order. Not yet pushed to GitHub; not yet deployed.

## What's real and working

- Full repo scaffold: Next.js 16, React 19, TypeScript, Tailwind 4, shadcn (`radix-nova`).
- Complete Drizzle schema for the entire spec (~35 tables) — `pnpm db:push` provisions it.
- Clerk auth wired end-to-end (`src/proxy.ts`, sign-in/up routes, `getOrCreateUser`).
- **Priority engine** (`src/lib/priority/engine.ts`): deterministic, explainable,
  22 passing unit tests. This is the one piece of "intelligence" this phase invested in.
- Project health scoring (`src/lib/priority/project-health.ts`) — same pattern.
- Work Item CRUD: create/update/complete/postpone/status/override/archive, all as
  Zod-validated, auth-checked server actions (`src/lib/actions/work-items.ts`).
- Project CRUD (`src/lib/actions/projects.ts`) with computed health/progress rollups
  from associated work items.
- Real pages: **Command Center** (Next Move, Top Priorities, Attention Required,
  Deadline Radar, Capacity Meter, Quick Wins, Active Projects), **Today**
  (Must/Should/Could Do), **Inbox** (quick capture + triage), **All Work** (filterable
  list), **Projects** (list + detail with health explanation), **Settings** (capacity/
  notifications/theme, persisted).
- Command palette (⌘K) — quick-add to inbox + jump-to-page. Global keyboard shortcut.
- Seed script with realistic demo data across academics, research, career/internship,
  side projects, learning, health, personal/travel/finance — see `src/lib/db/seed.ts`.
- Full nav (§46) — every sidebar destination resolves to either a real page or a
  labeled "coming in a later phase" stub, never a 404.

## What's deliberately stubbed (not broken — just not this session's scope)

Calendar, School, Career, Applications, Research, Learning, Personal, Relationships,
Travel, Health, Finance, Goals, Waiting On, Insights, Weekly Review, Archive all render
a `ComingSoon` placeholder. Their **tables already exist and are seeded** (courses,
applications, research_projects, opportunities, waiting_items, skills, etc.) — the next
session's job is queries/actions/UI, not schema design.

Also not built yet: Calendar/events UI, Focus Mode, natural-language quick capture
(Inbox is structured-form only — no NLP extraction), AI features (provider abstraction
exists at `src/lib/ai/provider.ts` but returns no-ops), notifications, PWA/mobile
install, bulk import, dependency graph visualization, decision comparison tool,
cut list, context-switching analysis, daily/weekly review flows, patch notes page.

## Before this is usable day-to-day

1. **Provision Neon + Clerk.** Nothing was auto-provisioned this session — `.env.local`
   needs a real `DATABASE_URL` and Clerk keys (see README). This was a deliberate
   choice to avoid creating external account resources without asking first.
2. `pnpm db:push`, sign in once, grab your Clerk user id, then
   `SEED_CLERK_ID=<id> pnpm db:seed` to get realistic demo content instead of an empty app.
3. Not deployed to Vercel yet.

## Suggested next session

Follow the spec's own build order (§83): Phase 5 (Calendar + Focus Mode + time logs)
or Phase 6 (School/Career/Applications/Research/Goals/Waiting On — the schema and seed
data are already there, so this is mostly queries + actions + pages, much faster than
this session). Recommend Phase 6 first since it turns already-seeded data into visible,
useful pages before adding Focus Mode's session-timer complexity.
