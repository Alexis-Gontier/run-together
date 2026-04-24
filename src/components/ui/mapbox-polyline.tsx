import { env } from "@/env"
import { cn } from "@/lib/utils/cn"

type MapboxPolylineProps = {
  encoded: string
  className?: string
}

export function MapboxPolyline({ encoded, className }: MapboxPolylineProps) {
  const path = `path-3+FC4C02-0.8(${encodeURIComponent(encoded)})`
  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${path}/auto/550x220@2x?padding=40&access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Carte du parcours"
      width={550}
      height={220}
      className={cn("w-full rounded-md", className)}
    />
  )
}
