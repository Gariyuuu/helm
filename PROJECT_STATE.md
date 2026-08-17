# PROJECT_STATE.md

Audit timestamp: 2026-08-17, by a repo-memory init pass (documentation
only, no code touched).

Current task: **T-001** (blocked: needs user confirmation) — see
`TASKS.md`.

## Snapshot

- **Repo**: `~/Projects/helm`, remote `github.com/Gariyuuu/helm`
  (**public**, confirmed via `gh repo view`), branch `main`, up to date
  with `origin/main`, working tree **clean**.
- **Latest commit**: `bce8248` (2026-08-13) "chore: add Claude Code skill
  configs" — a docs/tooling commit (vendored `.agents/skills/`), not
  application work. Last real feature commit: `fcbbd7b` (2026-08-12)
  "Make accent color pervasive and add custom background images".
- **9 commits total** on `main`: scaffold (Phase 1+2) → build out every
  nav vertical + command-palette fix → toasts/empty-states/headers →
  safeQuery error wrapping → dark mode + skeletons → accent themes +
  Patch Notes page → accent-everywhere + custom backgrounds → skill
  config chore.

## What's actually built — see FEATURES.md for the full breakdown

Short version: every sidebar nav destination is a real page with real
queries/actions/UI (confirmed by directory listing, not just trusting
`HANDOFF.md`'s claim). Priority engine is unit-tested and real. Several
DB tables (`habits`, `notifications`, `daily_reviews`, `ai_summaries`,
`notes`/`links`/`attachments`) are schema-only with no UI — see
`FEATURES.md` and `DATABASE.md`.

## Correction found this pass: deployment status

`HANDOFF.md` (2026-08-11) says "Not deployed to Vercel yet." **That's
outdated.** `.vercel/project.json` links this repo to a real Vercel
project, and `https://helm-lovat-theta.vercel.app` returns HTTP 200 with
page title "Helm — Personal Command Center" (curl'd + content-verified,
2026-08-17 — a plain 200 isn't sufficient proof by itself, per a real
false-positive the `gariyuuu-web` repo's own docs found with vanity
`.vercel.app` domains colliding with unrelated third-party sites; this one
was content-checked, not just status-checked). **`[Needs confirmation]`**:
whether the live DB has been seeded (`HANDOFF.md` said 0 rows as of
2026-08-11 — not re-checked this pass, would need a live DB connection),
and whether `main` actually auto-deploys on push or was deployed manually
once.

## Undocumented gap found this pass: `habits` table

`schema.ts` defines a `habits` table. Grepped `src/lib/queries/`,
`src/lib/actions/`, and `src/components/` for any reference — **zero
hits**. Not mentioned in `HANDOFF.md`'s "not built yet" list either
(everything else schema-only there — notifications, daily_reviews,
ai_summaries, notes/links/attachments — is at least *named* as a known
gap). This one wasn't. `[Needs confirmation]`: was Habits meant to ship in
this batch and got dropped, or never started?

## What this pass did NOT verify

- Did not run `pnpm typecheck`/`lint`/`test`/`build` (writes to the tree —
  needs the user's go-ahead first).
- Did not sign in to the live app or exercise any authenticated flow.
- Did not connect to the live Neon DB (row counts, actual schema-vs-code
  drift).
- Did not exhaustively re-audit all 13 `src/lib/actions/*.ts` files for
  authorization scoping — 2 were spot-checked and matched
  `ARCHITECTURE.md`'s claim. See `SECURITY_REVIEW.md`.

## Next three recommended actions

1. Get the user's confirmation on the two `[Needs confirmation]` items
   above (`habits` table fate, live-deploy/seed status) — they change what
   the next dev session should prioritize.
2. With the user's go-ahead, run `pnpm typecheck && pnpm lint && pnpm test`
   and record results in `TESTING.md`.
3. Pick up `ROADMAP.md`'s near-term list (daily review flow or
   notifications are the suggested next picks per `HANDOFF.md`).
