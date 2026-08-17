# UI_SYSTEM.md

## Stack

Tailwind CSS 4 + shadcn/ui (`radix-nova` style, per `components.json`) +
`radix-ui` primitives + `lucide-react` icons + `sonner` for toasts +
`framer-motion` for animation + `recharts` (used by Insights) +
`next-themes` for light/dark.

## Design tokens

`src/app/globals.css` defines the token set in **OKLCH** color space (e.g.
`--background: oklch(1 0 0)`), mapped to Tailwind's `--color-*` variables
and a `--radius` scale (`--radius-sm` through `--radius-4xl`, all derived
from one base `--radius` via `calc()`). Edit tokens here, not per-component,
to change the base theme.

## Accent color (6 themes)

`src/lib/accent-themes.ts` (not yet read line-by-line this pass — holds
`DEFAULT_ACCENT`, `ACCENT_STORAGE_KEY`, and the 6 theme definitions per
`patch-notes.ts`: Default, Ocean, Forest, Sunset, Berry, Violet).
`src/components/theme/accent-provider.tsx` applies the choice as a
`data-accent` attribute on `<html>`, persisted to `localStorage`
(`ACCENT_STORAGE_KEY`), picked from a radial "theme wheel" in Settings.
Applies instantly, independent of light/dark mode.

**Hydration pattern**: both `AccentProvider` and `background-provider.tsx`
start at the default value on server and first client render (so hydration
always matches), then read `localStorage` in a mount-only `useEffect` and
sync state — the same tradeoff `next-themes` makes. Each has an inline
`eslint-disable react-hooks/set-state-in-effect` with a comment explaining
why; don't "fix" that lint suppression without understanding this pattern
first, or you'll reintroduce a hydration mismatch.

## Custom backgrounds

Settings has 4 gradient presets that auto-match the current accent, or a
user-uploaded image. Uploads are resized/compressed **client-side** and
kept **on-device only** (per `patch-notes.ts` 0.6.0 — "nothing is sent
anywhere"); this is a real, load-bearing privacy property if true — not
independently re-verified against `background-provider.tsx`'s actual
upload-handling code this pass. `[Needs confirmation / spot-check]` before
repeating that claim to a user as fully verified.

## Light/dark mode

Wired via `next-themes` (per `patch-notes.ts` 0.4.0 — "Theme setting
previously saved to the database and did nothing... now actually wired
up"). Applies live, no save required, persists across reloads. Toasts
(`sonner`) match the active theme.

## Layout shell

`src/components/layout/` — sidebar, topbar, mobile nav, command palette.
Per `patch-notes.ts` 0.6.0, sidebar/topbar/mobile nav are translucent with
a blur so the accent-tinted background gradient shows through; page
*content* stays fully opaque.

## Command palette

`cmdk` (`src/components/ui/command.tsx`) + `src/components/layout/command-palette.tsx`.
Had a real bug (`CommandDialog` didn't wrap children in `<Command>`, so
`CommandInput`/`CommandList` had no store context — crashed on open) fixed
during the 2026-08-11 session; see `DECISIONS.md` D-002 and `CHANGELOG.md`.

## Loading / empty states

Route-transition loading skeletons added 2026-08-11 (`patch-notes.ts`
0.4.0). Empty states across the app use an icon instead of bare placeholder
text (`src/lib/patch-notes.ts` references this directly — not independently
re-verified against every empty-state component this pass).

## What this pass did not verify

Did not launch the dev server or visually inspect rendered pages — this is
a static-analysis pass over token/provider source, not a design QA pass.
