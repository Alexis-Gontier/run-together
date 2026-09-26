"use server"

import { z } from "zod"
import { RunSource } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { computePace } from "@/lib/runs/pace"
import { recalculatePersonalRecords } from "@/lib/runs/personal-records"
import { findDuplicateRun } from "@/lib/runs/record-run"
import { recordRunInputSchema } from "@/lib/runs/schemas"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const updateRunAction = authActionClient
  .inputSchema(z.object({ id: z.string(), values: recordRunInputSchema }))
  .action(async ({ parsedInput: { id, values }, ctx: { user } }) => {
    const existing = await prisma.run.findUnique({
      where: { id, userId: user.id },
      select: { source: true },
    })
    if (!existing) return { error: "Course introuvable." }

    // Une course Strava garde ses mesures d'origine : seuls le nom et la date changent.
    if (existing.source === RunSource.STRAVA) {
      await prisma.run.update({
        where: { id },
        data: { name: values.name, date: values.date },
      })
      return { runId: id }
    }

    if (await findDuplicateRun(user.id, values, id)) {
      return { error: "Une course quasi identique existe déjà à cette date." }
    }

    await prisma.$transaction(async (tx) => {
      await tx.run.update({
        where: { id },
        data: {
          name: values.name,
          sportType: values.sportType,
          distance: values.distance,
          duration: values.duration,
          pace: computePace(values.distance, values.duration),
          elevation: values.elevation,
          date: values.date,
          heartRateAvg: values.heartRateAvg ?? null,
          heartRateMax: values.heartRateMax ?? null,
          cadenceAvg: values.cadenceAvg ?? null,
          calories: values.calories ?? null,
          polyline: values.polyline ?? null,
          summaryPolyline: values.summaryPolyline ?? null,
          startLat: values.startLat ?? null,
          startLng: values.startLng ?? null,
          deviceName: values.deviceName ?? null,
        },
      })
      await tx.split.deleteMany({ where: { runId: id } })
      if (values.splits.length > 0) {
        await tx.split.createMany({
          data: values.splits.map((s) => ({
            runId: id,
            kilometer: s.kilometer,
            distance: s.distance,
            duration: s.duration,
            pace: computePace(s.distance, s.duration),
            heartRate: s.heartRate,
            elevation: s.elevation,
          })),
        })
      }
    })

    try {
      await recalculatePersonalRecords(user.id)
    } catch (err) {
      console.error("[personal-records] recalculate failed after update", err)
    }
    return { runId: id }
  })
