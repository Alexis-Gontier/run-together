import { describe, expect, it } from "vitest"
import { nextMilestone } from "./milestones"
import { computeBestStreak, computeCurrentStreak } from "./streaks"

describe("computeCurrentStreak", () => {
  const now = new Date("2026-09-26T09:00:00Z")
  it("compte jusqu'à aujourd'hui", () => {
    const days = new Set(["2026-09-24", "2026-09-25", "2026-09-26"])
    expect(computeCurrentStreak(days, now)).toBe(3)
  })
  it("part d'hier si pas encore couru aujourd'hui", () => {
    const days = new Set(["2026-09-24", "2026-09-25"])
    expect(computeCurrentStreak(days, now)).toBe(2)
  })
  it("0 si ni aujourd'hui ni hier", () => {
    expect(computeCurrentStreak(new Set(["2026-09-23"]), now)).toBe(0)
  })
})

describe("computeBestStreak", () => {
  it("plus longue suite", () => {
    const days = new Set([
      "2026-09-01",
      "2026-09-02",
      "2026-09-05",
      "2026-09-06",
      "2026-09-07",
    ])
    expect(computeBestStreak(days)).toBe(3)
  })
})

describe("nextMilestone", () => {
  it("entre deux paliers", () => {
    expect(nextMilestone(488)).toMatchObject({
      next: 500,
      previous: 250,
      remainingKm: 12,
    })
    expect(nextMilestone(488).progress).toBeCloseTo(238 / 250)
  })
  it("pile sur un palier → le suivant", () => {
    expect(nextMilestone(100).next).toBe(250)
  })
  it("au-delà du dernier palier : tous les 5 000 km", () => {
    expect(nextMilestone(12_300)).toMatchObject({
      next: 15_000,
      previous: 10_000,
    })
  })
})
