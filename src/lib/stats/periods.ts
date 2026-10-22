import { getPeriodRange } from "@/lib/utils/date"

/** Périodes communes à /compare et /charts. */
export type StatsPeriod = "1m" | "3m" | "6m" | "1y" | "all"

export const STATS_PERIODS: { value: StatsPeriod; label: string }[] = [
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

/** Période lue dans l'URL, « 3 mois » par défaut. */
export function parseStatsPeriod(raw: string | undefined): StatsPeriod {
  return STATS_PERIODS.find((p) => p.value === raw)?.value ?? "3m"
}

/** Fenêtre de la période, terminée le jour `at` (aujourd'hui par défaut). */
export function statsPeriodRange(period: StatsPeriod, at?: Date) {
  const { currentStart, currentEnd } = getPeriodRange(period, DAYS, at)
  return { start: currentStart, end: currentEnd }
}
