"use server"

import { z } from "zod"

import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { prisma } from "@/lib/db/prisma"
import { stravaApiFetch } from "@/lib/strava/client"
import { stravaEndpoints, STRAVA_RUN_TYPES } from "@/lib/strava/constants"
import { stravaActivitySchema } from "@/lib/strava/schemas"
import { getValidAccessToken } from "@/lib/strava/token"

export const getStravaUnimportedRunsAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    const account = await prisma.stravaAccount.findUnique({
      where: { userId: user.id },
    })

    if (!account) return []

    const accessToken = await getValidAccessToken(account)

    const PER_PAGE = 200
    const allActivities: z.infer<typeof stravaActivitySchema>[] = []
    let page = 1

    while (true) {
      const batch = await stravaApiFetch(stravaEndpoints.athleteActivities, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: PER_PAGE, page },
        schema: z.array(stravaActivitySchema),
      })
      allActivities.push(...batch)
      if (batch.length < PER_PAGE) break
      page++
    }

    const runActivities = allActivities.filter((a) =>
      (STRAVA_RUN_TYPES as readonly string[]).includes(a.sport_type),
    )

    const imported = await prisma.run.findMany({
      where: { userId: user.id, stravaId: { not: null } },
      select: { stravaId: true },
    })
    const importedIds = new Set(imported.map((r) => r.stravaId!))

    return runActivities.filter((a) => !importedIds.has(String(a.id)))
  },
)
