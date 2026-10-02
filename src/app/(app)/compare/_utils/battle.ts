import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"
import type { ComparePeriod, getComparison } from "./comparison"

type Comparison = Awaited<ReturnType<typeof getComparison>>

export type Side = "me" | "other"

export type BattleLine = {
  label: string
  me: number | null
  other: number | null
  /** Valeurs affichées (« — » si absente). */
  meText: string
  otherText: string
  /** Qui marque le point sur cette ligne ; `null` = égalité ou valeur manquante. */
  winner: Side | null
}

export type Battle = {
  stats: BattleLine[]
  records: BattleLine[]
  score: Record<Side, number>
  winner: Side | null
}

/** « sur 3 mois » : complément de phrase pour Discord. */
export const BATTLE_PERIOD_PHRASES: Record<ComparePeriod, string> = {
  "1m": "sur 30 jours",
  "3m": "sur 3 mois",
  "6m": "sur 6 mois",
  "1y": "sur 1 an",
  all: "depuis toujours",
}

const fmt = (v: number) => String(v).replace(".", ",")

function line(
  label: string,
  me: number | null,
  other: number | null,
  display: (v: number) => string,
  // Pour l'allure et les records, plus petit = mieux.
  lowerIsBetter = false,
): BattleLine {
  const winner =
    me === null || other === null || me === other
      ? null
      : (lowerIsBetter ? me < other : me > other)
        ? "me"
        : "other"
  const text = (v: number | null) => (v === null || v === 0 ? "—" : display(v))
  return { label, me, other, meText: text(me), otherText: text(other), winner }
}

/** Une ligne gagnée = 1 point. Le plus de points l'emporte, sinon match nul. */
export function computeBattle(data: Comparison): Battle {
  const stats = [
    line(
      "Distance",
      data.me.distanceKm,
      data.other.distanceKm,
      (v) => `${fmt(v)} km`,
    ),
    line("Courses", data.me.runs, data.other.runs, String),
    line(
      "Allure moyenne",
      data.me.pace,
      data.other.pace,
      (v) => `${formatRunPace(v)} /km`,
      true,
    ),
    line("Dénivelé", data.me.elevation, data.other.elevation, (v) => `${v} m`),
    line(
      "Plus longue",
      data.me.longestKm,
      data.other.longestKm,
      (v) => `${fmt(v)} km`,
    ),
  ]
  const records = data.records.map((r) =>
    line(
      PR_DISTANCE_LABELS[r.distance],
      r.me,
      r.other,
      formatRunDurationDisplay,
      true,
    ),
  )
  const all = [...stats, ...records]
  const score = {
    me: all.filter((l) => l.winner === "me").length,
    other: all.filter((l) => l.winner === "other").length,
  }
  const winner =
    score.me === score.other ? null : score.me > score.other ? "me" : "other"
  return { stats, records, score, winner }
}
