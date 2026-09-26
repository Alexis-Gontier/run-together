import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    STRAVA_CLIENT_ID: z.string(),
    STRAVA_CLIENT_SECRET: z.string(),
    STRAVA_WEBHOOK_VERIFY_TOKEN: z.string(),
    DISCORD_WEBHOOK_URL: z.string(),
    // L'app Strava est inactive depuis le 19/08/2026 : UI, OAuth et webhook coupés par défaut.
    STRAVA_ENABLED: z.stringbool().default(false),
    // Secret partagé avec Vercel Cron (récap hebdo Discord). Absent : la route répond 503.
    CRON_SECRET: z.string().min(16).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
})
