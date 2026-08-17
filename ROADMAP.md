# ROADMAP.md

Sourced from `HANDOFF.md`'s "not built yet" and "suggested next session"
lists, plus gaps this pass found independently. No invented time estimates
— the repo's docs don't contain any, so none are given here.

## Near-term (per HANDOFF.md's own suggested next session)

- **Daily review flow** — `daily_reviews` table exists, no UI. Same shape
  as the already-built Weekly Review.
- **Notifications** — `notifications` table exists, nothing writes to it.
- **Natural-language quick capture** for Inbox (currently structured-form
  only, no NLP extraction).
- **Wire `goal_relationships`** so Goals rolls up linked project/task
  progress automatically instead of manual tracking.

## Also open (schema exists, no UI — found by this pass)

- **`habits`** table — no query/action/UI layer at all, and not mentioned
  in `HANDOFF.md`'s own gap list either. Genuinely undocumented until this
  pass. Worth asking the user whether Habits was meant to ship and got
  dropped, or was never started.
- **`notes` / `links` / `attachments`** — schema exists, no UI.
- **`ai_summaries`** — blocked on Phase 7 (real AI provider).

## Deliberately out of scope (per HANDOFF.md)

Real AI features (provider abstraction exists as a no-op, meant to connect
to the separate in-workspace `ai-platform` project later), PWA/mobile
install, bulk import, dependency-graph visualization, decision-comparison
tool, cut list, context-switching analysis, recurring-event/task expansion
(`recurring_rule` columns are stored but never expanded into instances).

## Infra / process gaps (found this pass, not feature work)

- No CI — no automated lint/typecheck/test gate on push.
- No E2E test suite (only the priority engine's unit tests exist) — see
  `TESTING.md`'s manual checklist as a starting point.
- Production deploy status was undocumented/stale (see `DEPLOYMENT.md`) —
  now corrected, but nothing currently re-verifies "is prod actually up"
  automatically.

## Out of scope for this documentation pass itself

Everything above is a queue for future *development* sessions — this pass
did not build, fix, or change any of it. See `TASKS.md` for what a
documentation-focused session actually did.
