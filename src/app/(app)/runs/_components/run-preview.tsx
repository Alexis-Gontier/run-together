import { FeedCard } from "@/components/ui/feed-card"
import {
  RunCardHeader,
  RunCardMap,
  RunCardStats,
  type RunWithUser,
} from "@/components/ui/run-card"
import { computePace } from "@/lib/runs/pace"

type RunPreviewProps = {
  user: RunWithUser["user"]
  name: string
  date: Date
  deviceName: string | null
  distance: number // mètres
  duration: number // secondes
  elevation: number
  heartRateAvg: number | null
  heartRateMax: number | null
  cadenceAvg: number | null
  calories: number | null
  polyline: string | null
  splits: number | null // null : pas de données de fichier
  source: string | null
}

/**
 * La course telle qu'elle apparaîtra dans le fil (mêmes composants que `FeedList`), recalculée
 * à chaque frappe, avec en dessous l'origine des données (fichier, tracé, splits).
 */
export function RunPreview({
  user,
  name,
  date,
  deviceName,
  distance,
  duration,
  elevation,
  heartRateAvg,
  heartRateMax,
  cadenceAvg,
  calories,
  polyline,
  splits,
  source,
}: RunPreviewProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* `isolate` : les z-20 de l'en-tête restent sous la barre d'action collante. */}
      <FeedCard className="isolate overflow-hidden rounded-xl border">
        <RunCardHeader
          run={{ name, date, deviceName, source: "MANUAL", user }}
        />
        {polyline && <RunCardMap polyline={polyline} />}
        <RunCardStats
          hasMap={!!polyline}
          run={{
            distance,
            duration,
            pace: computePace(distance, duration),
            elevation,
            heartRateAvg,
            heartRateMax,
            cadenceAvg,
            calories,
          }}
        />
      </FeedCard>

      {splits != null && (
        <div className="flex items-center gap-3 px-1 text-muted-foreground text-xs">
          <span className="flex min-w-0 items-center gap-1.5">
            {source && <span className="truncate font-medium">{source}</span>}
            {source && <span aria-hidden>·</span>}
            <span className="shrink-0">
              {polyline ? "Tracé GPS" : "Sans tracé GPS"}
              {splits > 0 && ` · ${splits} splits`}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
