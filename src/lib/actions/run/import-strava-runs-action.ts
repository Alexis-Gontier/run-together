"use server"

import { z } from "zod"

import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { prisma } from "@/lib/db/prisma"
import { RunSource } from "@/generated/prisma/client"

const importActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  sport_type: z.string(),
  start_date: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  total_elevation_gain: z.number(),
  average_heartrate: z.number().optional(),
  max_heartrate: z.number().optional(),
  map: z
    .object({
      id: z.string(),
      summary_polyline: z.string().nullable(),
    })
    .optional(),
})

const importSchema = z.object({
  activities: z.array(importActivitySchema),
})

export const importStravaRunsAction = authActionClient
  .inputSchema(importSchema)
  .action(async ({ parsedInput: { activities }, ctx: { user } }) => {
    const runs = activities.map((a) => ({
      userId: user.id,
      source: RunSource.STRAVA,
      stravaId: String(a.id),
      name: a.name,
      distance: Math.round(a.distance),
      duration: a.moving_time,
      pace:
        a.distance > 0 ? Math.round((a.moving_time / a.distance) * 1000) : 0,
      elevation: Math.round(a.total_elevation_gain),
      date: new Date(a.start_date),
      heartRateAvg: a.average_heartrate ?? null,
      heartRateMax: a.max_heartrate ?? null,
      summaryPolyline: a.map?.summary_polyline ?? null,
      sportType: a.sport_type,
    }))

    const result = await prisma.run.createMany({
      data: runs,
      skipDuplicates: true,
    })

    return { count: result.count }
  })
