# Run Together — Project Overview

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, `authInterrupts` enabled)
- **Database**: PostgreSQL via Prisma v7 + `@prisma/adapter-pg` — driver adapter is required, see `src/lib/db/`
- **Auth**: better-auth v1 (username + admin plugins) → @src/lib/auth/CLAUDE.md
- **Server Actions**: next-safe-action v8 → @src/lib/safe-action/CLAUDE.md
- **Forms**: React Hook Form + Zod v4 + `standardSchemaResolver` → @src/lib/schemas/CLAUDE.md
- **UI**: shadcn/ui + Tailwind CSS v4
- **State**: Zustand (onboarding flow), nuqs (URL query params)
- **Strava integration**: OAuth 2 + webhook + auto token refresh → @src/lib/strava/CLAUDE.md
- **Discord notifications**: run import events → @src/lib/discord/CLAUDE.md
- **Run formatting utils**: pace, distance, duration, dates → @src/lib/utils/CLAUDE.md
- **Env validation**: `@t3-oss/env-nextjs` — never use `process.env` directly, always go through `src/env.ts`

## Route Groups

```
src/app/
├── (app)/         # Protected — auth required
│   └── @rightPanel/  # Parallel route slot (right panel)
├── (admin)/       # Protected — role === "admin" required
├── (auth)/        # Public (login, register)
├── (onboarding)/  # Post-signup onboarding flow
└── api/           # auth/[...all], strava/*, runs/[id]/gpx, og/run/[runId]
```

Each route follows:

```
{route}/
├── _actions/    # "use server"
├── _components/ # "use client"
├── _schemas/    # Route-local Zod schemas
├── _utils/      # Route-local utilities
└── page.tsx
```

Shared actions used across multiple routes live in `src/lib/actions/`.

## Critical Conventions

**Forms** — always use `standardSchemaResolver` from `@hookform/resolvers/standard-schema`. Zod v4 is incompatible with the `@hookform/resolvers/zod` typed overloads.

**Routing** — use `ROUTES.*` / `AUTH_ROUTES.*` / `ADMIN_ROUTES.*` / `API_ROUTES.*` from `src/lib/constants/routes.ts`. Helper functions: `runRoute(id)`, `profileRoute(username)`. Never hardcode paths.

**Prisma** — use the singleton in `src/lib/db/`. Never instantiate `PrismaClient` elsewhere. Schema: `prisma/schema.prisma`. Generated client: `src/generated/prisma/`.

**Env vars** — add to `src/env.ts`. Server-only → `server` block. Client-exposed → `client` block (prefix `NEXT_PUBLIC_`).

**Commits** — conventional commits enforced by commitlint + husky: `feat | fix | chore | refactor | docs | style | test | perf | ci`. Pre-commit hook runs ESLint --fix + Prettier automatically.

## Scripts

| Script             | Purpose                            |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start dev server (Turbopack)       |
| `pnpm build`       | Production build                   |
| `pnpm lint`        | ESLint                             |
| `pnpm format`      | Prettier write                     |
| `pnpm db:migrate`  | Create + apply migration (dev)     |
| `pnpm db:push`     | Push schema without migration file |
| `pnpm db:studio`   | Open Prisma Studio                 |
| `pnpm db:seed`     | Seed the database                  |
| `pnpm db:generate` | Regenerate Prisma client           |
