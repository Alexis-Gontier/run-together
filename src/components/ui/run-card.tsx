import Link from "next/link"
import type { Run, User } from "@/generated/prisma/client"
import { cn } from "@/lib/utils/cn"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { DeviceBadge } from "@/components/ui/device-badge"
import { MapboxPolyline } from "@/components/ui/mapbox-polyline"
import { getInitials } from "@/lib/utils/get-initials"
import { profileRoute } from "@/lib/constants/routes"
import { Heart, Flame, Activity } from "lucide-react"
import {
  formatRunDistance,
  formatRunPace,
  formatRunDurationDisplay,
  formatRunDateShort,
} from "@/lib/utils/run"

export type RunWithUser = Run & {
  user: Pick<User, "name" | "username" | "image">
}

// ── RunCardHeader ─────────────────────────────────────────────────────────────

interface RunCardHeaderProps {
  run: RunWithUser
  className?: string
}

export function RunCardHeader({ run, className }: RunCardHeaderProps) {
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
        <p className="truncate text-xs text-muted-foreground">{run.name}</p>
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
    <div className={cn("overflow-hidden border-t", className)}>
      {polyline ? (
        <MapboxPolyline encoded={polyline} className="rounded-none" />
      ) : (
        <Skeleton className="h-55 w-full rounded-none" />
      )}
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
  className?: string
}

export function RunCardStats({ run, className }: RunCardStatsProps) {
  const main = [
    { value: formatRunDistance(run.distance), unit: "km" },
    { value: formatRunPace(run.pace), unit: "/km" },
    { value: formatRunDurationDisplay(run.duration), unit: "durée" },
    { value: `+${Math.round(run.elevation)}m`, unit: "D+" },
  ]

  const hasExtra = !!(run.heartRateAvg || run.cadenceAvg || run.calories)

  return (
    <div className={cn("border-t", className)}>
      <div className="grid grid-cols-4 divide-x">
        {main.map(({ value, unit }) => (
          <div key={unit} className="flex flex-col items-center gap-0.5 py-3.5">
            <span className="text-sm font-semibold tabular-nums">{value}</span>
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
  )
}
