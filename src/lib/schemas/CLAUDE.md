# Schemas — Zod Validation

## Conventions

- All validation messages in **French**
- Always export the inferred type alongside the schema: `export type MyType = z.infer<typeof mySchema>`
- **Zod v4**: use `z.email()` standalone — not `z.string().email()`
- Forms: use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` (not `@hookform/resolvers/zod`)

## Global schemas (`src/lib/schemas/`)

| File              | Key exports                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-schema.ts`  | `usernameSchema`, `passwordSchema`, `signUpSchema`, `signInSchema`, `changePasswordSchema`, `onboardingDisplayNameSchema`, `onboardingEmailSchema`                  |
| `admin-schema.ts` | `banUserSchema`, `unbanUserSchema`, `deleteUserSchema`, `setRoleSchema`, `impersonateUserSchema`, `createUserSchema`, `setOnboardingSchema`, `revokeSessionsSchema` |

## Route-local schemas (`{route}/_schemas/`)

| Route         | Schema              | Notable fields                                                           |
| ------------- | ------------------- | ------------------------------------------------------------------------ |
| `home`        | `feedSchema`        | `cursor?`, `limit` (1–50, default 20)                                    |
| `leaderboard` | `leaderboardSchema` | `metric` (distance\|runs\|pace), `period` (week\|month\|3m\|6m\|1y\|all) |
| `progress`    | `progressSchema`    | `period` (3m\|6m\|1y\|all, default "3m")                                 |
