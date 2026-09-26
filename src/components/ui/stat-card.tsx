import type { LucideIcon } from "lucide-react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface StatCardProps {
  label: string
  value: string
  unit?: string
  delta: string
  deltaPositive: boolean | null
  icon: LucideIcon
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaPositive,
  icon: Icon,
}: StatCardProps) {
  const DeltaIcon =
    deltaPositive === true
      ? TrendingUp
      : deltaPositive === false
        ? TrendingDown
        : Minus

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border bg-card px-4 py-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate font-medium text-xs uppercase tracking-wider">
          {label}
        </span>
      </div>

      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate font-bold text-3xl tabular-nums leading-none tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="shrink-0 font-medium text-muted-foreground text-sm">
            {unit}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex items-center gap-1 font-medium text-xs",
          deltaPositive === true && "text-emerald-600 dark:text-emerald-400",
          deltaPositive === false && "text-red-500 dark:text-red-400",
          deltaPositive === null && "text-muted-foreground",
        )}
      >
        <DeltaIcon className="size-3.5 shrink-0" />
        <span className="truncate">{delta}</span>
      </div>
    </div>
  )
}
