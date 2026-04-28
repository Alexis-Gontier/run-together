# Auth Library — better-auth

## Files

| File              | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `index.ts`        | `auth` — server-side instance (server code only)       |
| `auth-client.ts`  | `authClient` — browser client (client components only) |
| `auth-session.ts` | Session helpers — Server Components and actions        |

## Session helpers (`auth-session.ts`)

- `getUser()` — returns `user | null` (auth optional)
- `getRequiredUser()` — returns `user` or redirects to `/unauthorized`
- `getRequiredAdmin()` — returns `user` or redirects to `/forbidden` (role === "admin" required)

## Calling Auth API in Server Actions

better-auth requires the incoming request headers to be forwarded — forgetting this breaks session handling:

```ts
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

await auth.api.signInUsername({ body: { ... }, headers: await headers() })
```

## Configuration

- Sign-in: username + password (not email)
- Sign-up: disabled in production (`NODE_ENV !== "development"`)
- Rate limit: 5 attempts / 60 s
- Session TTL: 365 days, cookie cache 5 min
- Plugins: `username()`, `admin()`, `nextCookies()`

## Roles

- `"user"` — default
- `"admin"` — access to `(admin)` routes, can impersonate / ban / manage users

Impersonation is tracked via `Session.impersonatedBy`. `ImpersonationBanner` renders when active.

## Owned DB tables — never modify columns manually

`User`, `Session`, `Account`, `Verification`

Extra `User` fields: `username`, `displayUsername`, `onboardingCompleted`, `role`, `banned`, `banReason`, `banExpires`
Extra `Session` field: `impersonatedBy`
