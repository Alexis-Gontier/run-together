import { RunSource } from "@/generated/prisma/client"
import { sendRunNotification } from "@/lib/discord"
import { prisma } from "@/lib/db/prisma"
import { stravaApiFetch } from "@/lib/strava/client"
import { STRAVA_RUN_TYPES, stravaEndpoints } from "@/lib/strava/constants"
import { stravaActivityDetailSchema } from "@/lib/strava/schemas"
import { getValidAccessToken } from "@/lib/strava/token"

interface ImportOptions {
  // When true, non-run activities are silently skipped instead of throwing
  silent?: boolean
}

export async function importStravaActivity(
  userId: string,
  activityId: number,
  options: ImportOptions = {},
): Promise<void> {
  const account = await prisma.stravaAccount.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  })
  if (!account) throw new Error("Strava account not found")

  const accessToken = await getValidAccessToken(account)

  const activity = await stravaApiFetch(
    stravaEndpoints.activityDetail(activityId),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      schema: stravaActivityDetailSchema,
    },
  )

  if (!(STRAVA_RUN_TYPES as readonly string[]).includes(activity.sport_type)) {
    if (!options.silent)
      throw new Error(
        `Activity ${activityId} is not a run (${activity.sport_type})`,
      )
    return
  }

  const existing = await prisma.run.findUnique({
    where: { stravaId: String(activityId) },
    select: { id: true },
  })
  if (existing) return

  await prisma.$transaction(async (tx) => {
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

    if (!options.silent) {
      sendRunNotification({
        userName: account.user.name ?? "Inconnu",
        runName: run.name,
        distanceMeters: run.distance,
        durationSeconds: run.duration,
        paceSecondsPerKm: run.pace,
        elevationMeters: run.elevation,
        heartRateAvg: run.heartRateAvg,
      }).catch((err) => console.error("[discord] run notification failed", err))
    }
  })
}
