"use server"

import { z } from "zod"

import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { prisma } from "@/lib/db/prisma"
import { stravaApiFetch } from "@/lib/strava/client"
import { stravaEndpoints } from "@/lib/strava/constants"
import { stravaActivityDetailSchema } from "@/lib/strava/schemas"
import { getValidAccessToken } from "@/lib/strava/token"
import { createRunFromActivity } from "@/lib/strava/create-run-from-activity"

const importSchema = z.object({
  ids: z.array(z.number()),
})

export const importStravaRunsAction = authActionClient
  .inputSchema(importSchema)
  .action(async ({ parsedInput: { ids }, ctx: { user } }) => {
    const account = await prisma.stravaAccount.findUnique({
      where: { userId: user.id },
    })

    if (!account) throw new Error("Strava account not found")

    const accessToken = await getValidAccessToken(account)

    const BATCH_SIZE = 10
    const activities = []
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((id) =>
          stravaApiFetch(stravaEndpoints.activityDetail(id), {
            headers: { Authorization: `Bearer ${accessToken}` },
            schema: stravaActivityDetailSchema,
          }),
        ),
      )
      activities.push(...results)
    }

    // Filtrer les activités déjà importées
    const stravaIds = activities.map((a) => String(a.id))
    const existing = await prisma.run.findMany({
      where: { stravaId: { in: stravaIds } },
      select: { stravaId: true },
    })
    const existingIds = new Set(existing.map((r) => r.stravaId))
    const newActivities = activities.filter(
      (a) => !existingIds.has(String(a.id)),
    )

    if (newActivities.length === 0) return { count: 0 }

    await prisma.$transaction(async (tx) => {
      for (const a of newActivities) {
        await createRunFromActivity(tx, user.id, a)
      }
    })

    return { count: newActivities.length }
  })
