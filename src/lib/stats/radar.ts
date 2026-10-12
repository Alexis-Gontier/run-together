import { computePace } from "@/lib/runs/pace"
import { formatRunPace } from "@/lib/utils/run"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export const RADAR_STAT_KEYS = [
  "distance",
  "runs",
  "pace",
  "elevation",
  "longest",
  "average",
  "consistency",
  "time",
] as const

export type RadarStatKey = (typeof RADAR_STAT_KEYS)[number]

/** Totaux d'un coureur sur une période ; `pace` = null sans course. */
export type RunnerTotals = Record<Exclude<RadarStatKey, "pace">, number> & {
  pace: number | null
}

const fmt = (v: number, digits = 1) =>
  (Math.round(v * 10 ** digits) / 10 ** digits).toString().replace(".", ",")

export const RADAR_STATS: Record<
  RadarStatKey,
  {
    label: string
    /** Libellé court, autour du radar. */
    short: string
    /** L'allure : plus petit = mieux. */
    lowerIsBetter?: boolean
    format: (v: number) => string
  }
> = {
  distance: { label: "Distance", short: "Km", format: (v) => `${fmt(v)} km` },
  runs: { label: "Courses", short: "Courses", format: String },
  pace: {
    label: "Allure moyenne",
    short: "Allure",
    lowerIsBetter: true,
    format: (v) => `${formatRunPace(v)} /km`,
  },
  elevation: {
    label: "Dénivelé",
    short: "D+",
    format: (v) => `${Math.round(v)} m`,
  },
  longest: {
    label: "Plus longue",
    short: "Longue",
    format: (v) => `${fmt(v)} km`,
  },
  average: {
    label: "Distance moyenne",
    short: "Moy.",
    format: (v) => `${fmt(v)} km`,
  },
  consistency: {
    label: "Régularité",
    short: "Régul.",
    format: (v) => `${Math.round(v * 100)} % des semaines`,
  },
  time: {
    label: "Temps de course",
    short: "Temps",
    format: (v) => `${fmt(v)} h`,
  },
}

/** Sélection par défaut de /charts. */
export const DEFAULT_RADAR_STATS: RadarStatKey[] = [
  "distance",
  "runs",
  "pace",
  "elevation",
  "longest",
  "consistency",
]

export const MIN_RADAR_STATS = 3

/** `?stats=distance,pace,…` → clés valides, dans l'ordre du catalogue ; défaut si < 3. */
export function parseRadarStats(raw: string | undefined): RadarStatKey[] {
  const wanted = new Set(raw?.split(",") ?? [])
  const keys = RADAR_STAT_KEYS.filter((k) => wanted.has(k))
  return keys.length >= MIN_RADAR_STATS ? keys : DEFAULT_RADAR_STATS
}

type RunRow = {
  date: Date
  distance: number
  duration: number
  elevation: number
}

/**
 * Totaux sur [start ; end]. Régularité = part des semaines (blocs de 7 jours depuis le début
 * de la période, ou depuis la première course pour « Tout ») avec au moins une course.
 */
export function runnerTotals(
  runs: RunRow[],
  start: Date,
  end: Date,
): RunnerTotals {
  const distance = runs.reduce((s, r) => s + r.distance, 0)
  const duration = runs.reduce((s, r) => s + r.duration, 0)
  const first = Math.min(...runs.map((r) => r.date.getTime()))
  const from = Math.max(start.getTime(), runs.length ? first : start.getTime())
  const weeks = Math.max(1, Math.ceil((end.getTime() - from) / WEEK_MS))
  const active = new Set(
    runs.map((r) => Math.floor((r.date.getTime() - from) / WEEK_MS)),
  )
  return {
    distance: distance / 1000,
    runs: runs.length,
    pace: distance > 0 ? computePace(distance, duration) : null,
    elevation: runs.reduce((s, r) => s + r.elevation, 0),
    longest: Math.max(0, ...runs.map((r) => r.distance)) / 1000,
    average: runs.length ? distance / 1000 / runs.length : 0,
    consistency: Math.min(1, active.size / weeks),
    time: duration / 3600,
  }
}

/**
 * Score 0–1 de chaque coureur sur chaque stat, relatif au meilleur du groupe (le meilleur = 1).
 * Valeur absente ou nulle = 0.
 */
export function radarScores(
  totals: RunnerTotals[],
  keys: RadarStatKey[],
): number[][] {
  const best = keys.map((k) => {
    const values = totals
      .map((t) => t[k])
      .filter((v): v is number => v !== null && v > 0)
    if (values.length === 0) return 0
    return RADAR_STATS[k].lowerIsBetter
      ? Math.min(...values)
      : Math.max(...values)
  })
  return totals.map((t) =>
    keys.map((k, i) => {
      const v = t[k]
      if (v === null || v <= 0 || best[i] === 0) return 0
      return RADAR_STATS[k].lowerIsBetter ? best[i] / v : v / best[i]
    }),
  )
}

/** Aire du polygone du radar (rayons = scores, axes équirépartis). Sert au classement. */
export function radarArea(scores: number[]): number {
  const n = scores.length
  if (n < 3) return 0
  let sum = 0
  for (let i = 0; i < n; i++) sum += scores[i] * scores[(i + 1) % n]
  return 0.5 * Math.sin((2 * Math.PI) / n) * sum
}

/** Aire rapportée au polygone plein (tous les scores à 1) : 0–100. */
export function radarRating(scores: number[]): number {
  const full = radarArea(scores.map(() => 1))
  return full === 0 ? 0 : Math.round((radarArea(scores) / full) * 100)
}
