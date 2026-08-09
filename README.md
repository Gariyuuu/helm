# Helm

Personal Command Center / Life OS. One system that collects everything across school,
career, research, projects, learning, health, and personal life — ranks what actually
matters, and answers: **"What should I be doing right now, and why?"**

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui ·
Clerk · Neon Postgres · Drizzle ORM · Vitest

## Getting started

```bash
pnpm install

# 1. Neon Postgres
#    Create a project at https://console.neon.tech, copy the connection string.
# 2. Clerk
#    Create an app at https://dashboard.clerk.com (or run `clerk init` if you have
#    the Clerk CLI), copy the publishable + secret keys.
cp .env.example .env.local
# fill in DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

pnpm db:push      # push the schema to Neon (drizzle-kit push, no migration files yet)
pnpm dev          # http://localhost:3000
```

### Seeding demo data

The seed script needs a target user row. Sign in once first (Clerk auth creates your
`users` row on first visit via `getOrCreateUser`), then find your Clerk user id
(Clerk dashboard → Users, or log it from `getOrCreateUser`), and run:

```bash
SEED_CLERK_ID=user_xxxxxxxx pnpm db:seed
```

Without `SEED_CLERK_ID` the script attaches demo data to a placeholder account —
useful for inspecting the schema, but it won't show up when you sign in.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint (includes `react-hooks/purity` — Next 16's stricter RSC purity rule) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest — currently the priority engine's 22-fixture test suite |
| `pnpm db:generate` | Generate a Drizzle migration from schema changes |
| `pnpm db:push` | Push schema directly to the database (no migration history) |
| `pnpm db:seed` | Seed realistic demo data (see above) |

## Where to go next

Read [ARCHITECTURE.md](./ARCHITECTURE.md) for how the priority engine and data model
work, and [HANDOFF.md](./HANDOFF.md) for exactly what's built vs. stubbed and what the
next build phase should tackle.
