import { describe, expect, it } from "vitest"
import { computeBattle } from "./battle"

const totals = {
  distanceKm: 0,
  runs: 0,
  pace: null,
  elevation: 0,
  longestKm: 0,
}

const noRecords = (
  ["KM_1", "KM_5", "KM_10", "HALF_MARATHON", "MARATHON"] as const
).map((distance) => ({ distance, me: null, other: null }))

describe("computeBattle", () => {
  it("donne un point par ligne gagnée et désigne le vainqueur", () => {
    const b = computeBattle({
      me: {
        distanceKm: 120.5,
        runs: 10,
        pace: 300,
        elevation: 500,
        longestKm: 21,
      },
      other: {
        distanceKm: 98,
        runs: 12,
        pace: 320,
        elevation: 500,
        longestKm: 15,
      },
      weekly: [],
      records: [
        { distance: "KM_5", me: 1500, other: 1400 },
        ...noRecords.slice(2),
      ],
    })
    // moi : distance, allure, plus longue — l'autre : courses, 5 km — dénivelé égal
    expect(b.score).toEqual({ me: 3, other: 2 })
    expect(b.winner).toBe("me")
    expect(b.stats.find((l) => l.label === "Dénivelé")?.winner).toBeNull()
    expect(b.stats[0].meText).toBe("120,5 km")
    expect(b.records[0]).toMatchObject({ label: "5 km", winner: "other" })
  })

  it("ne compte pas une valeur manquante", () => {
    const b = computeBattle({
      me: { ...totals, pace: 300 },
      other: totals,
      weekly: [],
      records: [{ distance: "KM_10", me: 2800, other: null }],
    })
    expect(b.score).toEqual({ me: 0, other: 0 })
    expect(b.winner).toBeNull()
    expect(b.records[0].otherText).toBe("—")
  })

  it("compte 0 course face à des courses", () => {
    const b = computeBattle({
      me: totals,
      other: { ...totals, runs: 2, distanceKm: 10, longestKm: 6 },
      weekly: [],
      records: [],
    })
    expect(b.score).toEqual({ me: 0, other: 3 })
    expect(b.winner).toBe("other")
  })
})
