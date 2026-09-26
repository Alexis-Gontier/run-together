"use client"

import type { LatLngBoundsExpression } from "leaflet"
import { useEffect } from "react"
import { useMap } from "react-leaflet"
import {
  Map as LeafletMap,
  MapFullscreenControl,
  MapMarker,
  MapPolyline,
  MapTileLayer,
  MapZoomControl,
} from "@/components/shadcn-ui/map"
import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { cn } from "@/lib/utils/cn"

// Les fonds CARTO (défaut de shadcn-map) exigent désormais une clé : tuiles OpenStreetMap, sans
// clé, passées en niveaux de gris (inversées en mode sombre). L'attribution OSM est obligatoire.
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

/**
 * `bounds` n'est lu qu'au montage de MapContainer, avant que le conteneur (chargé en différé)
 * ait sa taille : on recalcule la taille puis on recadre une fois la carte prête.
 */
function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()
  // Clé stable : le tableau `bounds` est recréé à chaque rendu.
  const key = JSON.stringify(bounds)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize()
      map.fitBounds(JSON.parse(key), { padding: [24, 24], animate: false })
    })
    // Annulé si la carte est démontée avant (double montage en dev, navigation rapide).
    return () => cancelAnimationFrame(frame)
  }, [map, key])
  return null
}

function Dot({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "block size-3.5 rounded-full border-2 border-white shadow",
        className,
      )}
    />
  )
}

/** Carte interactive du parcours (Leaflet via shadcn-map). Client uniquement : voir `RunMapLazy`. */
export default function RunMap({
  polyline,
  className,
}: {
  polyline: string
  className?: string
}) {
  const points = decodePolyline(polyline)
  if (points.length < 2) return null

  const lats = points.map(([lat]) => lat)
  const lngs = points.map(([, lng]) => lng)
  const bounds: LatLngBoundsExpression = [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]

  return (
    <div className={cn("relative size-full", className)}>
      <LeafletMap
        center={points[0]}
        scrollWheelZoom={false}
        className="z-0 min-h-0 rounded-none"
      >
        <MapTileLayer
          url={OSM_TILES}
          darkUrl={OSM_TILES}
          className="filter-[grayscale(1)_contrast(0.9)] dark:filter-[grayscale(1)_invert(1)_brightness(0.85)_contrast(0.9)]"
        />
        <FitBounds bounds={bounds} />
        <MapZoomControl />
        <MapFullscreenControl />
        <MapPolyline
          positions={points}
          className="fill-none stroke-4 stroke-emerald-500"
        />
        <MapMarker
          position={points[0]}
          icon={<Dot className="bg-emerald-500" />}
          iconAnchor={[7, 7]}
        />
        <MapMarker
          position={points[points.length - 1]}
          icon={<Dot className="bg-orange-500" />}
          iconAnchor={[7, 7]}
        />
      </LeafletMap>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute right-1 bottom-1 z-10 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
      >
        © OpenStreetMap
      </a>
    </div>
  )
}
