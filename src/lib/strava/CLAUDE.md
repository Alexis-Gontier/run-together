# Strava Library

## Files

| File           | Purpose                                                   |
| -------------- | --------------------------------------------------------- |
| `constants.ts` | Base URLs, OAuth paths, API endpoint paths, scopes        |
| `schemas.ts`   | Zod schemas for all Strava API responses                  |
| `client.ts`    | upfetch clients — `stravaOAuthFetch` and `stravaApiFetch` |
| `token.ts`     | `getValidAccessToken()` — refreshes tokens automatically  |

## Clients

### `stravaOAuthFetch`

For all OAuth operations (base URL: `https://www.strava.com/oauth`).

```ts
import { stravaOAuthFetch } from "@/lib/strava/client"
import { stravaOAuthPaths } from "@/lib/strava/constants"
import { stravaTokenRefreshSchema } from "@/lib/strava/schemas"

const data = await stravaOAuthFetch(stravaOAuthPaths.token, {
  method: "POST",
  body: {
    client_id,
    client_secret,
    grant_type: "refresh_token",
    refresh_token,
  },
  schema: stravaTokenRefreshSchema,
})
```

### `stravaApiFetch`

For Strava API calls (base URL: `https://www.strava.com/api/v3`).
Always pass the `Authorization` header — use `getValidAccessToken()` to get a fresh token.

```ts
import { stravaApiFetch } from "@/lib/strava/client"
import { stravaEndpoints } from "@/lib/strava/constants"
import { stravaAthleteSchema } from "@/lib/strava/schemas"

const athlete = await stravaApiFetch(stravaEndpoints.athlete, {
  headers: { Authorization: `Bearer ${accessToken}` },
  schema: stravaAthleteSchema,
})

const activities = await stravaApiFetch(stravaEndpoints.athleteActivities, {
  headers: { Authorization: `Bearer ${accessToken}` },
  params: { per_page: 30, page: 1 },
  schema: z.array(stravaActivitySchema),
})
```

## Schemas

| Export                      | Used for                                           |
| --------------------------- | -------------------------------------------------- |
| `stravaTokenRefreshSchema`  | Token refresh response                             |
| `stravaTokenExchangeSchema` | Initial OAuth code exchange (includes athlete)     |
| `stravaAthleteSchema`       | `GET /athlete`                                     |
| `stravaActivitySchema`      | Individual activity from `GET /athlete/activities` |

## Token Management

`getValidAccessToken(account)` handles expiry automatically:

1. Returns current token if not expired (with 60s grace).
2. Re-fetches from DB to avoid duplicate refreshes across instances.
3. Calls `POST /oauth/token` to refresh if still expired.
4. Persists new tokens to DB and returns the fresh access token.

```ts
import { getValidAccessToken } from "@/lib/strava/token"

const accessToken = await getValidAccessToken(stravaAccount)
```

## OAuth Flow

**Connect:** `GET /api/strava/connect` → Strava → `GET /api/strava/callback`

**Disconnect:** `disconnectStravaAction` (server action used by UI) and `POST /api/strava/disconnect` (API route). Both revoke the token via `POST /oauth/deauthorize` (best effort) before deleting the local record.

## Endpoint Paths

```ts
stravaOAuthPaths.token // "/token"
stravaOAuthPaths.deauthorize // "/deauthorize"

stravaEndpoints.athlete // "/athlete"
stravaEndpoints.athleteActivities // "/athlete/activities"
stravaEndpoints.activityDetail(id) // "/activities/:id"
```
