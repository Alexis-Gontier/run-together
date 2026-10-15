import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { runRoute } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import { formatRunDistance, formatRunDurationDisplay } from "@/lib/utils/run"

type RunFigures = { date: Date; distance: number; duration: number }
export type NearbyRun = RunFigures & { id: string; name: string | null }

/**
 * La course à importer à côté de celle déjà enregistrée au même moment (±30 min) : de quoi
 * voir d'un coup d'œil s'il s'agit de la même sortie, mesurée par une autre montre.
 */
export function NearbyRunComparison({
  candidate,
  existing,
  className,
}: {
  candidate: RunFigures
  existing: NearbyRun
  className?: string
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-2 text-xs", className)}>
      <Column label="Nouvelle" run={candidate} />
      <Column
        label={
          <Link
            href={runRoute(existing.id)}
            target="_blank"
            className="hover:underline"
          >
            Déjà enregistrée{existing.name ? ` · ${existing.name}` : ""}
          </Link>
        }
        run={existing}
      />
    </dl>
  )
}

function Column({ label, run }: { label: React.ReactNode; run: RunFigures }) {
  return (
    <div className="min-w-0 rounded-md bg-muted/50 px-2.5 py-1.5">
      <dt className="truncate text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">
        {format(run.date, "d MMM HH:mm", { locale: fr })} ·{" "}
        {formatRunDistance(run.distance)} km ·{" "}
        {formatRunDurationDisplay(run.duration)}
      </dd>
    </div>
  )
}
