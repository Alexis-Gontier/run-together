---
name: new-route
description: Scaffold a new route following the project's conventions — page, action, schema, component
---

Scaffold a new route for this Next.js project. The route name and purpose are: $ARGUMENTS

## Steps

1. **Determine the route group** based on the purpose:
   - `(app)` — requires authentication (`getRequiredUser()`, `authActionClient`)
   - `(admin)` — requires admin role (`getRequiredAdmin()`, `adminActionClient`)
   - `(auth)` — public (login/register style, `actionClient`)
   - `(onboarding)` — post-signup flow (`authActionClient`)

2. **Create `src/app/(group)/{route}/page.tsx`**
   - Server Component (no `"use client"`)
   - Call `getRequiredUser()` or `getRequiredAdmin()` at the top (for protected routes)
   - Import `ROUTES.*` from `@/lib/constants/routes` — never hardcode paths
   - Keep it thin: delegate rendering to `_components/`

3. **Create `src/app/(group)/{route}/_actions/{verb}-{noun}-action.ts`** if the route needs data fetching or mutations
   - `"use server"` at the top
   - Use the correct client: `authActionClient` / `adminActionClient` / `actionClient`
   - Input validated via `.inputSchema(schema)` — import schema from `_schemas/` or `@/lib/schemas/`
   - Expected business errors → `return { error: "..." }` (in French)
   - Unexpected errors → throw `Error` (generic message shown to client)

4. **Create `src/app/(group)/{route}/_schemas/{noun}-schema.ts`** if the action needs input validation
   - Zod v4: use `z.email()` standalone, not `z.string().email()`
   - All validation messages in French
   - Export the schema AND its inferred type: `export type MyType = z.infer<typeof mySchema>`

5. **Create `src/app/(group)/{route}/_components/{noun}-component.tsx`** if the route needs interactive UI
   - `"use client"` at the top
   - Forms: use `standardSchemaResolver` from `@hookform/resolvers/standard-schema`
   - Submit button: use `<LoadingButton isLoading={...}>` from `@/components/ui/loading-button`
   - Action hook: `useAction(myAction, { onError, onSuccess })` from `next-safe-action/hooks`
   - Toast errors: `toast.error(error.serverError ?? "Une erreur est survenue.")`

6. **Add the route constant** to `src/lib/constants/routes.ts` if this is a top-level route:
   - Add to the `ROUTES` object
   - Add a label to `ROUTE_LABELS` if it should appear in navigation

## Key imports reference

```ts
// Auth helpers (server)
import { getRequiredUser, getRequiredAdmin } from "@/lib/auth/auth-session"

// Action clients
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"
import { actionClient } from "@/lib/safe-action/action-client"

// Routes
import { ROUTES } from "@/lib/constants/routes"

// Forms (client)
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useAction } from "next-safe-action/hooks"
import { LoadingButton } from "@/components/ui/loading-button"
```
