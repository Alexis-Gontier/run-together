import { describe, expect, it } from "vitest"
import { summarizeTrack } from "./summarize-track"
import type { ParsedTrack, TrackPoint } from "./types"

// Ligne droite vers le nord : un point toutes les 10 s, 30 m entre deux points (3 m/s).
const M_PER_DEG_LAT = 111_195
function line(n: number, opts: { pauseAt?: number; climb?: number } = {}) {
  const pts: TrackPoint[] = []
  let t = Date.UTC(2026, 8, 20, 7, 0, 0)
  for (let i = 0; i < n; i++) {
    if (opts.pauseAt === i) t += 300_000
    pts.push({
      lat: 45 + (i * 30) / M_PER_DEG_LAT,
      lng: 5,
      ele: opts.climb ? i * opts.climb : 200,
      time: new Date(t),
      hr: 150,
      cad: 85,
      dist: null,
    })
    t += 10_000
  }
  return pts
}
const parsed = (points: TrackPoint[]): ParsedTrack => ({
  points,
  name: null,
  sportType: null,
  deviceName: "Garmin",
  calories: null,
})

describe("summarizeTrack", () => {
  it("distance, durée et splits d'une ligne de 3 km", () => {
    const s = summarizeTrack(parsed(line(101)))
    expect(s.distance).toBeGreaterThan(2990)
    expect(s.distance).toBeLessThan(3010)
    expect(s.duration).toBe(1000)
    expect(s.track.splits).toHaveLength(3)
    expect(s.track.splits[0].duration).toBeGreaterThanOrEqual(332)
    expect(s.track.splits[0].duration).toBeLessThanOrEqual(334)
    expect(s.heartRateAvg).toBe(150)
    expect(s.sportType).toBe("Run")
  })

  it("exclut la pause (et son segment) du temps en mouvement", () => {
    const s = summarizeTrack(parsed(line(101, { pauseAt: 50 })))
    expect(s.duration).toBe(990)
  })

  it("cumule le D+ au-delà de l'hystérésis", () => {
    const s = summarizeTrack(parsed(line(101, { climb: 1 })))
    expect(s.elevation).toBeGreaterThanOrEqual(97)
    expect(s.elevation).toBeLessThanOrEqual(100)
  })

  it("encode une polyline et une polyline résumée plus courte", () => {
    const s = summarizeTrack(parsed(line(500)))
    expect(s.track.startLat).toBeCloseTo(45)
    expect(s.track.polyline).toBeTruthy()
    expect(s.track.summaryPolyline?.length).toBeLessThan(
      s.track.polyline?.length ?? 0,
    )
  })

  it("préfère la distance cumulée de l'appareil au GPS", () => {
    const pts = line(11).map((p, i) => ({ ...p, lat: null, dist: i * 100 }))
    expect(summarizeTrack(parsed(pts)).distance).toBe(1000)
  })

  it("échoue sans point", () => {
    expect(() => summarizeTrack(parsed([]))).toThrow("aucun point")
  })
})
