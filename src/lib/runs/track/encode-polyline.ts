// Algorithme « Encoded Polyline » de Google, précision 1e5 — le format de `Run.polyline`.
function encodeValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1
  let out = ""
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  return out + String.fromCharCode(v + 63)
}

export function encodePolyline(coords: [number, number][]): string {
  let prevLat = 0
  let prevLng = 0
  let out = ""
  for (const [lat, lng] of coords) {
    const iLat = Math.round(lat * 1e5)
    const iLng = Math.round(lng * 1e5)
    out += encodeValue(iLat - prevLat) + encodeValue(iLng - prevLng)
    prevLat = iLat
    prevLng = iLng
  }
  return out
}
