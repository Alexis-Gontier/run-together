import { PRDistance } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
export { PR_DISTANCE_LABELS, PR_DISTANCE_ORDER } from "./pr-display"

// Meters required and sliding-window size (null = use overall run)
const PR_CONFIG: Record<
  PRDistance,
  { meters: number; splitWindow: number | null }
> = {
  KM_1: { meters: 1000, splitWindow: 1 },
  KM_5: { meters: 5000, splitWindow: 5 },
  KM_10: { meters: 10000, splitWindow: 10 },
  HALF_MARATHON: { meters: 21097.5, splitWindow: null },
  MARATHON: { meters: 42195, splitWindow: null },
}

type RunForPR = { id: string; distance: number; duration: number; pace: number }
type SplitForPR = {
  kilometer: number
  distance: number
  duration: number
  pace: number
}

interface PRCandidate {
  distance: PRDistance
  runId: string
  duration: number
  pace: number
}

function extractCandidates(run: RunForPR, splits: SplitForPR[]): PRCandidate[] {
  const results: PRCandidate[] = []
  const sorted = [...splits].sort((a, b) => a.kilometer - b.kilometer)

  for (const [key, config] of Object.entries(PR_CONFIG) as [
    PRDistance,
    (typeof PR_CONFIG)[PRDistance],
  ][]) {
    if (config.splitWindow !== null) {
      const w = config.splitWindow
      if (sorted.length < w) continue

      let bestDuration: number | null = null
      let bestPace: number | null = null

      for (let i = 0; i <= sorted.length - w; i++) {
        const window = sorted.slice(i, i + w)
        const totalDuration = window.reduce((s, sp) => s + sp.duration, 0)
        const totalDistance = window.reduce((s, sp) => s + sp.distance, 0)
        // Skip incomplete windows (e.g. last partial split)
        if (totalDistance < config.meters * 0.9) continue
        if (bestDuration === null || totalDuration < bestDuration) {
          bestDuration = totalDuration
          bestPace = Math.round((totalDuration / totalDistance) * 1000)
        }
      }

      if (bestDuration !== null && bestPace !== null) {
        results.push({
          distance: key,
          runId: run.id,
          duration: bestDuration,
          pace: bestPace,
        })
      }
    } else {
      // Only count runs that cover the full distance (3% GPS tolerance)
      if (run.distance < config.meters * 0.97) continue
      results.push({
        distance: key,
        runId: run.id,
        duration: run.duration,
        pace: run.pace,
      })
    }
  }

  return results
}

export type NewPR = {
  distance: PRDistance
  duration: number
  pace: number
  previousDuration: number | null
}

/**
 * Called after each run import. Upserts PRs only when the new run beats the
 * existing record for a given distance. Returns the list of PRs that were set
 * or broken (empty array = no records changed).
 */
export async function updatePersonalRecords(
  userId: string,
  run: RunForPR,
  splits: SplitForPR[],
): Promise<NewPR[]> {
  const candidates = extractCandidates(run, splits)
  if (candidates.length === 0) return []

  const existing = await prisma.personalRecord.findMany({
    where: {
      userId,
      distance: { in: candidates.map((c) => c.distance) },
    },
    select: { distance: true, duration: true },
  })

  const existingMap = new Map(existing.map((pr) => [pr.distance, pr.duration]))
  const toUpsert = candidates.filter((c) => {
    const prev = existingMap.get(c.distance)
    return prev === undefined || c.duration < prev
  })

  if (toUpsert.length === 0) return []

  await Promise.all(
    toUpsert.map((c) =>
      prisma.personalRecord.upsert({
        where: { userId_distance: { userId, distance: c.distance } },
        create: {
          userId,
          runId: c.runId,
          distance: c.distance,
          duration: c.duration,
          pace: c.pace,
        },
        update: { runId: c.runId, duration: c.duration, pace: c.pace },
      }),
    ),
  )

  return toUpsert.map((c) => ({
    distance: c.distance,
    duration: c.duration,
    pace: c.pace,
    previousDuration: existingMap.get(c.distance) ?? null,
  }))
}

/**
 * Full recalculation from scratch. Used after a run is deleted, in case it
 * held one or more records.
 */
export async function recalculatePersonalRecords(
  userId: string,
): Promise<void> {
  const runs = await prisma.run.findMany({
    where: { userId },
    select: {
      id: true,
      distance: true,
      duration: true,
      pace: true,
      splits: {
        select: { kilometer: true, distance: true, duration: true, pace: true },
        orderBy: { kilometer: "asc" },
      },
    },
  })

  const bestByDistance = new Map<PRDistance, PRCandidate>()

  for (const run of runs) {
    for (const candidate of extractCandidates(run, run.splits)) {
      const current = bestByDistance.get(candidate.distance)
      if (!current || candidate.duration < current.duration) {
        bestByDistance.set(candidate.distance, candidate)
      }
    }
  }

  await prisma.personalRecord.deleteMany({ where: { userId } })

  if (bestByDistance.size === 0) return

  await prisma.personalRecord.createMany({
    data: Array.from(bestByDistance.values()).map((c) => ({
      userId,
      runId: c.runId,
      distance: c.distance,
      duration: c.duration,
      pace: c.pace,
    })),
  })
}
