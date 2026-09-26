const TILE = 256
const MAX_ZOOM = 16

// Fond de carte gris foncé d'Esri : raster, gratuit, sans clé (attribution requise).
const TILE_URL = (z: number, x: number, y: number) =>
  `https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`
export const MAP_ATTRIBUTION = "© Esri, HERE, Garmin, © OpenStreetMap"

/** Web Mercator : [lat, lng] → pixels monde au zoom donné. */
function project([lat, lng]: [number, number], zoom: number) {
  const size = TILE * 2 ** zoom
  const sin = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  }
}

export type MapViewport = {
  zoom: number
  tiles: { x: number; y: number; left: number; top: number; url: string }[]
  /** Attribut `d` du tracé, dans le repère de l'image. */
  path: string
  start: { x: number; y: number }
  end: { x: number; y: number }
}

/**
 * Cadre le tracé dans `width` × `height` (marge `padding`) : plus grand zoom entier où il
 * tient, centré. Renvoie les tuiles à poser et le tracé projeté dans le même repère.
 */
export function mapViewport(
  points: [number, number][],
  width: number,
  height: number,
  padding: number,
): MapViewport | null {
  if (points.length < 2) return null

  let zoom = MAX_ZOOM
  let px = points.map((p) => project(p, zoom))
  const span = () => {
    const xs = px.map((p) => p.x)
    const ys = px.map((p) => p.y)
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    }
  }
  let b = span()
  while (
    zoom > 1 &&
    (b.maxX - b.minX > width - padding * 2 ||
      b.maxY - b.minY > height - padding * 2)
  ) {
    zoom--
    px = points.map((p) => project(p, zoom))
    b = span()
  }

  // Coin haut-gauche de l'image, en pixels monde.
  const originX = (b.minX + b.maxX) / 2 - width / 2
  const originY = (b.minY + b.maxY) / 2 - height / 2
  const count = 2 ** zoom

  const tiles: MapViewport["tiles"] = []
  for (
    let ty = Math.floor(originY / TILE);
    ty <= Math.floor((originY + height) / TILE);
    ty++
  ) {
    if (ty < 0 || ty >= count) continue
    for (
      let tx = Math.floor(originX / TILE);
      tx <= Math.floor((originX + width) / TILE);
      tx++
    ) {
      const x = ((tx % count) + count) % count
      tiles.push({
        x,
        y: ty,
        left: Math.round(tx * TILE - originX),
        top: Math.round(ty * TILE - originY),
        url: TILE_URL(zoom, x, ty),
      })
    }
  }

  const local = px.map((p) => ({ x: p.x - originX, y: p.y - originY }))
  return {
    zoom,
    tiles,
    path: local
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      )
      .join(" "),
    start: local[0],
    end: local[local.length - 1],
  }
}

/**
 * Télécharge les tuiles en data URLs (Satori ne gère pas bien les échecs réseau).
 * `null` si l'une échoue : l'image retombe alors sur le tracé seul.
 */
export async function fetchTiles(
  tiles: MapViewport["tiles"],
  timeoutMs = 4000,
): Promise<string[] | null> {
  try {
    return await Promise.all(
      tiles.map(async (t) => {
        const res = await fetch(t.url, {
          signal: AbortSignal.timeout(timeoutMs),
          next: { revalidate: 60 * 60 * 24 * 30 },
        })
        if (!res.ok) throw new Error(`tile ${res.status}`)
        const type = res.headers.get("content-type") ?? "image/jpeg"
        const data = Buffer.from(await res.arrayBuffer()).toString("base64")
        return `data:${type};base64,${data}`
      }),
    )
  } catch (err) {
    console.error("[og] map tiles failed", err)
    return null
  }
}
