import type {
  LeaderboardMetric,
  LeaderboardPeriod,
} from "../_schemas/leaderboard-schema"
import { getPeriodRange as sharedGetPeriodRange } from "@/lib/utils/date"

const LEADERBOARD_DAYS: Record<string, number> = {
  week: 7,
  month: 30,
  "3m": 91,
  "6m": 182,
  "1y": 365,
}

export function getPeriodRange(period: LeaderboardPeriod) {
  return sharedGetPeriodRange(period, LEADERBOARD_DAYS)
}

export type RunRow = {
  date: Date
  distance: number
  duration: number
  pace: number
  userId: string
}

export function computeStats(runs: RunRow[]) {
  const totalDistance = runs.reduce((s, r) => s + r.distance, 0)
  const totalDuration = runs.reduce((s, r) => s + r.duration, 0)
  return {
    totalDistanceKm: Math.round(totalDistance / 100) / 10,
    totalRuns: runs.length,
    avgPaceSecPerKm:
      totalDistance > 0
        ? Math.round((totalDuration / totalDistance) * 1000)
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
