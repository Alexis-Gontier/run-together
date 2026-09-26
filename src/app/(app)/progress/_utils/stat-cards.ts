import { Activity, Gauge, Map as MapIcon, Mountain } from "lucide-react"
import type { StatCardProps } from "@/components/ui/stat-card"
import { formatPace } from "@/lib/utils/run"

type Totals = {
  totalDistanceKm: number
  totalRuns: number
  avgPaceSecPerKm: number | null
  totalElevationM: number
}

const round1 = (v: number) => Math.round(v * 10) / 10

/** Écart à la période précédente, ou « — » sans comparaison possible (période « Tout »). */
function delta(
  current: number,
  previous: number | undefined,
  unit = "",
): Pick<StatCardProps, "delta" | "deltaPositive"> {
  if (previous === undefined) return { delta: "—", deltaPositive: null }
  const diff = round1(current - previous)
  if (diff === 0) return { delta: "= période préc.", deltaPositive: null }
  return {
    delta: `${diff > 0 ? "+" : ""}${String(diff).replace(".", ",")}${unit} vs période préc.`,
    deltaPositive: diff > 0,
  }
}

export function buildProgressStatCards(
  current: Totals,
  previous: Totals | null,
): StatCardProps[] {
  const pace = current.avgPaceSecPerKm
  const prevPace = previous?.avgPaceSecPerKm ?? null
  const paceDiff = pace !== null && prevPace !== null ? pace - prevPace : null

  return [
    {
      label: "Distance",
      value: String(round1(current.totalDistanceKm)).replace(".", ","),
      unit: "km",
      icon: MapIcon,
      ...delta(current.totalDistanceKm, previous?.totalDistanceKm, " km"),
    },
    {
      label: "Courses",
      value: String(current.totalRuns),
      icon: Activity,
      ...delta(current.totalRuns, previous?.totalRuns),
    },
    {
      label: "Allure moy.",
      value: pace !== null ? formatPace(pace) : "—",
      unit: pace !== null ? "/km" : undefined,
      icon: Gauge,
      delta:
        paceDiff === null || paceDiff === 0
          ? "—"
          : `${paceDiff < 0 ? "−" : "+"}${Math.abs(paceDiff)} s vs période préc.`,
      // Une allure qui baisse est un progrès.
      deltaPositive: paceDiff === null || paceDiff === 0 ? null : paceDiff < 0,
    },
    {
      label: "Dénivelé",
      value: String(current.totalElevationM),
      unit: "m",
      icon: Mountain,
      ...delta(current.totalElevationM, previous?.totalElevationM, " m"),
    },
  ]
}
