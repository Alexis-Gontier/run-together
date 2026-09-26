import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.url(),
    // Vide, better-auth retombe sur un secret public : sessions forgeables.
    BETTER_AUTH_SECRET: z.string().min(32),
    STRAVA_CLIENT_ID: z.string(),
    STRAVA_CLIENT_SECRET: z.string(),
    STRAVA_WEBHOOK_VERIFY_TOKEN: z.string(),
    DISCORD_WEBHOOK_URL: z.string(),
    // L'app Strava est inactive depuis le 19/08/2026 : UI, OAuth et webhook coupés par défaut.
    STRAVA_ENABLED: z.stringbool().default(false),
    // Secret partagé avec Vercel Cron (récap hebdo Discord). Absent : la route répond 503.
    CRON_SECRET: z.string().min(16).optional(),
    // Vercel Blob (photos de profil, bannières). Sur Vercel : OIDC via BLOB_STORE_ID ;
    // en local : BLOB_READ_WRITE_TOKEN. Aucun des deux : upload masqué.
    BLOB_STORE_ID: z.string().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
