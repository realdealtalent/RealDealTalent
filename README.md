# Real Deal Talent

Internal pipeline management tool for a solo recruiting operator. Tracks companies from discovery through signing, manages BD outreach, and organizes the full placement lifecycle.

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **API:** Hono (mounted on Next.js API routes)
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Auth:** JWT-based session cookies (Entra ID planned for v1)
- **Styling:** Tailwind CSS
- **Testing:** Vitest

## Getting started

```sh
# Install dependencies
pnpm install

# Copy env and fill in values
cp .env.example .env.local

# Push schema to database
pnpm drizzle-kit push

# Seed lost reasons
pnpm tsx src/db/seed-lost-reasons.ts

# Start dev server
pnpm dev
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm drizzle-kit generate` | Generate a migration from schema changes |
| `pnpm drizzle-kit migrate` | Apply pending migrations |
| `pnpm drizzle-kit push` | Push schema directly (dev) |
| `pnpm drizzle-kit studio` | Open Drizzle Studio GUI |

## Project structure

```
src/
  app/                  Next.js pages and layouts
    admin/              Pipeline board, company detail
    api/[[...route]]/   Hono API routes
  db/                   Drizzle schema, migrations, seeds
  lib/                  Auth, pipeline engine, shared logic
  __tests__/            Unit and integration tests
docs/
  adr/                  Architecture decision records
  agents/               Agent protocol docs
drizzle/                SQL migration files
```

## Domain docs

- `CONTEXT.md` — domain glossary and entity definitions
- `docs/adr/` — architecture decision records
