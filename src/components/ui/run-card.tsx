import Link from "next/link"
import type { Run, Split, User } from "@/generated/prisma/client"
import type { PRDistance } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils/cn"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { Badge } from "@/components/shadcn-ui/badge"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { DeviceBadge } from "@/components/ui/device-badge"
import { MapboxPolyline } from "@/components/ui/mapbox-polyline"
import { getInitials } from "@/lib/utils/get-initials"
import { profileRoute } from "@/lib/constants/routes"
import { Heart, Flame, Activity } from "lucide-react"
import { Progress } from "@/components/shadcn-ui/progress"
import {
  formatRunDistance,
  formatRunPace,
  formatRunDurationDisplay,
  formatRunDateShort,
} from "@/lib/utils/run"
import { PR_DISTANCE_LABELS } from "@/lib/strava/pr-display"

export type RunWithUser = Run & {
  user: Pick<User, "name" | "username" | "image">
}

// ── RunCardHeader ─────────────────────────────────────────────────────────────

interface RunCardHeaderProps {
  run: RunWithUser
  prs?: PRDistance[]
  className?: string
}

export function RunCardHeader({ run, prs, className }: RunCardHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 p-4", className)}>
      <Link
        href={profileRoute(run.user.username!)}
        className="relative z-20 shrink-0"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={run.user.image ?? undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(run.user.name)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link
            href={profileRoute(run.user.username!)}
            className="relative z-20 text-sm font-semibold hover:underline"
          >
            {run.user.username}
          </Link>
          <span className="text-xs text-muted-foreground">
            · {formatRunDateShort(run.date)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs text-muted-foreground">{run.name}</p>
          {prs && prs.length > 0 && (
            <div className="relative z-20 flex shrink-0 gap-1">
              {prs.map((pr) => (
                <Badge
                  key={pr}
                  className="h-4 border-amber-300 bg-amber-50 px-1.5 text-[10px] text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  variant="outline"
                >
                  PR {PR_DISTANCE_LABELS[pr]}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-20 shrink-0">
        <DeviceBadge deviceName={run.deviceName} source={run.source} />
      </div>
    </div>
  )
}

// ── RunCardMap ────────────────────────────────────────────────────────────────

interface RunCardMapProps {
  polyline?: string | null
  className?: string
}

export function RunCardMap({ polyline, className }: RunCardMapProps) {
  return (
    <div className={cn("px-4 pt-1", className)}>
      <div className="overflow-hidden rounded-t-lg border border-b-0">
        {polyline ? (
          <MapboxPolyline encoded={polyline} className="rounded-none" />
        ) : (
          <Skeleton className="h-55 w-full rounded-none" />
        )}
      </div>
    </div>
  )
}

// ── RunCardStats ──────────────────────────────────────────────────────────────

type RunStatsData = Pick<
  Run,
  | "distance"
  | "pace"
  | "duration"
  | "elevation"
  | "heartRateAvg"
  | "heartRateMax"
  | "cadenceAvg"
  | "calories"
>

interface RunCardStatsProps {
  run: RunStatsData
  hasMap?: boolean
  className?: string
}

export function RunCardStats({
  run,
  hasMap = false,
  className,
}: RunCardStatsProps) {
  const main = [
    { value: formatRunDistance(run.distance), unit: "km" },
    { value: formatRunPace(run.pace), unit: "/km" },
    { value: formatRunDurationDisplay(run.duration), unit: "durée" },
    { value: `+${Math.round(run.elevation)}m`, unit: "D+" },
  ]

  const hasExtra = !!(run.heartRateAvg || run.cadenceAvg || run.calories)

  return (
    <div className={cn("px-4 pb-4", !hasMap && "pt-3", className)}>
      <div
        className={cn(
          "overflow-hidden border",
          hasMap ? "rounded-b-lg" : "rounded-lg",
        )}
      >
        <div className="grid grid-cols-4 divide-x">
          {main.map(({ value, unit }) => (
            <div key={unit} className="flex flex-col items-center gap-0.5 py-3">
              <span className="text-sm font-semibold tabular-nums">
                {value}
              </span>
              <span className="text-[11px] text-muted-foreground">{unit}</span>
            </div>
          ))}
        </div>

        {hasExtra && (
          <div className="flex items-center justify-around border-t px-4 py-2.5">
            {run.heartRateAvg && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                {run.heartRateAvg}
                {run.heartRateMax ? `/${run.heartRateMax}` : ""} bpm
              </span>
            )}
            {run.cadenceAvg && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-blue-500" />
                {run.cadenceAvg} spm
              </span>
            )}
            {run.calories && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                {run.calories} kcal
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── RunCardSplits ─────────────────────────────────────────────────────────────

function splitPaceCategory(
  pace: number,
  min: number,
  max: number,
): "fast" | "medium" | "slow" {
  const range = max - min || 1
  if (pace <= min + range * 0.33) return "fast"
  if (pace <= min + range * 0.66) return "medium"
  return "slow"
}

const categoryStyle = {
  fast: {
    badge: "bg-green-500 text-white",
    dot: "bg-green-500",
    progress: "[&_[data-slot=progress-indicator]]:bg-green-500",
  },
  medium: {
    badge: "bg-orange-500 text-white",
    dot: "bg-orange-500",
    progress: "[&_[data-slot=progress-indicator]]:bg-orange-500",
  },
  slow: {
    badge: "bg-red-500 text-white",
    dot: "bg-red-500",
    progress: "[&_[data-slot=progress-indicator]]:bg-red-500",
  },
}

interface RunCardSplitsProps {
  splits: Split[]
  className?: string
}

export function RunCardSplits({ splits, className }: RunCardSplitsProps) {
  if (splits.length === 0) return null

  const paces = splits.map((s) => s.pace)
  const minPace = Math.min(...paces)
  const maxPace = Math.max(...paces)
  const bestKm = splits.find((s) => s.pace === minPace)!.kilometer
  const hasHR = splits.some((s) => s.heartRate != null)
  const hasElevation = splits.some((s) => s.elevation != null)

  const gridTemplate = [
    "2.5rem",
    "1fr",
    "5rem",
    ...(hasHR ? ["5.5rem"] : []),
    ...(hasElevation ? ["3.5rem"] : []),
  ].join(" ")

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-semibold">Splits (km)</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {(["fast", "medium", "slow"] as const).map((cat) => (
            <span key={cat} className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  categoryStyle[cat].dot,
                )}
              />
              {cat === "fast" ? "RAPIDE" : cat === "medium" ? "MOYEN" : "LENT"}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div
          className="grid px-4 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <span>Km</span>
          <span>Allure</span>
          <span className="text-right">Temps</span>
          {hasHR && <span className="text-right">FC</span>}
          {hasElevation && <span className="text-right">D+</span>}
        </div>

        {splits.map((split) => {
          const cat = splitPaceCategory(split.pace, minPace, maxPace)
          const { badge, progress } = categoryStyle[cat]
          const barWidth = (minPace / split.pace) * 100
          const isBest = split.kilometer === bestKm
          const isWorst =
            split.kilometer ===
            splits.find((s) => s.pace === maxPace)!.kilometer

          return (
            <div
              key={split.id}
              className="grid items-center border-t px-4 py-2.5"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <span className="text-sm font-medium">{split.kilometer}</span>
              <div className="flex items-center gap-2 pr-2">
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    badge,
                  )}
                >
                  {formatRunPace(split.pace)}
                </span>
                {isBest && (
                  <span className="shrink-0 text-[11px] text-green-500">
                    RAPIDE
                  </span>
                )}
                {isWorst && (
                  <span className="shrink-0 text-[11px] text-red-500">
                    LENT
                  </span>
                )}
                <Progress
                  value={barWidth}
                  className={cn("h-2 flex-1", progress)}
                />
              </div>
              <span className="text-right text-sm text-muted-foreground tabular-nums">
                {formatRunDurationDisplay(split.duration)}
              </span>
              {hasHR && (
                <span className="text-right text-sm tabular-nums">
                  {split.heartRate ? (
                    <>
                      <span className="font-medium">{split.heartRate}</span>
                      <span className="text-muted-foreground"> bpm</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
              )}
              {hasElevation && (
                <span className="text-right text-sm text-muted-foreground tabular-nums">
                  {split.elevation != null
                    ? `${Math.round(split.elevation) >= 0 ? "+" : ""}${Math.round(split.elevation)}m`
                    : "—"}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
