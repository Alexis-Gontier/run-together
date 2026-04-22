# Schemas — Zod Validation

## Conventions

- **One file per domain**: `auth-schema.ts`, `profile-schema.ts`, etc.
- **French validation messages** — keep all error strings in French.
- **Always export the inferred type** alongside the schema:
  ```ts
  export const mySchema = z.object({ ... })
  export type MyType = z.infer<typeof mySchema>
  ```
- **Reuse primitive schemas** — define field-level schemas (e.g. `usernameSchema`, `passwordSchema`) and compose them into form schemas.

## Zod v4 Specifics

This project uses **Zod v4**. Key API differences from v3:

- `z.email()` — standalone (not `z.string().email()`)
- `z.string().min(n, "message")` — same as v3

## Integration with Forms

Import the schema and its type in the form component:

```ts
import { mySchema, type MyType } from "@/lib/schemas/my-schema"
```

Use `standardSchemaResolver` (required — see root CLAUDE.md):

```ts
const form = useForm<MyType>({
  resolver: standardSchemaResolver(mySchema),
})
```

## Integration with Server Actions

Pass the schema directly to `.inputSchema()`:

```ts
import { mySchema } from "@/lib/schemas/my-schema"

export const myAction = actionClient
  .inputSchema(mySchema)
  .action(async ({ parsedInput }) => { ... })
```

## Current Schemas

| File             | Exports                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `auth-schema.ts` | `usernameSchema`, `nameSchema`, `emailSchema`, `passwordSchema`, `signUpSchema`, `signInSchema`, `SignUpType`, `SignInType` |
