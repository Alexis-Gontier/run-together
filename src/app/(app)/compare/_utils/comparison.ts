import { startOfWeek } from "date-fns"
import type { PRDistance } from "@/generated/prisma/enums"
import { prisma } from "@/lib/db/prisma"
import { computePace } from "@/lib/runs/pace"
import { getPeriodRange } from "@/lib/utils/date"

export type ComparePeriod = "1m" | "3m" | "6m" | "1y" | "all"

export const COMPARE_PERIODS: { value: ComparePeriod; label: string }[] = [
  { value: "1m", label: "30 j" },
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "all", label: "Tout" },
]

const DAYS: Record<string, number> = {
  "1m": 30,
  "3m": 91,
  "6m": 182,
  "1y": 365,
}

export type Totals = {
  distanceKm: number
  runs: number
  pace: number | null
  elevation: number
  longestKm: number
}

type RunRow = {
  userId: string
  date: Date
  distance: number
  duration: number
  elevation: number
}

function totals(runs: RunRow[]): Totals {
  const distance = runs.reduce((s, r) => s + r.distance, 0)
  const duration = runs.reduce((s, r) => s + r.duration, 0)
  return {
    distanceKm: Math.round(distance / 100) / 10,
    runs: runs.length,
    pace: distance > 0 ? computePace(distance, duration) : null,
    elevation: runs.reduce((s, r) => s + r.elevation, 0),
    longestKm:
      Math.round(Math.max(0, ...runs.map((r) => r.distance)) / 100) / 10,
  }
}

/** Mes chiffres face à ceux d'un autre membre sur la période, + records (tous temps). */
export async function getComparison(
  meId: string,
  otherId: string,
  period: ComparePeriod,
) {
  const { currentStart, currentEnd } = getPeriodRange(period, DAYS)
  const [runs, records] = await Promise.all([
    prisma.run.findMany({
      where: {
        userId: { in: [meId, otherId] },
        date: { gte: currentStart, lte: currentEnd },
      },
      orderBy: { date: "asc" },
      select: {
        userId: true,
        date: true,
        distance: true,
        duration: true,
        elevation: true,
      },
    }),
    prisma.personalRecord.findMany({
      where: { userId: { in: [meId, otherId] } },
      select: { userId: true, distance: true, duration: true },
    }),
  ])

  const mine = runs.filter((r) => r.userId === meId)
  const theirs = runs.filter((r) => r.userId === otherId)

  // Volume hebdomadaire des deux, sur les semaines où l'un des deux a couru.
  const weeks = new Map<string, { week: string; me: number; other: number }>()
  for (const r of runs) {
    const key = startOfWeek(r.date, { weekStartsOn: 1 })
      .toISOString()
      .slice(0, 10)
    const w = weeks.get(key) ?? { week: key, me: 0, other: 0 }
    if (r.userId === meId) w.me += r.distance / 1000
    else w.other += r.distance / 1000
    weeks.set(key, w)
  }

  const recordOf = (userId: string, distance: PRDistance) =>
    records.find((r) => r.userId === userId && r.distance === distance)
      ?.duration ?? null

  return {
    me: totals(mine),
    other: totals(theirs),
    weekly: [...weeks.values()]
      .sort((a, b) => a.week.localeCompare(b.week))
      .map((w) => ({
        week: w.week,
        me: Math.round(w.me * 10) / 10,
        other: Math.round(w.other * 10) / 10,
      })),
    records: (
      ["KM_1", "KM_5", "KM_10", "HALF_MARATHON", "MARATHON"] as const
    ).map((distance) => ({
      distance,
      me: recordOf(meId, distance),
      other: recordOf(otherId, distance),
    })),
  }
}
