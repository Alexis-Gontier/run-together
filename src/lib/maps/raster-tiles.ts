const TILE = 256
const MAX_ZOOM = 16

// Fonds de carte gris d'Esri : raster, gratuits, sans clé (attribution requise).
// `labels` = noms de lieux et de rues sur fond transparent, à superposer au fond.
const LAYERS = {
  dark: { base: "World_Dark_Gray_Base", labels: "World_Dark_Gray_Reference" },
  light: {
    base: "World_Light_Gray_Base",
    labels: "World_Light_Gray_Reference",
  },
} as const

export type TileStyle = keyof typeof LAYERS

export const tileUrl = (
  z: number,
  x: number,
  y: number,
  style: TileStyle = "dark",
  layer: "base" | "labels" = "base",
) =>
  `https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/${LAYERS[style][layer]}/MapServer/tile/${z}/${y}/${x}`
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

export type MapTile = {
  z: number
  x: number
  y: number
  /** Position et taille dans le repère de l'image. */
  left: number
  top: number
  size: number
}

export type MapViewport = {
  zoom: number
  tiles: MapTile[]
  /**
   * Tuiles de noms un zoom en dessous, affichées en 2× : le texte garde une taille lisible
   * quand l'image est rendue à moitié de sa résolution (miniatures haute densité).
   */
  labelTiles: MapTile[]
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
  const local = px.map((p) => ({ x: p.x - originX, y: p.y - originY }))
  return {
    zoom,
    tiles: coverTiles(zoom, originX, originY, width, height),
    labelTiles:
      zoom > 1
        ? coverTiles(zoom - 1, originX / 2, originY / 2, width, height, 2)
        : [],
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
 * Tuiles couvrant l'image au zoom `z`. `originX/Y` en pixels monde de ce zoom ; `scale` =
 * taille d'affichage d'un pixel de tuile dans le repère de l'image.
 */
function coverTiles(
  z: number,
  originX: number,
  originY: number,
  width: number,
  height: number,
  scale = 1,
): MapTile[] {
  const count = 2 ** z
  const w = width / scale
  const h = height / scale
  const tiles: MapTile[] = []
  for (let ty = Math.floor(originY / TILE); ty * TILE < originY + h; ty++) {
    if (ty < 0 || ty >= count) continue
    for (let tx = Math.floor(originX / TILE); tx * TILE < originX + w; tx++) {
      tiles.push({
        z,
        x: ((tx % count) + count) % count,
        y: ty,
        left: Math.round((tx * TILE - originX) * scale),
        top: Math.round((ty * TILE - originY) * scale),
        size: TILE * scale,
      })
    }
  }
  return tiles
}
