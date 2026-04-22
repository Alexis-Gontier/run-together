import { up } from "up-fetch"

import { STRAVA_API, STRAVA_OAUTH_BASE_URL } from "@/lib/strava/constants"

// For token exchange, refresh, and deauthorize
export const stravaOAuthFetch = up(fetch, () => ({
  baseUrl: STRAVA_OAUTH_BASE_URL,
}))

// For Strava API calls — pass Authorization header per-request:
// stravaApiFetch(stravaEndpoints.athlete, {
//   headers: { Authorization: `Bearer ${accessToken}` },
//   schema: stravaAthleteSchema,
// })
export const stravaApiFetch = up(fetch, () => ({
  baseUrl: STRAVA_API,
}))
