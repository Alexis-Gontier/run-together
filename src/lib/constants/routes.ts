export const ROUTES = {
  HOME: "/home",
  RUNS: "/runs",
  RUN_NEW: "/runs/new",
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

export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.HOME]: "Accueil",
  [ROUTES.RUNS]: "Mes courses",
  [ROUTES.PROGRESS]: "Progression",
  [ROUTES.LEADERBOARD]: "Classement",
  [ROUTES.BADGES]: "Badges",
  [ROUTES.COMPARE]: "Comparer",
  [ROUTES.SETTINGS]: "Paramètres",
}

export const compareRoute = (username: string) =>
  `${ROUTES.COMPARE}?with=${encodeURIComponent(username)}`
export const runRoute = (id: string) => `${ROUTES.RUNS}/${id}`
export const editRunRoute = (id: string) => `${ROUTES.RUNS}/${id}/edit`
export const profileRoute = (username: string) => `/profile/${username}`

export const ADMIN_ROUTES = {
  USERS: "/admin",
  DISCORD: "/admin/discord",
} as const

export const API_ROUTES = {
  STRAVA_CONNECT: "/api/strava/connect",
  STRAVA_CALLBACK: "/api/strava/callback",
  STRAVA_DISCONNECT: "/api/strava/disconnect",
  STRAVA_WEBHOOK: "/api/strava/webhook",
  EXPORT: "/api/export",
} as const
