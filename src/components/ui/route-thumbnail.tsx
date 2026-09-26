import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { routeSvgPath } from "@/lib/runs/track/route-svg"
import { cn } from "@/lib/utils/cn"

const WIDTH = 600
const HEIGHT = 220
const PADDING = 20

/**
 * Miniature du tracé en SVG pur : aucune tuile de carte, rien à charger — adaptée aux listes
 * (fil, profil) où des dizaines de cartes interactives seraient trop lourdes.
 */
export function RouteThumbnail({
  polyline,
  className,
}: {
  polyline: string
  className?: string
}) {
  const points = decodePolyline(polyline)
  const d = routeSvgPath(points, WIDTH, HEIGHT, PADDING)
  if (!d) return null

  const [start] = d.slice(1).split(" L")
  const [x, y] = start.split(" ").map(Number)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("h-auto w-full bg-muted/40", className)}
      role="img"
      aria-label="Tracé du parcours"
    >
      <path
        d={d}
        fill="none"
        className="stroke-emerald-500/25"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        className="stroke-emerald-500"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x} cy={y} r={6} className="fill-foreground" />
    </svg>
  )
}
