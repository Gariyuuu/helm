# SECURITY_REVIEW.md

Named `SECURITY_REVIEW.md`, not `SECURITY.md`, because **this repository is
public** (`github.com/Gariyuuu/helm`, confirmed via `gh repo view` →
`isPrivate: false`) — a root `SECURITY.md` has a GitHub-reserved
vulnerability-reporting meaning, and this file's findings are kept at a
level safe to publish (no itemized exploitation roadmap). Defensive review
only; no destructive or intrusive testing performed.

## Why this matters more than average

Helm stores real personal data across school, career, health, finance, and
relationships verticals — more sensitive than a typical demo app, even
though it's single-user-per-account. Treat auth/authorization bugs here as
high severity by default.

## Authentication

Clerk (`@clerk/nextjs`). `src/proxy.ts` (Next.js 16's `middleware.ts`
successor) gates every route except `/`, `/sign-in(.*)`, `/sign-up(.*)` —
verified by reading the file directly, `2026-08-17`.

## Authorization

Every server action spot-checked this pass (`work-items.ts`, `settings.ts`)
calls `requireUser()` and scopes both writes and reads by `userId` (e.g.
`and(eq(workItems.id, id), eq(workItems.userId, user.id))` on update/delete
paths) — matches `ARCHITECTURE.md`'s claim that authorization is enforced
per-action, not just at the proxy layer, per Next's own guidance to never
rely on middleware alone. **Not exhaustively re-verified across all 13
action files** this pass — the 2 checked are consistent, but a systematic
audit of every action file (confirming none skip the `userId` scope on a
read or write) is still open. `[Needs confirmation]`.

## Secrets handling

- `.env.local` (real Neon + Clerk credentials) is gitignored;
  `git log --all -- .env.local` was not re-run this pass, but no secret-
  shaped values were found by `verify_docs.py --secrets` across the memory
  docs, and `.env.example` holds only empty placeholders.
- **Real env vars used by the app** (confirmed via grep of `src/`, not
  trusting the audit script's repo-wide grep, which also picks up vendored
  Clerk-skill reference docs under `.agents/skills/` that are not part of
  this app): `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`,
  `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, the two force-redirect URL vars,
  `AI_PROVIDER`/`AI_API_KEY` (unused — see `src/lib/ai/provider.ts`),
  `RESEND_API_KEY` (unused, later phase), plus seed-script-only
  `SEED_CLERK_ID`/`SEED_EMAIL`.
- `CLERK_JWT_KEY`, `CLERK_PEM_PUBLIC_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`,
  `SLACK_WEBHOOK_URL` appeared in the raw audit's env-var grep but are
  **not referenced anywhere in `src/`** (confirmed) — they come from the
  vendored `.agents/skills/clerk-*` reference docs, not this app. No
  webhook route exists (`src/app/api/` doesn't exist at all).
- Client-exposed vars: only the `NEXT_PUBLIC_*` Clerk config above — no
  secret riding along on the `NEXT_PUBLIC_` prefix, per direct reading of
  `.env.example`.

## Input validation

`src/lib/validation/` holds Zod schemas shared by actions and forms, per
`ARCHITECTURE.md`. Not independently re-verified schema-by-schema this
pass.

## Rate limiting

None found or claimed anywhere in the docs or code searched this pass. For
a single-tenant personal app behind Clerk auth this is a lower-severity gap
than on `gariyuuu-web`'s public chat demo, but sign-in/sign-up themselves
rely on Clerk's own bot protection (Cloudflare Turnstile, confirmed
indirectly — `HANDOFF.md` describes routing around it via the Backend API
for automated testing), not anything this app implements itself.

## Known gaps (docs-only findings, not fixed by this pass)

- Authorization scoping not exhaustively re-verified across all 13
  `src/lib/actions/*.ts` files (see above).
- `UI_SYSTEM.md`'s claim that uploaded background images stay on-device and
  are never sent anywhere is sourced from `patch-notes.ts` copy, not from
  reading `background-provider.tsx`'s actual upload code — worth a direct
  check before treating it as fully verified, since it's a real privacy
  claim.
- No CI (`audit_repo.sh` found none) — no automated security or dependency
  scanning on push.

## What this pass did not do

Did not attempt to log in, did not exercise any authenticated flow, did not
review Clerk dashboard configuration, did not run a dependency
vulnerability scan (e.g. `pnpm audit`) — would write to/read from
live/external systems beyond a docs pass's scope without the user's
go-ahead.
