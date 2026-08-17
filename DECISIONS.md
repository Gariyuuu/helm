# DECISIONS.md

Reconstructed from `HANDOFF.md`/`ARCHITECTURE.md`/git history by this
documentation pass — decisions and their observable consequences are
`[Verified]`; the *why* is `[Inferred]` unless a doc states it directly.

## D-001 — Domain-scoped life areas reuse `work_items`, not dedicated tables

**Decision**: Personal, Health, Finance, and Relationships have no
dedicated tables. They're `life_domains` rows + `work_items` filtered by
`domain_id`, rendered through one shared component
(`src/components/domain/domain-work-view.tsx`).

**Reasoning** `[Inferred, but directly stated in ARCHITECTURE.md]`: the
project's underlying spec models `work_items` as the universal actionable
object; giving each life area its own schema would duplicate the CRUD/
priority/UI machinery for no functional gain.

**Consequences**: adding a new life-domain-style vertical is cheap (a slug
+ a filtered view), but any feature that needs domain-specific fields
(e.g. a Finance-only "amount" field) would require either overloading
`work_items` further or breaking this pattern for that one domain — not
yet needed, not yet tested.

**Status**: active, unchanged since introduction.

## D-002 — Fixed the command palette crash by wrapping children in `<Command>`

**Decision**: `src/components/ui/command.tsx`'s `CommandDialog` rendered
`{children}` directly inside `DialogContent` instead of inside `<Command>`,
so `cmdk`'s `CommandInput`/`CommandList` had no store context — crashed
with `Cannot read properties of undefined (reading 'subscribe')` on open.
Fixed 2026-08-11 by wrapping children in `<Command>`.

**Reasoning**: `[Verified]` — directly documented in `HANDOFF.md` with the
exact error and root cause, verified fixed by driving the real quick-add
flow via Playwright against a throwaway Clerk-authenticated session.

**Status**: fixed, verified working as of 2026-08-11.

## D-003 — Priority scores computed on read, never cached

**Decision**: `work_items.priority_score` exists as a schema column but
every read path recomputes the score live from `computePriority()` rather
than reading/writing that column.

**Reasoning** `[Inferred from ARCHITECTURE.md]`: avoids a staleness/
invalidation problem entirely — the column is reserved for a future SQL-
level sort optimization once row counts justify it, not because caching
was tried and rejected.

**Status**: active.

## D-004 — AI features live behind a swappable no-op provider interface

**Decision**: `src/lib/ai/provider.ts` defines an `AiProvider` interface;
`getAiProvider()` currently always returns `NoopAiProvider`. Every AI call
site in the app goes through this seam.

**Reasoning** `[Verified — stated in the file's own doc comment]`: intended
to connect to a separate in-workspace `ai-platform` project later without
touching call sites.

**Status**: interface built, no real provider wired yet — Phase 7 per the
master spec's build order (referenced in `HANDOFF.md`, spec doc itself not
located/read by this pass).

## D-005 — `work_items.type` is a Zod enum, not a Postgres enum

**Decision**: unlike `work_item_status`/`project_status`/etc. (real
`pgEnum`s), the item-type vocabulary (assignment, exam, errand, trip,
habit, ...) is validated at the app layer only.

**Reasoning** `[Inferred from ARCHITECTURE.md's stated rationale]`: the
type vocabulary is expected to keep growing as new life-domain content
types get added; a Postgres enum would need a migration per new value.

**Status**: active.

## Rejected alternatives

None documented in the repo's existing docs or git history as of this
pass — `[Unknown]` whether any were considered and discarded before this
was written up. Future sessions: populate this section when a real
alternative gets proposed and turned down, so it isn't re-proposed.
