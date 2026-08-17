# DEPLOYMENT.md

## Current status — corrected this pass

`HANDOFF.md` (written 2026-08-11) states "Not deployed to Vercel yet." That
is **outdated**: `.vercel/project.json` shows this repo is linked to a real
Vercel project (`helm`, `projectId: prj_tW9VFro8qj3NVTMe3f9LmUv0yBGA`, team
`team_gofGt63nGGecSpDl9hBbsFWm`), and `https://helm-lovat-theta.vercel.app`
returns HTTP 200 with page title "Helm — Personal Command Center" (curl'd
+ content-verified — not just a status-code check, since vanity `.vercel.app`
domains can collide with unrelated third-party projects, per a documented
false-positive found in the `gariyuuu-web` repo's own project listing).
**`[Needs confirmation]`** whether the authenticated app actually works
end-to-end in production (this pass verified the public landing page only)
and whether the live Neon DB behind it has been seeded (`HANDOFF.md` says
0 rows as of 2026-08-11 — not re-checked this pass, would require a live DB
connection).

## Target

Vercel, auto-deploy from `main` on push (inferred from repo convention —
same pattern as other Clerk+Neon+Drizzle projects in this workspace per
`ARCHITECTURE.md`; not independently confirmed by triggering a deploy this
pass).

## Environment variables required in production

From `.env.example` (names only): `DATABASE_URL`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`,
`NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL`,
`NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL`, `AI_PROVIDER` (optional,
`none` disables AI), `AI_API_KEY` (optional), `RESEND_API_KEY` (optional,
unused).

## Build

`pnpm build` (`next build`). Not run this pass (writes to `.next/`, needs
the user's go-ahead per this documentation pass's rules).

## Database migrations in production

No migration files exist yet — schema changes go via `pnpm db:push`
(`drizzle-kit push`), which pushes the current `schema.ts` directly with no
migration history. `pnpm db:generate` exists for when that changes.
`drizzle-kit` does not read `.env.local` automatically — `source .env.local`
(or `set -a && source .env.local && set +a`) into the shell first, per
`HANDOFF.md`.

## Rollback

Not exercised this pass. Standard Vercel mechanisms apply: redeploy a
previous deployment from the Vercel dashboard/CLI. No project-specific
rollback script exists in `package.json`.

## Post-deploy verification

Minimal, informal so far — `HANDOFF.md`'s method was manual Playwright
click-through against a throwaway Clerk user. No automated post-deploy
smoke test exists. See `TESTING.md`'s manual checklist as a starting point
for one.

## CI/CD

None — `audit_repo.sh`'s CI/workflow scan found nothing. No GitHub Actions,
no pre-deploy test gate. A push to `main` (if auto-deploy is indeed
configured, per "Target" above) would ship straight to production with no
automated check in between.
