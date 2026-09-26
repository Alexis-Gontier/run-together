import { describe, expect, it } from "vitest"
import { extractCandidates } from "./personal-records"

const km = (n: number, pace = 300) =>
  Array.from({ length: n }, (_, i) => ({
    kilometer: i + 1,
    distance: 1000,
    duration: pace,
    pace,
  }))

describe("extractCandidates", () => {
  it("fenêtre glissante sur les splits pour 1/5/10 km", () => {
    const run = { id: "r", distance: 10000, duration: 3000, pace: 300 }
    const d = extractCandidates(run, km(10)).map((c) => c.distance)
    expect(d).toEqual(expect.arrayContaining(["KM_1", "KM_5", "KM_10"]))
  })

  it("sans splits : la course entière compte si distance dans [97 % ; 105 %]", () => {
    const run = { id: "r", distance: 5100, duration: 1500, pace: 294 }
    expect(extractCandidates(run, [])).toEqual([
      { distance: "KM_5", runId: "r", duration: 1500, pace: 294 },
    ])
  })

  it("sans splits : hors tolérance, aucun candidat", () => {
    const run = { id: "r", distance: 5400, duration: 1600, pace: 296 }
    expect(extractCandidates(run, [])).toEqual([])
  })

  it("semi : course entière ≥ 97 % de 21,0975 km", () => {
    const run = { id: "r", distance: 20500, duration: 6000, pace: 293 }
    expect(extractCandidates(run, []).map((c) => c.distance)).toEqual([
      "HALF_MARATHON",
    ])
  })
})
