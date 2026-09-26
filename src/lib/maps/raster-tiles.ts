const TILE = 256
const MAX_ZOOM = 16

// Fonds de carte gris d'Esri : raster, gratuits, sans clé (attribution requise).
const BASEMAPS = {
  dark: "World_Dark_Gray_Base",
  light: "World_Light_Gray_Base",
} as const

export const tileUrl = (
  z: number,
  x: number,
  y: number,
  style: keyof typeof BASEMAPS = "dark",
) =>
  `https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/${BASEMAPS[style]}/MapServer/tile/${z}/${y}/${x}`
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
        url: tileUrl(zoom, x, ty),
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
