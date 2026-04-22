# Run Together — Project Overview

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Database**: PostgreSQL via Prisma v7 + `@prisma/adapter-pg` (driver adapter required)
- **Auth**: better-auth v1 with username plugin → @src/lib/auth/CLAUDE.md
- **Server Actions**: next-safe-action v8 → @src/lib/safe-action/CLAUDE.md
- **Forms**: React Hook Form + Zod v4 + `standardSchemaResolver`
- **Validation schemas**: centralized in `src/lib/schemas/` → @src/lib/schemas/CLAUDE.md
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Env validation**: `@t3-oss/env-nextjs` → `src/env.ts`

## Directory Structure

```
src/
├── app/
│   ├── (app)/              # Protected routes
│   ├── (auth)/             # Login / register
│   │   └── {route}/
│   │       ├── _actions/   # Server actions ("use server")
│   │       ├── _components/ # Client components ("use client")
│   │       └── page.tsx
│   └── api/auth/           # better-auth HTTP handler
├── components/
│   ├── shadcn-ui/          # Raw shadcn base components
│   └── ui/                 # Custom composed components
├── lib/
│   ├── auth/               # better-auth config
│   ├── safe-action/        # action clients
│   ├── schemas/            # Zod schemas (one file per domain)
│   ├── db/                 # Prisma client singleton
│   └── constants/          # Route constants (ROUTES.*)
├── hooks/                  # Custom React hooks
└── providers/              # Context providers
```

## Critical Conventions

### Forms

Always use `standardSchemaResolver` — Zod v4 is incompatible with the typed overloads of `@hookform/resolvers/zod`:

```ts
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
```

### Routing

Use `ROUTES.*` constants from `src/lib/constants/routes.ts` — never hardcode paths.

### Environment Variables

Always add to `src/env.ts` via `@t3-oss/env-nextjs`. Never access `process.env` directly.

- Server-only → `server` block
- Client-exposed → `client` block (must be prefixed `NEXT_PUBLIC_`)

### Prisma

Prisma v7 requires driver adapter. Use the singleton in `src/lib/db/`. Never instantiate `PrismaClient` elsewhere.

- Schema: `prisma/schema.prisma`
- Generated client: `src/generated/prisma/`

### Commits

Conventional commits enforced by commitlint + husky:
`feat | fix | chore | refactor | docs | style | test | perf | ci`

### Code Quality

Pre-commit hook (husky + lint-staged) runs ESLint --fix + Prettier automatically.

## Scripts

| Script            | Purpose                            |
| ----------------- | ---------------------------------- |
| `pnpm dev`        | Start dev server                   |
| `pnpm build`      | Production build                   |
| `pnpm lint`       | ESLint                             |
| `pnpm format`     | Prettier write                     |
| `pnpm db:migrate` | Create + apply migration (dev)     |
| `pnpm db:push`    | Push schema without migration file |
| `pnpm db:studio`  | Open Prisma Studio                 |
| `pnpm db:seed`    | Seed the database                  |
