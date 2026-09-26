import { prisma } from "@/lib/db/prisma"
import { computePace } from "@/lib/runs/pace"
import type { WeeklyRecapData } from "./embeds/weekly-recap"

const DAY = 24 * 60 * 60 * 1000
// Allure moyenne retenue seulement au-delà de 10 km cumulés dans la semaine.
const BEST_PACE_MIN_DISTANCE = 10_000

/**
 * Semaine écoulée : du lundi 00:00 **UTC** précédent au lundi courant 00:00 UTC (exclu).
 * Le cron tourne le lundi matin, donc « la semaine précédente ».
 */
export function previousWeek(now: Date): { start: Date; end: Date } {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  const daysSinceMonday = (new Date(today).getUTCDay() + 6) % 7
  const end = new Date(today - daysSinceMonday * DAY)
  return { start: new Date(end.getTime() - 7 * DAY), end }
}

/** Statistiques du groupe sur la fenêtre ; `null` si personne n'a couru. */
export async function getWeeklyRecapData(
  start: Date,
  end: Date,
): Promise<WeeklyRecapData | null> {
  const [runs, records] = await Promise.all([
    prisma.run.findMany({
      where: { date: { gte: start, lt: end } },
      select: {
        distance: true,
        duration: true,
        userId: true,
        user: { select: { name: true } },
      },
    }),
    prisma.personalRecord.findMany({
      where: { run: { date: { gte: start, lt: end } } },
      select: {
        distance: true,
        duration: true,
        user: { select: { name: true } },
      },
      orderBy: { duration: "asc" },
    }),
  ])
  if (runs.length === 0) return null

  const byUser = new Map<
    string,
    { name: string; distance: number; duration: number; runs: number }
  >()
  for (const r of runs) {
    const u = byUser.get(r.userId) ?? {
      name: r.user.name,
      distance: 0,
      duration: 0,
      runs: 0,
    }
    u.distance += r.distance
    u.duration += r.duration
    u.runs += 1
    byUser.set(r.userId, u)
  }
  const users = [...byUser.values()]

  const bestPace = users
    .filter((u) => u.distance >= BEST_PACE_MIN_DISTANCE)
    .map((u) => ({
      name: u.name,
      distance: u.distance,
      pace: computePace(u.distance, u.duration),
    }))
    .sort((a, b) => a.pace - b.pace)[0]

  return {
    weekStart: start,
    weekEnd: end,
    totalDistance: users.reduce((s, u) => s + u.distance, 0),
    totalRuns: runs.length,
    runners: users.length,
    topDistance: [...users]
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 3)
      .map(({ name, distance }) => ({ name, distance })),
    topRuns: [...users]
      .sort((a, b) => b.runs - a.runs || b.distance - a.distance)
      .slice(0, 3)
      .map(({ name, runs }) => ({ name, runs })),
    bestPace: bestPace ?? null,
    records: records.map((r) => ({
      name: r.user.name,
      distance: r.distance,
      duration: r.duration,
    })),
  }
}
