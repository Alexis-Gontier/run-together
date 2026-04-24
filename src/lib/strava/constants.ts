export const STRAVA_API = "https://www.strava.com/api/v3"
export const STRAVA_OAUTH_BASE_URL = "https://www.strava.com/oauth"
export const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
export const STRAVA_SCOPE = "activity:read_all"
export const STRAVA_RUN_TYPES = ["Run", "TrailRun", "VirtualRun"] as const

// OAuth paths (relative to STRAVA_OAUTH_BASE_URL)
export const stravaOAuthPaths = {
  token: "/token",
  deauthorize: "/deauthorize",
} as const

// API paths (relative to STRAVA_API)
export const stravaEndpoints = {
  athlete: "/athlete",
  athleteActivities: "/athlete/activities",
  activityDetail: (id: number) => `/activities/${id}`,
  pushSubscriptions: "/push_subscriptions",
} as const
