# Safe Action Library — next-safe-action

## Files

| File                    | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `action-client.ts`      | Base client — public actions               |
| `auth-action-client.ts` | Auth-protected client — injects `ctx.user` |

## Which Client to Use

```ts
import { actionClient } from "@/lib/safe-action/action-client"
// → for actions that don't require authentication

import { authActionClient } from "@/lib/safe-action/auth-action-client"
// → for actions that require a logged-in user
//   ctx.user is automatically available in the action handler
```

## Creating an Action

```ts
"use server"
import { actionClient } from "@/lib/safe-action/action-client"
import { mySchema } from "@/lib/schemas/my-schema"

export const myAction = actionClient
  .inputSchema(mySchema)
  .action(async ({ parsedInput: { field1, field2 } }) => {
    // server logic
  })
```

For protected actions, use `authActionClient` and access the user from context:

```ts
export const myProtectedAction = authActionClient
  .inputSchema(mySchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // user is guaranteed to be authenticated
  })
```

## Error Handling

- The base client catches all thrown errors and returns a generic `"An unexpected error occurred."` message to the client (logged server-side).
- Throw a plain `Error` for unexpected failures — the client never sees the real message.
- Use the action return value for expected business errors (e.g. `return { error: "Username already taken" }`).

## Consuming Actions in Client Components

```ts
import { useAction } from "next-safe-action/hooks"

const { execute, isPending } = useAction(myAction, {
  onError: ({ error }) =>
    toast.error(error.serverError ?? "Une erreur est survenue."),
  onSuccess: () => {
    /* ... */
  },
})
```

## File Location Convention

Actions live next to the route they serve:

```
src/app/(auth)/login/_actions/login-action.ts
src/app/(app)/profile/_actions/update-profile-action.ts
```
