import type { Run, RunSource } from "@/generated/prisma/client"
import { evaluateBadges } from "@/lib/badges/evaluate"
import { prisma } from "@/lib/db/prisma"
import { notifyBadgesUnlocked, notifyRunCreated } from "@/lib/discord/events"
import { computePace } from "./pace"
import {
  type NewPR,
  recalculatePersonalRecords,
  updatePersonalRecords,
} from "./personal-records"
import type { RecordRunInput } from "./schemas"

type RecordRunOptions = {
  userId: string
  userName: string
  source: RunSource
  stravaId?: string
  notify: boolean
  // Supprime d'abord la course de même `stravaId` (événement « update » du webhook)
  replaceExisting?: boolean
}

/**
 * Seul chemin d'écriture d'une nouvelle course, quelle que soit la source (formulaire, fichier,
 * Strava). Les étapes après la transaction ne font jamais échouer l'enregistrement.
 */
export async function recordRun(
  input: RecordRunInput,
  options: RecordRunOptions,
): Promise<{ run: Run; newPRs: NewPR[] }> {
  const { userId, source, stravaId } = options

  const run = await prisma.$transaction(async (tx) => {
    if (options.replaceExisting && stravaId) {
      await tx.run.deleteMany({ where: { stravaId, userId } })
    }
    const created = await tx.run.create({
      data: {
        userId,
        source,
        stravaId: stravaId ?? null,
        name: input.name,
        sportType: input.sportType,
        distance: input.distance,
        duration: input.duration,
        pace: computePace(input.distance, input.duration),
        elevation: input.elevation,
        date: input.date,
        heartRateAvg: input.heartRateAvg ?? null,
        heartRateMax: input.heartRateMax ?? null,
        cadenceAvg: input.cadenceAvg ?? null,
        calories: input.calories ?? null,
        polyline: input.polyline ?? null,
        summaryPolyline: input.summaryPolyline ?? null,
        startLat: input.startLat ?? null,
        startLng: input.startLng ?? null,
        deviceName: input.deviceName ?? null,
      },
    })
    if (input.splits.length > 0) {
      await tx.split.createMany({
        data: input.splits.map((s) => ({
          runId: created.id,
          kilometer: s.kilometer,
          distance: s.distance,
          duration: s.duration,
          pace: computePace(s.distance, s.duration),
          heartRate: s.heartRate,
          elevation: s.elevation,
        })),
      })
    }
    return created
  })

  let newPRs: NewPR[] = []
  try {
    newPRs = await updatePersonalRecords(
      userId,
      run,
      input.splits.map((s) => ({
        kilometer: s.kilometer,
        distance: s.distance,
        duration: s.duration,
        pace: computePace(s.distance, s.duration),
      })),
    )
  } catch (err) {
    console.error("[personal-records] update failed", run.id, err)
  }

  if (options.notify) await notifyRunCreated(run.id, newPRs)

  // Après les records : deux badges dépendent du nombre de records détenus.
  try {
    const badges = await evaluateBadges(userId, run.id)
    if (options.notify) await notifyBadgesUnlocked(userId, run.id, badges)
  } catch (err) {
    console.error("[badges] evaluate failed", run.id, err)
  }

  return { run, newPRs }
}

/** Supprime une course de l'utilisateur et recalcule ses records (elle en portait peut-être). */
export async function removeRun(userId: string, runId: string): Promise<void> {
  await prisma.run.delete({ where: { id: runId, userId } })
  try {
    await recalculatePersonalRecords(userId)
  } catch (err) {
    console.error("[personal-records] recalculate failed after delete", err)
  }
  try {
    await evaluateBadges(userId)
  } catch (err) {
    console.error("[badges] evaluate failed after delete", err)
  }
}

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000

/** Même utilisateur, départ à ±2 min et distance à ±2 % : très probablement la même course. */
export function findDuplicateRun(
  userId: string,
  input: Pick<RecordRunInput, "date" | "distance">,
  excludeRunId?: string,
) {
  return prisma.run.findFirst({
    where: {
      userId,
      id: excludeRunId ? { not: excludeRunId } : undefined,
      date: {
        gte: new Date(input.date.getTime() - DUPLICATE_WINDOW_MS),
        lte: new Date(input.date.getTime() + DUPLICATE_WINDOW_MS),
      },
      distance: {
        gte: Math.floor(input.distance * 0.98),
        lte: Math.ceil(input.distance * 1.02),
      },
    },
    select: { id: true },
  })
}
