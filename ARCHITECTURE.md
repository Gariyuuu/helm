# Architecture

## Stack & conventions

Matches the house pattern used across other Clerk+Neon+Drizzle projects in this
workspace (edge-terminal, engo): `src/` layout, App Router, `src/proxy.ts` for auth
(Next.js 16 renamed `middleware.ts` → `proxy.ts`), Drizzle schema at
`src/lib/db/schema.ts`, shadcn `radix-nova` style with OKLCH design tokens.

```
src/
  app/
    (app)/                 authenticated shell — sidebar + topbar + command palette
      command-center/      the homepage: Next Move, Top Priorities, widgets
      today/                Must/Should/Could Do
      inbox/                quick capture + triage
      work/                 All Work — filterable list of every work item
      projects/[id]/        project detail with computed health
      school/ career/ … 	  stubbed nav destinations (ComingSoon placeholder)
    sign-in/ sign-up/       Clerk auth routes
  components/
    ui/                    shadcn primitives
    layout/                sidebar, topbar, mobile nav, command palette
    work-items/            WorkItemRow, PriorityBadge, WorkItemFormDialog
    projects/              ProjectFormDialog
    command-center/        NextMoveCard
  lib/
    db/                    schema.ts (~35 tables), client.ts, seed.ts
    priority/              engine.ts — the scoring model (pure, unit-tested)
    dashboard/             page-level view builders (kept out of components so
                            Date.now() isn't called during render — see below)
    queries/                read paths (work items, projects, domains, settings)
    actions/                'use server' mutations (Zod-validated, auth-checked)
    validation/             Zod schemas shared by actions and forms
    auth/                   getOrCreateUser() — syncs Clerk → local `users` row
    ai/provider.ts          swappable AI abstraction (no-op until Phase 7)
```

## The priority engine

`src/lib/priority/engine.ts` — `computePriority(input, now)` — is a pure, deterministic
function with no I/O. It is unit-tested in `engine.test.ts` against 22 fixtures (final
exam, internship OA, flight, gym session, quick networking email, etc.) covering the
scenarios called out in the spec, including the "closer-but-trivial deadline shouldn't
outrank a further-but-high-stakes one" reasoning test.

**Score = weighted blend, then additive boosts, then manual overrides:**

1. `base = 0.35·deadlinePressure + 0.20·(stakes+importance) + 0.30·impactScore + 0.15·consequenceScore`
   - `deadlinePressure` is a nonlinear (front-loaded) curve over hours-to-deadline, not linear.
   - `impactScore` blends the max and average across academic/career/financial/
     relationship/health/opportunity impact — one severe dimension matters more than
     five mediocre ones.
2. `base × reversibilityMultiplier` (irreversible consequences push the score up).
3. Additive boosts: dependency (other items blocked on this one), people waiting,
   neglect (repeated postponement — but only for items that already clear a base
   relevance threshold, so trivial busywork never gets resurrected by age alone), and
   a "quick win" boost for short + high-value items. A penalty applies to large,
   low-value items.
4. Blocked/waiting items are scaled down (×0.3) — they're surfaced for unblocking, not
   presented as your next move.
5. Manual overrides always win last: `pin_top` → 100, `force_today` → floor of 85,
   `do_not_prioritize` → cap of 15, `pause_until`/`ignore_until` → 0 while active.

Every score ships with a `reasons` array (`PriorityBadge` renders it as a tooltip) —
the design intentionally avoids an opaque "AI score." Buckets: 90+ Critical, 80+ Very
High, 65+ High, 45+ Medium, 25+ Low, else Someday.

Scores are computed on read, not cached in the DB — `work_items.priority_score` exists
as a column for future SQL-level sorting at scale, but the current read paths
(`src/lib/queries/work-items.ts`) always recompute from live data via
`src/lib/priority/from-db.ts`, so there's no staleness/invalidation problem to manage.

Project health (`src/lib/priority/project-health.ts`) follows the same pattern:
deterministic, explainable, unit-testable, separate from the component tree.

## Why `lib/dashboard/` exists

Next.js 16's `react-hooks/purity` ESLint rule flags impure calls (`Date.now()`,
`new Date()`) made directly inside a component/hook body. Command Center and Today
both need "what's due in the next N hours" logic, so that filtering lives in
`src/lib/dashboard/command-center-view.ts` as plain functions the page components
call — not a workaround, just where time-dependent view logic belongs.

## Data model

`src/lib/db/schema.ts` implements the full spec (~35 tables): work items, projects,
goals/goal relationships, dependencies, life domains, categories, courses/assignments,
applications, research projects, opportunities, waiting items, events, focus sessions,
time logs, notes/links/attachments, activity logs, priority snapshots, weekly/daily
reviews, settings, AI summaries. Only work items, projects, life domains, and settings
have query/action/UI layers wired up in this build phase — the rest of the schema is
provisioned and seeded so later phases (School, Career, Research, Calendar, Goals,
Waiting On, Insights) can be built directly against real tables instead of designing
schema and UI at the same time.

`work_items` is the universal object (spec §4): every kind of actionable thing —
assignment, exam, application, errand, date, trip, habit, reading, interview — is a row
here, distinguished by a free-text `type` (validated against a curated Zod enum,
not a rigid Postgres enum, since the type vocabulary will keep growing).

## Auth

`getOrCreateUser()` (`src/lib/auth/current-user.ts`) is wrapped in React's `cache()`
and lazily creates a local `users` row plus default settings and life domains on a
user's first authenticated request — no separate onboarding-triggered provisioning
step. `src/proxy.ts` gates every non-public route; every server action additionally
calls `requireUser()` and scopes all queries by `userId`, per Next's guidance to never
rely on proxy/middleware alone for authorization.
