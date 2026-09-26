"use client"

import { useTheme } from "next-themes"
import {
  MapControls,
  MapRoute,
  Map as MapView,
  MarkerContent,
  RouteMarker,
} from "@/components/shadcn-ui/map"
import { decodePolyline } from "@/lib/runs/track/decode-polyline"
import { cn } from "@/lib/utils/cn"

const ROUTE_COLOR = "#10b981"

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

/**
 * Carte interactive du parcours (mapcn : MapLibre GL + fonds vectoriels CARTO, gratuits et
 * sans clé, clair / sombre selon le thème). Client uniquement : voir `RunMapLazy`.
 */
export default function RunMap({
  polyline,
  className,
}: {
  polyline: string
  className?: string
}) {
  const { resolvedTheme } = useTheme()
  // MapLibre attend des coordonnées [longitude, latitude].
  const coordinates = decodePolyline(polyline).map(
    ([lat, lng]) => [lng, lat] as [number, number],
  )
  if (coordinates.length < 2) return null

  const lngs = coordinates.map(([lng]) => lng)
  const lats = coordinates.map(([, lat]) => lat)

  return (
    <MapView
      className={cn("size-full", className)}
      theme={resolvedTheme === "light" ? "light" : "dark"}
      bounds={[
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ]}
      fitBoundsOptions={{ padding: 32 }}
      scrollZoom={false}
    >
      <MapControls position="top-right" showZoom showFullscreen />
      <MapRoute
        coordinates={coordinates}
        color={ROUTE_COLOR}
        width={4}
        opacity={0.95}
        interactive={false}
      >
        <RouteMarker at="start">
          <MarkerContent>
            <Dot className="bg-emerald-500" />
          </MarkerContent>
        </RouteMarker>
        <RouteMarker at="end">
          <MarkerContent>
            <Dot className="bg-orange-500" />
          </MarkerContent>
        </RouteMarker>
      </MapRoute>
    </MapView>
  )
}
