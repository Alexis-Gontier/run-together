# Safe Action Library — next-safe-action

## Clients

| File                     | Use when                            |
| ------------------------ | ----------------------------------- |
| `action-client.ts`       | No auth required (login, register)  |
| `auth-action-client.ts`  | User must be logged in → `ctx.user` |
| `admin-action-client.ts` | User must have `role === "admin"`   |

## Error handling

- Unexpected failures → throw `Error` (client receives a generic message, real message is logged server-side)
- Expected business errors → `return { error: "..." }` from the action

## File locations

Actions live next to the route they serve: `{route}/_actions/`.

Shared actions used across multiple routes: `src/lib/actions/`.
