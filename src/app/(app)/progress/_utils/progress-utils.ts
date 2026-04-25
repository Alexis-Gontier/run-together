import type { ProgressPeriod } from "../_schemas/progress-schema"
import { getPeriodRange as sharedGetPeriodRange } from "@/lib/utils/date"

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

export function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
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

export function computeBestStreak(activeDateSet: Set<string>): number {
  const sortedDays = Array.from(activeDateSet).sort()
  let best = sortedDays.length > 0 ? 1 : 0
  let running = best
  for (let i = 1; i < sortedDays.length; i++) {
    const diffDays = Math.round(
      (new Date(sortedDays[i] + "T00:00:00Z").getTime() -
        new Date(sortedDays[i - 1] + "T00:00:00Z").getTime()) /
        (1000 * 60 * 60 * 24),
    )
    if (diffDays === 1) {
      running++
      if (running > best) best = running
    } else {
      running = 1
    }
  }
  return best
}

export function computeCurrentStreak(allDateSet: Set<string>): number {
  let streak = 0
  const cursor = new Date(toDateStr(new Date()) + "T00:00:00Z")
  while (allDateSet.has(toDateStr(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}
