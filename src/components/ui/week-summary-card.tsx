import { Flame } from "lucide-react"
import { PanelCard, PanelStat } from "@/components/ui/panel-card"
import { ROUTES } from "@/lib/constants/routes"
import { getWeekSummary } from "@/lib/stats/queries"
import { cn } from "@/lib/utils/cn"

const fmt = (v: number) => String(v).replace(".", ",")

/** « Ma semaine » : km, courses, D+, écart à la semaine passée, série en cours. */
export async function WeekSummaryCard({
  userId,
  className,
}: {
  userId: string
  className?: string
}) {
  const week = await getWeekSummary(userId)
  const diff = Math.round((week.distanceKm - week.previousDistanceKm) * 10) / 10

  return (
    <PanelCard
      title="Ma semaine"
      aside={
        diff !== 0 && (
          <span className={cn(diff > 0 ? "text-emerald-500" : undefined)}>
            {diff > 0 ? "+" : ""}
            {fmt(diff)} km vs sem. passée
          </span>
        )
      }
      link={{ href: ROUTES.PROGRESS, label: "Voir ma progression" }}
      className={className}
    >
      <div className="grid grid-cols-3 gap-3">
        <PanelStat value={`${fmt(week.distanceKm)} km`} label="Distance" />
        <PanelStat
          value={week.runs}
          label={week.runs > 1 ? "Courses" : "Course"}
        />
        <PanelStat value={`${week.elevation} m`} label="D+" />
      </div>
      {week.currentStreak > 1 && (
        <p className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
          <Flame className="size-3.5 text-orange-500" />
          {week.currentStreak} jours de suite
        </p>
      )}
    </PanelCard>
  )
}
