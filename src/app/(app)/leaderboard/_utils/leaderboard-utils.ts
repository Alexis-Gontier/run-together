import type {
  LeaderboardMetric,
  LeaderboardPeriod,
} from "../_schemas/leaderboard-schema"

export function getPeriodRange(period: LeaderboardPeriod): {
  currentStart: Date
  currentEnd: Date
  prevStart: Date | null
  prevEnd: Date | null
} {
  const now = new Date()
  now.setUTCHours(23, 59, 59, 999)

  if (period === "all") {
    return {
      currentStart: new Date(0),
      currentEnd: now,
      prevStart: null,
      prevEnd: null,
    }
  }

  const daysMap: Record<Exclude<LeaderboardPeriod, "all">, number> = {
    week: 7,
    month: 30,
    "3m": 91,
    "6m": 182,
    "1y": 365,
  }
  const days = daysMap[period]

  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  currentStart.setUTCHours(0, 0, 0, 0)

  const prevEnd = new Date(currentStart.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000)
  prevStart.setUTCHours(0, 0, 0, 0)

  return { currentStart, currentEnd: now, prevStart, prevEnd }
}

export type RunRow = {
  date: Date
  distance: number
  pace: number
  userId: string
}

export function computeStats(runs: RunRow[]) {
  return {
    totalDistanceKm:
      Math.round(runs.reduce((s, r) => s + r.distance, 0) / 100) / 10,
    totalRuns: runs.length,
    avgPaceSecPerKm:
      runs.length > 0
        ? Math.round(runs.reduce((s, r) => s + r.pace, 0) / runs.length)
        : null,
  }
}

export function getMetricValue(
  stats: ReturnType<typeof computeStats>,
  metric: LeaderboardMetric,
): number | null {
  if (metric === "distance") return stats.totalDistanceKm
  if (metric === "runs") return stats.totalRuns
  return stats.avgPaceSecPerKm
}

export function computeEvolution(
  current: number | null,
  previous: number | null,
  metric: LeaderboardMetric,
): number | null {
  if (current === null || previous === null || previous === 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  // For pace: lower is better, so invert the sign for display
  return metric === "pace" ? -pct : pct
}
