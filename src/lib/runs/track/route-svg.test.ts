import { describe, expect, it } from "vitest"
import { decodePolyline } from "./decode-polyline"
import { encodePolyline } from "./encode-polyline"
import { routeSvgPath } from "./route-svg"

describe("decodePolyline", () => {
  it("décode l'exemple de la documentation Google", () => {
    expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ])
  })

  it("aller-retour avec encodePolyline", () => {
    const pts: [number, number][] = [
      [45.76401, 4.83571],
      [45.76455, 4.83602],
      [45.7639, 4.8349],
    ]
    expect(decodePolyline(encodePolyline(pts))).toEqual(pts)
  })
})

const coords = (d: string) =>
  d
    .split(/[ML]/)
    .filter(Boolean)
    .map((p) => p.trim().split(" ").map(Number))

describe("routeSvgPath", () => {
  const square: [number, number][] = [
    [45, 5],
    [45.01, 5],
    [45.01, 5.01],
    [45, 5.01],
  ]

  it("reste dans le cadre et commence par M", () => {
    const d = routeSvgPath(square, 1200, 400, 40)
    expect(d?.startsWith("M")).toBe(true)
    for (const [x, y] of coords(d ?? "")) {
      expect(x).toBeGreaterThanOrEqual(40)
      expect(x).toBeLessThanOrEqual(1160)
      expect(y).toBeGreaterThanOrEqual(40)
      expect(y).toBeLessThanOrEqual(360)
    }
  })

  it("place le nord en haut", () => {
    const [[, ySouth], [, yNorth]] = coords(
      routeSvgPath(square, 400, 400, 0) ?? "",
    )
    expect(yNorth).toBeLessThan(ySouth)
  })

  it("renvoie null sous deux points", () => {
    expect(routeSvgPath([[45, 5]], 100, 100, 0)).toBeNull()
  })
})
