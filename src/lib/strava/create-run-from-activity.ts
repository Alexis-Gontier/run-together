import type { Prisma } from "@/generated/prisma/client"
import { RunSource } from "@/generated/prisma/client"
import type { z } from "zod"

import type { stravaActivityDetailSchema } from "./schemas"

type StravaActivityDetail = z.infer<typeof stravaActivityDetailSchema>

export async function createRunFromActivity(
  tx: Prisma.TransactionClient,
  userId: string,
  activity: StravaActivityDetail,
) {
  const run = await tx.run.create({
    data: {
      userId,
      source: RunSource.STRAVA,
      stravaId: String(activity.id),
      name: activity.name,
      distance: Math.round(activity.distance),
      duration: activity.moving_time,
      pace:
        activity.distance > 0
          ? Math.round((activity.moving_time / activity.distance) * 1000)
          : 0,
      elevation: Math.round(activity.total_elevation_gain),
      date: new Date(activity.start_date),
      heartRateAvg: activity.average_heartrate ?? null,
      heartRateMax: activity.max_heartrate ?? null,
      cadenceAvg: activity.average_cadence ?? null,
      calories: activity.calories ?? null,
      startLat: activity.start_latlng?.[0] ?? null,
      startLng: activity.start_latlng?.[1] ?? null,
      summaryPolyline: activity.map?.summary_polyline ?? null,
      polyline: activity.map?.polyline ?? null,
      sportType: activity.sport_type,
      deviceName: activity.device_name ?? null,
    },
  })

  if (activity.splits_metric && activity.splits_metric.length > 0) {
    await tx.split.createMany({
      data: activity.splits_metric.map((s) => ({
        runId: run.id,
        kilometer: s.split,
        distance: s.distance,
        duration: s.moving_time,
        pace:
          s.distance > 0 ? Math.round((s.moving_time / s.distance) * 1000) : 0,
        heartRate:
          s.average_heartrate != null ? Math.round(s.average_heartrate) : null,
        elevation: s.elevation_difference ?? null,
      })),
    })
  }

  return run
}
