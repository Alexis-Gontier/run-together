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

    // Fetch all details from Strava in chunks of 5 to avoid rate limits
    const CHUNK_SIZE = 5
    const details: z.infer<typeof stravaActivityDetailSchema>[] = []

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE)
      const results = await Promise.allSettled(
        chunk.map((id) =>
          stravaApiFetch(stravaEndpoints.activityDetail(id), {
            headers: { Authorization: `Bearer ${accessToken}` },
            schema: stravaActivityDetailSchema,
          }),
        ),
      )
      for (const r of results) {
        if (r.status === "fulfilled") details.push(r.value)
      }
    }

    if (details.length === 0) return { count: 0 }

    // Filter already imported
    const stravaIds = details.map((a) => String(a.id))
    const existing = await prisma.run.findMany({
      where: { stravaId: { in: stravaIds } },
      select: { stravaId: true },
    })
    const existingIds = new Set(existing.map((r) => r.stravaId))
    const newActivities = details.filter((a) => !existingIds.has(String(a.id)))

    if (newActivities.length === 0) return { count: 0 }

    // Write each activity in its own transaction so one failure doesn't block others
    const writeResults = await Promise.allSettled(
      newActivities.map((a) =>
        prisma.$transaction((tx) => createRunFromActivity(tx, user.id, a)),
      ),
    )

    const count = writeResults.filter((r) => r.status === "fulfilled").length
    return { count }
  })
