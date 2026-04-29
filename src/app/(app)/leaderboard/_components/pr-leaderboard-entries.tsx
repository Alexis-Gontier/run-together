import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { cn } from "@/lib/utils/cn"
import { getInitials } from "@/lib/utils/get-initials"
import { YouBadge } from "@/components/ui/you-badge"
import { runRoute } from "@/lib/constants/routes"
import { formatRunPace, formatRunDurationDisplay } from "@/lib/utils/run"

type PrEntry = {
  rank: number
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  duration: number
  pace: number
  run: { id: string; name: string | null; date: Date } | null
}

interface Props {
  entries: PrEntry[]
  currentUserId: string
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"]

export function PrLeaderboardEntries({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Aucun record enregistré pour cette distance
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
            {entry.run ? (
              <Link
                href={runRoute(entry.run.id)}
                className="truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                {entry.run.name || "Course sans nom"}
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">
                @{entry.user.username}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-amber-600 tabular-nums dark:text-amber-400">
              {formatRunDurationDisplay(entry.duration)}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatRunPace(entry.pace)}/km
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
