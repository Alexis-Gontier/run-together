import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { PanelCard, PanelStat } from "@/components/ui/panel-card"
import { runRoute } from "@/lib/constants/routes"
import { getUserHighlights } from "@/lib/stats/queries"
import { formatRunDistance, formatRunPace } from "@/lib/utils/run"

const fmt = (v: number) => String(v).replace(".", ",")

/** Faits marquants d'un coureur (panneau du profil). */
export async function HighlightsCard({
  userId,
  className,
}: {
  userId: string
  className?: string
}) {
  const h = await getUserHighlights(userId)
  if (h.runs === 0) return null

  return (
    <PanelCard
      title="En chiffres"
      aside={
        h.since && `depuis ${format(h.since, "MMMM yyyy", { locale: fr })}`
      }
      className={className}
    >
      <div className="grid grid-cols-3 gap-3">
        <PanelStat value={h.runs} label="Courses" />
        <PanelStat
          value={`${fmt(Math.round(h.distanceKm))} km`}
          label="Total"
        />
        <PanelStat value={`${h.elevation} m`} label="D+" />
      </div>
      <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
        {h.longest && (
          <Link
            href={runRoute(h.longest.id)}
            className="flex items-center justify-between gap-2 hover:underline"
          >
            <span className="text-muted-foreground">Plus longue sortie</span>
            <span className="font-medium tabular-nums">
              {formatRunDistance(h.longest.distance).replace(".", ",")} km
            </span>
          </Link>
        )}
        {h.fastest && (
          <Link
            href={runRoute(h.fastest.id)}
            className="flex items-center justify-between gap-2 hover:underline"
          >
            <span className="text-muted-foreground">
              Meilleure allure (≥ 5 km)
            </span>
            <span className="font-medium tabular-nums">
              {formatRunPace(h.fastest.pace)} /km
            </span>
          </Link>
        )}
      </div>
    </PanelCard>
  )
}
