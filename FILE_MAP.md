# FILE_MAP.md

Annotated guide to the files that matter. Paths relative to repo root. See
`ARCHITECTURE.md` for the system-level picture this falls out of.

## App routes (`src/app/`)

| Path | What it is |
|---|---|
| `(app)/` | Authenticated route group — sidebar + topbar + command palette shell (`src/components/layout/`). Gated by `src/proxy.ts`. |
| `(app)/command-center/` | Homepage: Next Move card, top priorities, widgets. |
| `(app)/today/` | Must/Should/Could Do triage view. |
| `(app)/inbox/` | Quick-capture + triage (structured form, no NLP). |
| `(app)/work/` | All Work — filterable list of every `work_items` row. |
| `(app)/projects/[id]/` | Project detail: computed health/progress rollup from linked work items. |
| `(app)/school/ career/ applications/ research/ goals/ waiting-on/` | Per-vertical pages, each with real queries/actions/UI. |
| `(app)/learning/ travel/` | Skills-with-resources and trips-with-checklists verticals. |
| `(app)/personal/ health/ finance/` | All 3 render `src/components/domain/domain-work-view.tsx` — no dedicated tables, just `work_items` filtered by `life_domains.slug`. |
| `(app)/relationships/` | Contacts directory (shares `contacts` table with Career) + domain-scoped follow-up list. |
| `(app)/archive/` | Archived projects + archived work items, with Restore. |
| `(app)/weekly-review/` | Auto-computed week stats + reflection form, upserts on `(userId, weekStart)`. |
| `(app)/insights/` | Read-only analytics (completed 7d/30d, overdue, by-priority/domain, project health distribution). No chart library — proportional bar rows. |
| `(app)/calendar/` | Agenda view of `events` + Focus Mode panel (session timer → `time_logs`). |
| `(app)/settings/` | Theme, accent color, background, and other user settings. |
| `(app)/patch-notes/` | Renders `src/lib/patch-notes.ts` — the in-app changelog (see `CHANGELOG.md`). |
| `sign-in/[[...sign-in]]/`, `sign-up/[[...sign-up]]/` | Clerk auth routes (Clerk's catch-all convention). |
| `src/proxy.ts` | Next.js 16's renamed `middleware.ts`. Gates every route except `/`, `/sign-in(.*)`, `/sign-up(.*)`. |

No `src/app/api/` directory exists — there are no API routes; all mutation
goes through `'use server'` actions in `src/lib/actions/`. There is no
`API_REFERENCE.md` in this repo — that doc is intentionally not written,
since there's no API surface to document (server actions aren't
externally callable the way a REST/RPC endpoint is).

## Components (`src/components/`)

| Dir | What it is |
|---|---|
| `ui/` | shadcn primitives (`radix-nova` style, OKLCH tokens). |
| `layout/` | Sidebar, topbar, mobile nav, command palette (`command-palette.tsx`). |
| `work-items/` | `WorkItemRow`, `PriorityBadge`, `WorkItemFormDialog`, `QuickAddBar`, list client. |
| `projects/` | `ProjectFormDialog`, `ArchiveProjectButton`. |
| `command-center/` | `NextMoveCard`. |
| `domain/` | `domain-work-view.tsx` — shared by Personal/Health/Finance/Relationships pages. |
| `theme/` | `accent-provider.tsx`, `background-provider.tsx` — localStorage-backed, hydration-safe (see the `eslint-disable react-hooks/set-state-in-effect` comments in both). |
| `goals/ research/ school/ career/ applications/ waiting-on/ learning/ travel/ archive/ weekly-review/ calendar/ settings/` | Per-vertical form dialogs + row/card components. |

## Lib (`src/lib/`)

| Path | What it is |
|---|---|
| `db/schema.ts` | Drizzle schema, ~33 tables (see `DATABASE.md` for the exact list). |
| `db/client.ts` | Neon serverless client, reads `DATABASE_URL`. |
| `db/seed.ts` | Demo-data seed script; needs `SEED_CLERK_ID` to attach to a real user. |
| `priority/engine.ts` | `computePriority()` — pure, deterministic scoring function. |
| `priority/engine.test.ts` | 22-fixture Vitest suite for the engine — the only test file in the repo. |
| `priority/project-health.ts` | Same pattern, for project health scoring. |
| `priority/from-db.ts` | Adapts DB rows into `PriorityInput` for the engine. |
| `dashboard/` | Page-level view builders kept out of components (Next 16 `react-hooks/purity` rule — no `Date.now()`/`new Date()` in component bodies). |
| `queries/*.ts` | One read-path file per vertical (14 files: work-items, projects, domains, settings, goals, research, school, career, waiting-items, skills, travel, weekly-review, insights, calendar). |
| `actions/*.ts` | `'use server'` mutations, Zod-validated, auth-checked (13 files, roughly mirroring `queries/`). |
| `validation/` | Zod schemas shared by actions and forms. |
| `auth/current-user.ts` | `getOrCreateUser()` — Clerk → local `users` row sync, wrapped in React `cache()`. |
| `ai/provider.ts` | `AiProvider` interface + `NoopAiProvider` — every AI call site goes through `getAiProvider()`, currently always the no-op. |
| `patch-notes.ts` | In-app changelog data (`PATCH_NOTES` array), rendered at `/patch-notes`. |

## Config

| File | Note |
|---|---|
| `.env.example` | Real env var names, empty placeholders. See `SECURITY.md`/`DEPLOYMENT.md`. |
| `.env.local` | Real values (Neon + Clerk), gitignored, pulled via Vercel per `HANDOFF.md`. Never read its contents into a doc. |
| `drizzle.config.ts` | Drizzle Kit config — `db:generate`/`db:push` read `DATABASE_URL`. |
| `.vercel/project.json` | Linked Vercel project (`helm`, team `team_gofGt63nGGecSpDl9hBbsFWm`) — confirms this repo is connected to a real Vercel deployment target. |
| `vitest.config.mts` | Vitest config — currently only exercises `priority/engine.test.ts`. |
| `pnpm-workspace.yaml` | Present but this is a single-package repo in practice; the `.agents/skills/.../templates/nextjs-basic-auth/package.json` picked up by the audit is a **Clerk skill's own bundled example**, not a real workspace member — don't treat it as part of this app. |

## Non-app directories worth knowing about

`.agents/skills/` and `.claude/skills/` hold vendored Clerk/Neon Claude-Code
skills (reference docs + scripts for those tools) — not application code.
Don't attribute their content (README examples, ngrok URLs, `user_xxx`
placeholders) to this project when auditing for secrets or markers.

## Where to make common changes

- **Add a nav page** — new dir under `src/app/(app)/`, add to the sidebar
  config in `src/components/layout/` (exact file not yet catalogued this
  pass — grep for the existing nav array), add `queries/`+`actions/` files
  if it needs its own data.
- **Add a work-item field** — `src/lib/db/schema.ts` (`workItems` table) →
  `drizzle-kit generate`/`db:push` → `src/lib/validation/` Zod schema →
  `src/lib/actions/work-items.ts` → `WorkItemFormDialog`.
- **Change the priority formula** — `src/lib/priority/engine.ts`, then run
  `pnpm test` (the 22 fixtures are the regression guard).
- **Change theme/accent/background** — `src/components/theme/`
  (`accent-provider.tsx`, `background-provider.tsx`) + `src/app/globals.css`
  tokens. See `UI_SYSTEM.md`.
- **Add an env var** — `.env.example` (name + empty value) and read it in
  the relevant `src/lib/*` module; never commit a real value.
- **Add a DB table** — `src/lib/db/schema.ts`, then `pnpm db:generate` (or
  `pnpm db:push` for no-migration-history dev iteration).
