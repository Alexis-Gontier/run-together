import { Activity, Map, Gauge, Mountain } from "lucide-react"
import type { StatCardProps } from "../_components/stat-card"
import { formatPace } from "@/lib/utils/run"
import type { getRunsStatsAction } from "../_actions/get-runs-stats-action"

export type GlobalStats = NonNullable<
  Awaited<ReturnType<typeof getRunsStatsAction>>["data"]
>["globalStats"]

function monthDelta(
  value: number,
  unit?: string,
): { text: string; positive: boolean | null } {
  if (value === 0) return { text: "—", positive: null }
  const suffix = unit ? ` ${unit} ce mois` : " ce mois"
  return { text: `+${value}${suffix}`, positive: value > 0 }
}

function paceDelta(sec: number | null): {
  text: string
  positive: boolean | null
} {
  if (sec === null) return { text: "—", positive: null }
  const sign = sec < 0 ? "-" : "+"
  return { text: `${sign}${Math.abs(sec)}s vs mois dernier`, positive: sec < 0 }
}

export function buildStatCards(stats: GlobalStats): StatCardProps[] {
  const runs = monthDelta(stats.totalRunsMonthDelta)
  const dist = monthDelta(stats.totalDistanceMonthDeltaKm)
  const pace = paceDelta(stats.avgPaceMonthDeltaSec)
  const elev = monthDelta(stats.totalElevationMonthDeltaM, "m")

  return [
    {
      label: "Courses",
      value: stats.totalRuns.toLocaleString("fr-FR"),
      delta: runs.text,
      deltaPositive: runs.positive,
      icon: Activity,
    },
    {
      label: "Distance",
      value: stats.totalDistanceKm.toLocaleString("fr-FR"),
      unit: "km",
      delta: dist.text,
      deltaPositive: dist.positive,
      icon: Map,
    },
    {
      label: "Allure moy.",
      value: formatPace(stats.avgPaceSecPerKm),
      unit: "/km",
      delta: pace.text,
      deltaPositive: pace.positive,
      icon: Gauge,
    },
    {
      label: "Dénivelé",
      value: stats.totalElevationM.toLocaleString("fr-FR"),
      unit: "m",
      delta: elev.text,
      deltaPositive: elev.positive,
      icon: Mountain,
    },
  ]
}
