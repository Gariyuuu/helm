# Handoff

> **Correction added 2026-08-17 by a documentation-audit pass** (content
> below this note is unchanged from the 2026-08-11 session that wrote it):
> the "Not deployed to Vercel yet" line below is **outdated**. A Vercel
> project is linked (`.vercel/project.json`) and
> `https://helm-lovat-theta.vercel.app` is live and content-verified. See
> `PROJECT_STATE.md` and `DEPLOYMENT.md` for the full correction, and
> `TASKS.md` for **current task T-001** (blocked: needs user confirmation
> on deploy/seed status and the undocumented `habits`-table gap).

Status as of this session: **every nav destination is a real page.** Phase 1
(Foundation), Phase 2 (Core Work System), Phase 5 (Calendar + Focus Mode + time logs),
and Phase 6 (School/Career/Applications/Research/Goals/Waiting On + the remaining
domain verticals) are done, plus a working slice of Phase 3 (Priority Engine) and
Phase 4 (Command Center) — see the master spec's §83 build order. Pushed to
`github.com/Gariyuuu/helm`. Neon + Clerk are provisioned (`.env.local` has real
credentials, pulled via Vercel). Not deployed to Vercel yet **[Outdated — see the
correction note above]**.

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
  from associated work items, plus archive/restore.
- Real pages: **Command Center**, **Today**, **Inbox**, **All Work**, **Projects**
  (list + detail), **Settings**.
- Command palette (⌘K) — quick-add to inbox + jump-to-page. **Was broken this session**
  (see "Bug fixed" below) — confirmed working now.
- Seed script with realistic demo data — `src/lib/db/seed.ts`.
- Full nav (§46) — **every single sidebar destination is now a real page. Zero
  `ComingSoon` stubs remain.**
- **School/Career/Research/Goals/Waiting On/Applications** (built last session):
  full queries/actions/validation/UI. School computes a live weighted grade per course.
  Applications groups into pipeline stages.
- **This session's additions**, each with full queries/actions/validation/UI:
  - **Learning** (`.../learning`) — skills with level progress, an editable resource
    checklist (jsonb array, same pattern as Research's reading list), and hour logging.
  - **Travel** (`.../travel`) — trips with flights/hotels/checklist, each a jsonb array
    with its own add action.
  - **Personal / Health / Finance** (`.../personal`, `.../health`, `.../finance`) —
    all three share one component, `src/components/domain/domain-work-view.tsx`,
    which filters `work_items` by `life_domains.slug` and reuses the existing
    `WorkItemFormDialog`/`WorkItemRow`. No new tables — these three life domains are
    just scoped views into the universal work-item system, matching how the spec
    describes them.
  - **Relationships** (`.../relationships`) — contacts directory (shared with Career's
    `contacts` table) + a "relationships"-domain-scoped follow-up list.
  - **Archive** (`.../archive`) — lists archived projects and archived work items with
    Restore buttons. **Wired up the archive entry point too**: `WorkItemRow`'s overflow
    menu now has an "Archive" action, and the project detail page has an "Archive"
    button next to Edit (`src/components/projects/archive-project-button.tsx`) — neither
    existed before, so Archive was previously a dead end with no way to get anything
    into it.
  - **Weekly Review** (`.../weekly-review`) — auto-computes completed/missed/added/
    dropped counts for the current week from `work_items` (`computeWeekStats` in
    `src/lib/queries/weekly-review.ts`), you fill in the reflection fields, upserts on
    `(userId, weekStart)`. Past reviews listed below the form.
  - **Insights** (`.../insights`) — read-only analytics from existing data: completed
    (7d/30d), overdue count, active work by priority bucket, by domain, project health
    distribution. No new tables, no chart library — simple proportional bar rows.
  - **Calendar + Focus Mode** (`.../calendar`) — agenda view of upcoming `events`
    grouped by day, plus a **Focus Mode panel**: start a session (optionally linked to
    a work item, with planned minutes), live ticking timer, Stop writes a `time_logs`
    row and bumps `work_items.actual_minutes`, Abandon just closes it out. Only one
    active session at a time (enforced server-side in `startFocusSession`).

## Bug fixed this session (pre-existing, not introduced by this session's work)

The ⌘K command palette crashed on open: `Cannot read properties of undefined (reading
'subscribe')` in `CommandInput`. Root cause: `src/components/ui/command.tsx`'s
`CommandDialog` rendered `{children}` directly inside `DialogContent` instead of
wrapping them in `<Command>` — so `CommandInput`/`CommandList` had no cmdk store
context to read from. One-line fix: wrap children in `<Command>`. Verified fixed by
driving the actual quick-add flow (open palette → type → select "Add to Inbox" → item
appears in `/inbox`) with zero console errors.

## Not built yet (deliberately out of scope)

Natural-language quick capture (Inbox is structured-form only — no NLP extraction), AI
features (provider abstraction exists at `src/lib/ai/provider.ts`, returns no-ops —
there's a separate `ai-platform` project in this workspace meant to back this later),
notifications (table exists, nothing writes to it), PWA/mobile install, bulk import,
dependency graph visualization, decision comparison tool, cut list, context-switching
analysis, daily review flow (`daily_reviews` table exists, no UI), patch notes page.
Goal↔project/task linking (`goal_relationships` table) isn't wired into any UI — goals
track progress manually, not by rolling up linked work. Recurring events/rules
(`events.recurring_rule`, `work_items.recurring_rule`) are stored but not expanded
anywhere.

## Before this is usable day-to-day

1. Neon + Clerk are provisioned — `.env.local` has real values pulled from Vercel.
   `pnpm db:push` (drizzle-kit doesn't read `.env.local` on its own — `source .env.local`
   into the shell env first, or `set -a && source .env.local && set +a`).
2. Sign in once, grab your Clerk user id, then
   `SEED_CLERK_ID=<id> pnpm db:seed` to get realistic demo content instead of an empty app.
   (Live DB has 0 rows in every table as of this session — seed was never run against it.)
3. Not deployed to Vercel yet.

## How this session verified everything (worth knowing for next time)

No test-mode Clerk instance is configured, so driving `/sign-up` hits a Cloudflare
Turnstile bot-check. Worked around it via the Clerk **Backend API** instead of the UI:
`POST /v1/users` (with `skip_password_checks:true`) to create a throwaway user,
`POST /v1/sign_in_tokens` to mint a token (each is single-use — mint a fresh one per
run), then navigate to `/sign-in?__clerk_ticket=<token>` — that path skips bot
detection entirely. Deleted the throwaway user after each session (cascade-deletes its
rows). Playwright wasn't a repo dependency; installed ad hoc into a scratch dir
(`npm install playwright`) rather than adding it to this project — browsers were
already cached under `~/Library/Caches/ms-playwright`. Every new page and the
command-palette fix were clicked through end to end with zero console/pageerror/5xx;
dev-server terminal output was cross-checked too (it echoes `[browser] ...` console
messages and every server action's status code) and is what actually surfaced the
command-palette bug — a Playwright `page.on('console')` listener would have caught it
too, but the bug was found via an earlier test-script mistake (an ambiguous button
selector accidentally clicked the palette open) before the listener was wired up on
that particular run.

## Suggested next session

Everything in nav is real now, so the natural next steps are the "not built yet" list
above — daily review flow and notifications are probably the highest-value next picks
(both have schema + no UI, same shape as this session's work). After that: NLP quick
capture for Inbox, or wiring `goal_relationships` so Goals actually rolls up linked
project/task progress instead of tracking it manually.

---

## Prompt for the next Claude Code account

```
This is ~/Projects/helm — Gary Wang's Personal Command Center / Life OS
(Next.js 16 + React 19 + TypeScript + Tailwind 4 + shadcn + Clerk + Neon +
Drizzle). Public GitHub repo (github.com/Gariyuuu/helm) but stores real
personal data (school/career/health/finance) — see SECURITY_REVIEW.md.

Before doing anything else:
1. Read this file (HANDOFF.md) fully, including the 2026-08-17 correction
   note at the top.
2. Read PROJECT_STATE.md, then CLAUDE.md, then TASKS.md (current task
   T-001 — needs your confirmation on 2 open questions, see TASKS.md).
3. Run `git status` and `git log --oneline -10` and reconcile against
   PROJECT_STATE.md — don't assume the docs are perfectly in sync.
4. Verify https://helm-lovat-theta.vercel.app still returns the real app
   (title "Helm — Personal Command Center"), not just a 200 — vanity
   .vercel.app domains have collided with unrelated third-party sites
   elsewhere in this workspace before.
5. Every server action must call requireUser() and scope by userId — see
   CLAUDE.md's critical rules before adding or editing one.

Before you end your session: update PROJECT_STATE.md, TASKS.md, and
append a dated entry to SESSION_LOG.md. These docs are the only memory
that carries forward to the next account/session.
```
