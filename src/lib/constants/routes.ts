export const ROUTES = {
  HOME: "/home",
  RUNS: "/runs",
  RUN_NEW: "/runs/new",
  PROGRESS: "/progress",
  LEADERBOARD: "/leaderboard",
  BADGES: "/badges",
  COMPARE: "/compare",
  CHARTS: "/charts",
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
  [ROUTES.CHARTS]: "Radars",
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

// Images OG (embeds Discord)
export const ogRunRoute = (runId: string) => `/api/og/run/${runId}`
export const ogBadgesRoute = (runId: string) => `/api/og/badges/${runId}`
/** `week` = lundi de la semaine, `yyyy-MM-dd` (UTC). */
export const ogRecapRoute = (week: string) => `/api/og/recap/${week}`
/** `month` = `yyyy-MM` (UTC). */
export const ogRankingRoute = (month: string) => `/api/og/ranking/${month}`
/** `day` (yyyy-MM-dd) : jour de publication, qui fige la période et l'URL en cache chez Discord. */
export const ogBattleRoute = (
  aId: string,
  bId: string,
  period: string,
  day: string,
) => `/api/og/battle/${aId}/${bId}/${period}?at=${day}`
export const ogMemberRoute = (userId: string) => `/api/og/member/${userId}`
export const ogTestRoute = "/api/og/test"
