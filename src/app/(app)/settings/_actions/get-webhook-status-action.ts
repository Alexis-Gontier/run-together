"use server"

import { z } from "zod"

import { env } from "@/env"
import { stravaApiFetch } from "@/lib/strava/client"
import { stravaEndpoints } from "@/lib/strava/constants"

export async function getWebhookStatus(): Promise<boolean> {
  try {
    const subscriptions = await stravaApiFetch(
      stravaEndpoints.pushSubscriptions,
      {
        params: {
          client_id: env.STRAVA_CLIENT_ID,
          client_secret: env.STRAVA_CLIENT_SECRET,
        },
        schema: z.array(z.object({ id: z.number() })),
        next: {
          revalidate: 3600,
          tags: ["strava-webhook-status"],
        },
      },
    )
    return subscriptions.length > 0
  } catch {
    return false
  }
}
