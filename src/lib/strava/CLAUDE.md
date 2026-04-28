# Strava Library

## Files

| File                          | Purpose                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `constants.ts`                | Base URLs, OAuth paths, API endpoint paths, scopes                 |
| `schemas.ts`                  | Zod schemas for Strava API responses                               |
| `client.ts`                   | `stravaOAuthFetch` (oauth base) and `stravaApiFetch` (api/v3 base) |
| `token.ts`                    | `getValidAccessToken()` — auto-refresh with 60 s grace period      |
| `create-run-from-activity.ts` | Maps a Strava activity + stream → `Run` + `Split[]` shapes         |
| `import-activity.ts`          | `importStravaActivity()` — full import pipeline                    |
| `types.ts`                    | Additional TypeScript types                                        |

## Token management

`getValidAccessToken(account)` — always use this before any Strava API call:

1. Returns current token if valid (60 s grace)
2. Re-fetches from DB to avoid concurrent refresh races
3. Refreshes via `POST /oauth/token` if expired, persists new tokens

## Import pipeline (`importStravaActivity`)

1. Fetch activity detail + GPS stream from Strava API
2. `createRunFromActivity()` maps it to `Run` + `Split[]`
3. Upsert via Prisma transaction (idempotent on `stravaId`)
4. `sendRunNotification()` posts to Discord webhook

## OAuth flow

`GET /api/strava/connect` → Strava → `GET /api/strava/callback`

Disconnect: revokes token via `POST /oauth/deauthorize` (best-effort) then deletes `StravaAccount` record.

## Webhook (`POST /api/strava/webhook`)

- `create` → `importStravaActivity()`
- `update` → update run name/date
- `delete` → delete run by `stravaId`

Verification token: `STRAVA_WEBHOOK_VERIFY_TOKEN` env var.
