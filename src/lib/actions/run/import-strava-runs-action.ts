"use server"

import { z } from "zod"

import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { prisma } from "@/lib/db/prisma"
import { RunSource } from "@/generated/prisma/client"
import { stravaApiFetch } from "@/lib/strava/client"
import { stravaEndpoints } from "@/lib/strava/constants"
import { stravaActivityDetailSchema } from "@/lib/strava/schemas"
import { getValidAccessToken } from "@/lib/strava/token"

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
        const run = await tx.run.create({
          data: {
            userId: user.id,
            source: RunSource.STRAVA,
            stravaId: String(a.id),
            name: a.name,
            distance: Math.round(a.distance),
            duration: a.moving_time,
            pace:
              a.distance > 0
                ? Math.round((a.moving_time / a.distance) * 1000)
                : 0,
            elevation: Math.round(a.total_elevation_gain),
            date: new Date(a.start_date),
            heartRateAvg: a.average_heartrate ?? null,
            heartRateMax: a.max_heartrate ?? null,
            cadenceAvg: a.average_cadence ?? null,
            calories: a.calories ?? null,
            startLat: a.start_latlng?.[0] ?? null,
            startLng: a.start_latlng?.[1] ?? null,
            summaryPolyline: a.map?.summary_polyline ?? null,
            polyline: a.map?.polyline ?? null,
            sportType: a.sport_type,
            deviceName: a.device_name ?? null,
          },
        })

        if (a.splits_metric && a.splits_metric.length > 0) {
          await tx.split.createMany({
            data: a.splits_metric.map((s) => ({
              runId: run.id,
              kilometer: s.split,
              distance: s.distance,
              duration: s.moving_time,
              pace:
                s.distance > 0
                  ? Math.round((s.moving_time / s.distance) * 1000)
                  : 0,
              heartRate:
                s.average_heartrate != null
                  ? Math.round(s.average_heartrate)
                  : null,
              elevation: s.elevation_difference ?? null,
            })),
          })
        }
      }
    })

    return { count: newActivities.length }
  })
