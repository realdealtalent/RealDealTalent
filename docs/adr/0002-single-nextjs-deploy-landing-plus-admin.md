# ADR 0002: Single Next.js deploy for landing page and admin app

## Status
Accepted

## Context
The project has two surfaces: a public static landing page and an authenticated admin app. The landing page is currently plain HTML served from `index.html`. The admin app will be a Next.js application with Hono API routes, Neon Postgres, and Auth.js.

Options considered:
1. Single deploy — Next.js serves both the landing page (as a page component at `/`) and the admin app (at `/admin`).
2. Separate deploys — static landing page stays as-is, Next.js admin app deployed separately (subdomain or path).

## Decision
Single Next.js deploy. When the Next.js app is built during v0 spike, the static landing page HTML is ported into a Next.js page component at `/`. The logo click triggers Entra ID login, and authenticated users are routed to `/admin`. The existing Vite/React app and static `index.html` are replaced entirely.

## Consequences
- One repo, one build, one deploy. No cross-origin issues between landing page and admin app.
- The existing Vite + React infrastructure (package.json dependencies, vite.config.ts, src/ directory) will be replaced by the Next.js project structure.
- Landing page benefits from Next.js optimizations (image optimization, preloading) for free.
- The landing page is no longer independently deployable — any deploy ships both surfaces. Acceptable for a single-operator tool.
