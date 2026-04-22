# Auth Library — better-auth

## Files

| File              | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `index.ts`        | Server-side auth instance (`auth`) — server code only       |
| `auth-client.ts`  | Browser-side client (`authClient`) — client components only |
| `auth-session.ts` | Server session helpers — Server Components and actions      |

## Key Exports

### `auth` — server only

Full better-auth instance. Used by the API route handler and server actions.

### `authClient` — client only

Browser client with `usernameClient()` plugin. Use for client-side auth flows.

### Session helpers

```ts
import { getUser, getRequiredUser } from "@/lib/auth/auth-session"

getUser() // Returns user | null — when auth is optional
getRequiredUser() // Returns user or redirects to /unauthorized — protected contexts
```

Both read the cookie-cached session (5-minute cache, compact strategy).

## Calling Auth API Inside Server Actions

Forward the incoming request headers — better-auth requires them:

```ts
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

await auth.api.signInUsername({
  body: { username, password },
  headers: await headers(),
})
```

## Configuration Details

- **Sign-in method**: username + password (not email)
- **Sign-up**: disabled in production (`NODE_ENV !== "development"`)
- **Rate limit**: 5 attempts per 60 s
- **Session TTL**: 365 days, cookie cache max-age 5 min
- **Plugins**: `username()`, `nextCookies()`
- **Adapter**: Prisma with `postgresql` provider

## Owned Database Tables

better-auth manages these — never modify their columns manually:
`User`, `Session`, `Account`, `Verification`

`User` has extra fields from the username plugin: `username`, `displayUsername`.
