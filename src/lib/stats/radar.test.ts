import { describe, expect, it } from "vitest"
import {
  DEFAULT_RADAR_STATS,
  parseRadarStats,
  radarArea,
  radarRating,
  radarScores,
  runnerTotals,
} from "./radar"

const day = (d: number) => new Date(Date.UTC(2026, 8, d, 8))

describe("runnerTotals", () => {
  const start = new Date(Date.UTC(2026, 8, 1))
  const end = new Date(Date.UTC(2026, 8, 28, 23, 59))

  it("additionne et calcule allure, plus longue, moyenne, temps", () => {
    const t = runnerTotals(
      [
        { date: day(2), distance: 10_000, duration: 3000, elevation: 100 },
        { date: day(4), distance: 5000, duration: 1500, elevation: 20 },
      ],
      start,
      end,
    )
    expect(t).toMatchObject({
      distance: 15,
      runs: 2,
      pace: 300,
      elevation: 120,
      longest: 10,
      average: 7.5,
      time: 4500 / 3600,
    })
  })

  it("régularité = semaines actives / semaines de la période", () => {
    const t = runnerTotals(
      [
        { date: day(2), distance: 5000, duration: 1500, elevation: 0 },
        { date: day(16), distance: 5000, duration: 1500, elevation: 0 },
      ],
      start,
      end,
    )
    expect(t.consistency).toBe(0.5)
  })

  it("sans course : allure absente, tout à 0", () => {
    const t = runnerTotals([], start, end)
    expect(t.pace).toBeNull()
    expect(t.runs).toBe(0)
    expect(t.consistency).toBe(0)
  })
})

describe("radarScores", () => {
  const base = {
    runs: 1,
    elevation: 0,
    longest: 0,
    average: 0,
    consistency: 0,
    time: 0,
  }
  it("le meilleur vaut 1, l'allure la plus basse gagne", () => {
    const scores = radarScores(
      [
        { ...base, distance: 20, pace: 300 },
        { ...base, distance: 10, pace: 360 },
        { ...base, distance: 0, pace: null },
      ],
      ["distance", "pace"],
    )
    expect(scores[0]).toEqual([1, 1])
    expect(scores[1][0]).toBe(0.5)
    expect(scores[1][1]).toBeCloseTo(300 / 360)
    expect(scores[2]).toEqual([0, 0])
  })
})

describe("radarArea / radarRating", () => {
  it("carré unité = 2, note pleine = 100", () => {
    expect(radarArea([1, 1, 1, 1])).toBeCloseTo(2)
    expect(radarRating([1, 1, 1, 1])).toBe(100)
    expect(radarRating([0.5, 0.5, 0.5, 0.5])).toBe(25)
  })
})

describe("parseRadarStats", () => {
  it("garde l'ordre du catalogue et ignore l'inconnu", () => {
    expect(parseRadarStats("pace,distance,foo,runs")).toEqual([
      "distance",
      "runs",
      "pace",
    ])
  })
  it("défaut sous 3 stats", () => {
    expect(parseRadarStats("pace")).toEqual(DEFAULT_RADAR_STATS)
    expect(parseRadarStats(undefined)).toEqual(DEFAULT_RADAR_STATS)
  })
})
