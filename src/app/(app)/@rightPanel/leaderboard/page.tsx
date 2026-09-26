import { getLeaderboardAction } from "@/app/(app)/leaderboard/_actions/get-leaderboard-action"
import type { LeaderboardPeriod } from "@/app/(app)/leaderboard/_schemas/leaderboard-schema"
import { PanelCard } from "@/components/ui/panel-card"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { formatRunPace } from "@/lib/utils/run"

type Props = {
  searchParams: Promise<{ period?: string }>
}

const PERIODS: LeaderboardPeriod[] = ["week", "month", "3m", "6m", "1y", "all"]
const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  week: "7 derniers jours",
  month: "30 derniers jours",
  "3m": "3 derniers mois",
  "6m": "6 derniers mois",
  "1y": "12 derniers mois",
  all: "depuis le début",
}

const METRICS = [
  { metric: "distance", label: "Distance" },
  { metric: "runs", label: "Courses" },
  { metric: "pace", label: "Allure" },
] as const

/** « Mes positions » : mon rang sur chaque métrique, pour la période affichée à gauche. */
export default async function LeaderboardRightPanel({ searchParams }: Props) {
  const { period: raw } = await searchParams
  const period = PERIODS.find((p) => p === raw) ?? "month"
  const user = await getRequiredUser()

  const results = await Promise.all(
    METRICS.map(({ metric }) => getLeaderboardAction({ metric, period })),
  )

  return (
    <div className="p-4">
      <PanelCard title="Mes positions" aside={PERIOD_LABELS[period]}>
        <ul className="divide-y text-sm">
          {METRICS.map(({ metric, label }, i) => {
            const entries = results[i]?.data?.entries ?? []
            const me = entries.find((e) => e.user.id === user.id)
            const value = !me
              ? null
              : metric === "distance"
                ? `${String(me.totalDistanceKm).replace(".", ",")} km`
                : metric === "runs"
                  ? `${me.totalRuns} course${me.totalRuns > 1 ? "s" : ""}`
                  : me.avgPaceSecPerKm
                    ? `${formatRunPace(me.avgPaceSecPerKm)} /km`
                    : "—"
            return (
              <li
                key={metric}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="text-muted-foreground">{label}</span>
                {me ? (
                  <span className="text-right">
                    <span className="font-semibold tabular-nums">
                      {me.rank}
                      <sup>{me.rank === 1 ? "er" : "e"}</sup>
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {entries.length}
                    </span>
                    <span className="block text-muted-foreground text-xs tabular-nums">
                      {value}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    Pas classé
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </PanelCard>
    </div>
  )
}
