import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { cn } from "@/lib/utils/cn"
import { getInitials } from "@/lib/utils/get-initials"
import { formatRunPace } from "@/lib/utils/run"
import { YouBadge } from "@/components/ui/you-badge"
import type { LeaderboardMetric } from "../_schemas/leaderboard-schema"

type Entry = {
  rank: number
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  totalDistanceKm: number
  totalRuns: number
  avgPaceSecPerKm: number | null
  evolution: number | null
}

interface Props {
  entries: Entry[]
  metric: LeaderboardMetric
  currentUserId: string
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"]

function MetricValue({
  entry,
  metric,
}: {
  entry: Entry
  metric: LeaderboardMetric
}) {
  if (metric === "distance") {
    return (
      <>
        {entry.totalDistanceKm.toFixed(1)}
        <span className="ml-1 text-xs text-muted-foreground">km</span>
      </>
    )
  }
  if (metric === "runs") {
    return (
      <>
        {entry.totalRuns}
        <span className="ml-1 text-xs text-muted-foreground">
          {entry.totalRuns === 1 ? "course" : "courses"}
        </span>
      </>
    )
  }
  if (entry.avgPaceSecPerKm === null) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <>
      {formatRunPace(entry.avgPaceSecPerKm)}
      <span className="ml-1 text-xs text-muted-foreground">/km</span>
    </>
  )
}

function EvolutionBadge({ evolution }: { evolution: number | null }) {
  if (evolution === null) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  if (evolution === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="size-3" />
      </span>
    )
  }
  const positive = evolution > 0
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium",
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

export function LeaderboardEntries({ entries, metric, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Aucune donnée pour cette période
      </p>
    )
  }

  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-lg border">
      {entries.map((entry, i) => (
        <div
          key={entry.user.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            i > 0 && "border-t",
          )}
        >
          <div className="w-7 shrink-0 text-center">
            {entry.rank <= 3 ? (
              <span className="text-base">{RANK_MEDALS[entry.rank - 1]}</span>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {entry.rank}
              </span>
            )}
          </div>

          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={entry.user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(entry.user.name ?? "")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">
                {entry.user.name}
              </span>
              {entry.user.id === currentUserId && <YouBadge />}
            </div>
            {entry.user.username && (
              <p className="truncate text-xs text-muted-foreground">
                @{entry.user.username}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tabular-nums">
              <MetricValue entry={entry} metric={metric} />
            </span>
            <div className="flex w-14 justify-end">
              <EvolutionBadge evolution={entry.evolution} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
