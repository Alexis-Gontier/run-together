import { up } from "up-fetch"

import { STRAVA_API, STRAVA_OAUTH_BASE_URL } from "@/lib/strava/constants"

export const stravaOAuthFetch = up(fetch, () => ({
  baseUrl: STRAVA_OAUTH_BASE_URL,
  timeout: 15_000,
}))

export const stravaApiFetch = up(fetch, () => ({
  baseUrl: STRAVA_API,
  timeout: 15_000,
}))
