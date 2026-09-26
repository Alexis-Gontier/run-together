import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getLeaderboardAction } from "@/app/(app)/leaderboard/_actions/get-leaderboard-action"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import { getInitials } from "@/lib/utils/get-initials"

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

const RANK_MEDALS = ["🥇", "🥈", "🥉"]

function EvolutionBadge({ evolution }: { evolution: number | null }) {
  if (evolution === null) return null
  if (evolution === 0) {
    return (
      <span className="flex items-center text-muted-foreground text-xs">
        <Minus className="size-3" />
      </span>
    )
  }
  const positive = evolution > 0
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 font-medium text-xs tabular-nums",
        positive ? "text-green-500" : "text-red-500",
      )}
    >
      {positive ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {Math.abs(evolution)}%
    </span>
  )
}

export default async function HomeRightPanel() {
  const now = new Date()
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`

  const user = await getRequiredUser()
  const result = await getLeaderboardAction({
    metric: "distance",
    period: "month",
  })
  const entries = (result?.data?.entries ?? []).slice(0, 5)

  return (
    <div className="space-y-4 p-4">
      <WeekSummaryCard userId={user.id} />
      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Top du mois</h2>
          <span className="text-muted-foreground text-xs">{monthLabel}</span>
        </div>

        {entries.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-xs">
            Aucune donnée ce mois-ci
          </p>
        ) : (
          <div className="space-y-0.5">
            {entries.map((entry) => (
              <div
                key={entry.user.id}
                className="flex items-center gap-2.5 py-1.5"
              >
                <div className="w-6 shrink-0 text-center">
                  {entry.rank <= 3 ? (
                    <span className="text-sm leading-none">
                      {RANK_MEDALS[entry.rank - 1]}
                    </span>
                  ) : (
                    <span className="font-medium text-muted-foreground text-xs">
                      {entry.rank}
                    </span>
                  )}
                </div>

                <Avatar className="size-7 shrink-0">
                  <AvatarImage src={entry.user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(entry.user.name ?? "")}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm leading-tight">
                    {entry.user.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {entry.totalDistanceKm.toFixed(1)}{" "}
                    <span className="text-[10px]">km</span>
                  </p>
                </div>

                <EvolutionBadge evolution={entry.evolution} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 border-t pt-3">
          <Link
            href={ROUTES.LEADERBOARD}
            className="flex items-center gap-1 font-medium text-primary text-xs hover:underline"
          >
            Voir le classement complet
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
