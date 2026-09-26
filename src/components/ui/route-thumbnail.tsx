import { MAP_ATTRIBUTION, mapViewport, tileUrl } from "@/lib/maps/raster-tiles"
import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { cn } from "@/lib/utils/cn"

// Repère en 2× de l'affichage (≈ 600 × 220) : tuiles nettes sur écran haute densité.
const WIDTH = 1200
const HEIGHT = 440
const PADDING = 48
const pct = (v: number, of: number) => `${(v / of) * 100}%`

/**
 * Miniature du tracé : tuiles raster statiques (Esri gris, clair/sombre selon le thème,
 * chargées en différé) + tracé SVG. Pas de carte interactive — adaptée aux listes
 * (fil, profil) où des dizaines de MapLibre seraient trop lourdes.
 */
export function RouteThumbnail({
  polyline,
  className,
}: {
  polyline: string
  className?: string
}) {
  const view = mapViewport(decodePolyline(polyline), WIDTH, HEIGHT, PADDING)
  if (!view) return null

  return (
    <div
      className={cn("relative aspect-600/220 w-full bg-muted/40", className)}
    >
      {(["light", "dark"] as const).flatMap((style) =>
        (["base", "labels"] as const).flatMap((layer) =>
          (layer === "base" ? view.tiles : view.labelTiles).map((t) => (
            // biome-ignore lint/performance/noImgElement: tuiles externes, pas d'optimisation Next utile
            <img
              key={`${style}-${layer}-${t.z}-${t.x}-${t.y}`}
              src={tileUrl(t.z, t.x, t.y, style, layer)}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className={cn(
                "absolute max-w-none select-none",
                // Les noms passent au-dessus du tracé : sous lui, il les masquerait.
                layer === "labels" && "z-10",
                style === "light" ? "dark:hidden" : "hidden dark:block",
              )}
              style={{
                left: pct(t.left, WIDTH),
                top: pct(t.top, HEIGHT),
                width: pct(t.size, WIDTH),
                height: pct(t.size, HEIGHT),
              }}
            />
          )),
        ),
      )}
      {/* Assombrit le gris Esri, comme l'image Discord (`MAP_TINT`). */}
      <div className="absolute inset-0 dark:bg-black/40" />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 size-full"
        role="img"
        aria-label="Tracé du parcours"
      >
        <path
          d={view.path}
          fill="none"
          className="stroke-emerald-500/25"
          strokeWidth={20}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={view.path}
          fill="none"
          className="stroke-emerald-500"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={view.start.x}
          cy={view.start.y}
          r={11}
          className="fill-foreground"
        />
      </svg>
      <span className="absolute right-1.5 bottom-1 text-[9px] text-muted-foreground/70">
        {MAP_ATTRIBUTION}
      </span>
    </div>
  )
}
