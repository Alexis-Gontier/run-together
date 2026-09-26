import { Trophy } from "lucide-react"
import { PanelCard, PanelStat } from "@/components/ui/panel-card"
import { profileRoute } from "@/lib/constants/routes"
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { getRunInsights } from "@/lib/stats/queries"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"

type Props = {
  params: Promise<{ id: string }>
}

/** Contexte de la course : records établis, écart à l'allure habituelle de l'auteur. */
export default async function RunRightPanel({ params }: Props) {
  const { id } = await params
  // `/runs/new` tombe aussi dans ce slot : pas de course, pas de panneau.
  const insights = await getRunInsights(id)
  if (!insights) return null

  const { user, pace, averagePace, runsCount, records } = insights
  const diff = averagePace !== null ? pace - averagePace : null

  return (
    <div className="space-y-4 p-4">
      <PanelCard
        title="Par rapport à d'habitude"
        link={
          user.username
            ? {
                href: profileRoute(user.username),
                label: `Profil de ${user.name}`,
              }
            : undefined
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <PanelStat
            value={`${formatRunPace(pace)} /km`}
            label="Cette course"
          />
          <PanelStat
            value={averagePace ? `${formatRunPace(averagePace)} /km` : "—"}
            label={`Moyenne sur ${runsCount} courses`}
          />
        </div>
        {diff !== null && diff !== 0 && (
          <p className="mt-3 text-muted-foreground text-xs">
            {diff < 0
              ? `${Math.abs(diff)} s/km plus rapide que d'habitude`
              : `${diff} s/km plus lente que d'habitude`}
          </p>
        )}
      </PanelCard>

      {records.length > 0 && (
        <PanelCard title="Records établis">
          <ul className="space-y-1.5 text-sm">
            {records.map((r) => (
              <li key={r.distance} className="flex items-center gap-2">
                <Trophy className="size-3.5 text-amber-500" />
                <span className="flex-1">{PR_DISTANCE_LABELS[r.distance]}</span>
                <span className="font-medium tabular-nums">
                  {formatRunDurationDisplay(r.duration)}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>
      )}
    </div>
  )
}
