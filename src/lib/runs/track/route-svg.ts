/**
 * Tracé → attribut `d` d'un `<path>` SVG, sans fond de carte. Projection équirectangulaire
 * corrigée par le cosinus de la latitude moyenne : fidèle à l'échelle d'une course à pied.
 * Le ratio est conservé, le tracé centré, le nord en haut.
 */
export function routeSvgPath(
  points: [number, number][],
  width: number,
  height: number,
  padding: number,
): string | null {
  if (points.length < 2) return null

  const meanLat = points.reduce((s, [lat]) => s + lat, 0) / points.length
  const kx = Math.cos((meanLat * Math.PI) / 180)
  const xs = points.map(([, lng]) => lng * kx)
  const ys = points.map(([lat]) => lat)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX || 1e-9
  const spanY = maxY - minY || 1e-9

  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const scale = Math.min(innerW / spanX, innerH / spanY)
  const offsetX = padding + (innerW - spanX * scale) / 2
  const offsetY = padding + (innerH - spanY * scale) / 2

  return points
    .map((_, i) => {
      const x = offsetX + (xs[i] - minX) * scale
      const y = offsetY + (maxY - ys[i]) * scale
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}
