import { getPeriodRange as sharedGetPeriodRange } from "@/lib/utils/date"
import type { ProgressPeriod } from "../_schemas/progress-schema"

export {
  computeBestStreak,
  computeCurrentStreak,
  toDateStr,
} from "@/lib/stats/streaks"

const PROGRESS_DAYS: Record<string, number> = {
  "3m": 91,
  "6m": 182,
  "1y": 365,
}

export function getPeriodRange(period: ProgressPeriod) {
  return sharedGetPeriodRange(period, PROGRESS_DAYS)
}

export function getWeekStart(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const day = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day))
  return d.toISOString().split("T")[0]
}

export function sumDistanceKm(runs: { distance: number }[]) {
  return Math.round(runs.reduce((s, r) => s + r.distance, 0) / 100) / 10
}

export function avgPaceSec(runs: { duration: number; distance: number }[]) {
  const totalDistance = runs.reduce((s, r) => s + r.distance, 0)
  const totalDuration = runs.reduce((s, r) => s + r.duration, 0)
  return totalDistance > 0
    ? Math.round((totalDuration / totalDistance) * 1000)
    : null
}

export function sumElevationM(runs: { elevation: number }[]) {
  return runs.reduce((s, r) => s + r.elevation, 0)
}
