export const ROUTES = {
  HOME: "/home",
  RUNS: "/runs",
  PROGRESS: "/progress",
  LEADERBOARD: "/leaderboard",
  BADGES: "/badges",
  COMPARE: "/compare",
  SETTINGS: "/settings",
  LANDING: "/",
  ONBOARDING: "/onboarding",
} as const

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
} as const

export const runRoute = (id: string) => `${ROUTES.RUNS}/${id}`
export const profileRoute = (username: string) => `/profile/${username}`

export const API_ROUTES = {
  STRAVA_CONNECT: "/api/strava/connect",
  STRAVA_CALLBACK: "/api/strava/callback",
  STRAVA_DISCONNECT: "/api/strava/disconnect",
  STRAVA_WEBHOOK: "/api/strava/webhook",
} as const
