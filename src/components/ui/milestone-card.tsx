import { Progress } from "@/components/shadcn-ui/progress"
import { PanelCard } from "@/components/ui/panel-card"
import { nextMilestone } from "@/lib/stats/milestones"
import { getUserHighlights } from "@/lib/stats/queries"

const fmt = (v: number) => String(v).replace(".", ",")

/** Prochain palier de distance cumulée : « 12 km pour atteindre 500 km ». */
export async function MilestoneCard({ userId }: { userId: string }) {
  const { distanceKm } = await getUserHighlights(userId)
  const m = nextMilestone(distanceKm)

  return (
    <PanelCard
      title="Prochain palier"
      aside={`${fmt(Math.round(distanceKm))} km au total`}
    >
      <p className="text-sm">
        Plus que{" "}
        <span className="font-semibold tabular-nums">
          {fmt(m.remainingKm)} km
        </span>{" "}
        pour atteindre{" "}
        <span className="font-semibold tabular-nums">{m.next} km</span>
      </p>
      <Progress value={m.progress * 100} className="mt-3 h-2" />
      <div className="mt-1.5 flex justify-between text-muted-foreground text-xs tabular-nums">
        <span>{m.previous} km</span>
        <span>{m.next} km</span>
      </div>
    </PanelCard>
  )
}
