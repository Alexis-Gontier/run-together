import { describe, expect, it } from "vitest"
import { mapViewport } from "./raster-tiles"

const route: [number, number][] = [
  [48.8584, 2.2945],
  [48.8606, 2.3376],
  [48.853, 2.3499],
]

describe("mapViewport", () => {
  it("cadre le tracé dans l'image avec la marge", () => {
    const v = mapViewport(route, 1200, 400, 48)
    expect(v).not.toBeNull()
    for (const p of [v?.start, v?.end]) {
      expect(p?.x).toBeGreaterThanOrEqual(48)
      expect(p?.x).toBeLessThanOrEqual(1200 - 48)
      expect(p?.y).toBeGreaterThanOrEqual(48)
      expect(p?.y).toBeLessThanOrEqual(400 - 48)
    }
  })

  it("couvre toute l'image de tuiles", () => {
    const v = mapViewport(route, 1200, 400, 48)
    const tiles = v?.tiles ?? []
    expect(Math.min(...tiles.map((t) => t.left))).toBeLessThanOrEqual(0)
    expect(Math.min(...tiles.map((t) => t.top))).toBeLessThanOrEqual(0)
    expect(Math.max(...tiles.map((t) => t.left + 256))).toBeGreaterThanOrEqual(
      1200,
    )
    expect(Math.max(...tiles.map((t) => t.top + 256))).toBeGreaterThanOrEqual(
      400,
    )
  })

  it("renvoie null sans tracé", () => {
    expect(mapViewport([route[0]], 1200, 400, 48)).toBeNull()
  })
})
