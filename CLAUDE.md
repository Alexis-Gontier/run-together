# Run Together — Project Overview

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, `authInterrupts` enabled)
- **Database**: PostgreSQL via Prisma v7 + `@prisma/adapter-pg` — driver adapter is required, see `src/lib/db/`
- **Auth**: better-auth v1 (username + admin plugins) → @src/lib/auth/CLAUDE.md
- **Server Actions**: next-safe-action v8 → @src/lib/safe-action/CLAUDE.md
- **Forms**: React Hook Form + Zod v4 + `standardSchemaResolver` → @src/lib/schemas/CLAUDE.md
- **UI**: shadcn/ui + Tailwind CSS v4 ; maps via mapcn (MapLibre GL, free CARTO vector basemaps, light/dark) — `src/components/ui/run-map.tsx`, SVG thumbnails in lists (`route-thumbnail.tsx`)
- **Badges**: catalog in code, `UserBadge` table, evaluated by `recordRun` → @src/lib/badges/CLAUDE.md
- **Stats**: week summary, highlights, streaks, milestones for the right panels → `src/lib/stats/`
- **State**: Zustand (onboarding flow), nuqs (URL query params)
- **Runs**: source-agnostic pipeline (`recordRun`), personal records, GPX/FIT parsing → @src/lib/runs/CLAUDE.md
- **Strava integration** (disabled by `STRAVA_ENABLED=false`): OAuth 2 + webhook + auto token refresh → @src/lib/strava/CLAUDE.md
- **Discord notifications**: rich run embeds, badges, welcome, weekly recap (Vercel Cron), delivery log + admin resend (`/admin/discord`) → @src/lib/discord/CLAUDE.md
- **Run formatting utils**: pace, distance, duration, dates → @src/lib/utils/CLAUDE.md
- **Tooling**: Node 24 (`.nvmrc`), pnpm 11, Biome, lefthook, knip, Vitest, React Compiler. Claude Code config in `.claude/` (see `.claude/SKILLS.md`)
- **Env validation**: `@t3-oss/env-nextjs` — never use `process.env` directly, always go through `src/env.ts`

## Route Groups

```
src/app/
├── (app)/         # Protected — auth required
│   └── @rightPanel/  # Parallel route slot (right panel)
├── (admin)/       # Protected — role === "admin" required
├── (auth)/        # Public (login, register)
├── (onboarding)/  # Post-signup onboarding flow
└── api/           # auth/[...all], strava/* (404 unless STRAVA_ENABLED), og/run/[runId], cron/weekly-recap, export
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

**shadcn** — `pnpm dlx shadcn@latest add <x>` (registries: `@mapcn`; answer « no » to overwrite prompts: `yes n | pnpm dlx …`). Recent registry items import `cn` from the `cn` npm package: rewrite to `@/lib/utils/cn` and `pnpm remove cn` afterwards.

**Routing** — use `ROUTES.*` / `AUTH_ROUTES.*` / `ADMIN_ROUTES.*` / `API_ROUTES.*` from `src/lib/constants/routes.ts`. Helper functions: `runRoute(id)`, `profileRoute(username)`. Never hardcode paths.

**Prisma** — use the singleton in `src/lib/db/`. Never instantiate `PrismaClient` elsewhere. Schema: `prisma/schema.prisma`. Generated client: `src/generated/prisma/`.

**Env vars** — add to `src/env.ts`. Server-only → `server` block. Client-exposed → `client` block (prefix `NEXT_PUBLIC_`).

**Commits** — conventional commits enforced by commitlint via lefthook: `feat | fix | chore | refactor | docs | style | test | perf | ci` (body lines ≤ 100 chars). Pre-commit runs `biome check --write` on staged files; pre-push runs `typecheck`, `test` and `knip`.

**Strava** — the Strava API app is **inactive** since 2026-08-19. No run arrives through Strava; do not debug import failures as code bugs. Manual entry + GPX/FIT import (`/runs/new`) replace it; the whole integration is behind `STRAVA_ENABLED` (default `false`).

## Scripts

| Script             | Purpose                               |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Start dev server (Turbopack)          |
| `pnpm build`       | Production build                      |
| `pnpm lint`        | Biome lint + format check             |
| `pnpm lint:fix`    | Biome with safe fixes                 |
| `pnpm format`      | Biome format write                    |
| `pnpm typecheck`   | `next typegen` + `tsc --noEmit`       |
| `pnpm test`        | Vitest (colocated `src/**/*.test.ts`) |
| `pnpm knip`        | Dead code / dependencies              |
| `pnpm db:migrate`  | Create + apply migration (dev)        |
| `pnpm db:push`     | Push schema without migration file    |
| `pnpm db:studio`   | Open Prisma Studio                    |
| `pnpm db:seed`     | Seed the database                     |
| `pnpm db:generate` | Regenerate Prisma client              |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
