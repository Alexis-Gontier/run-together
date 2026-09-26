import { describe, expect, it } from "vitest"
import { BADGES, earnedBadges } from "./catalog"
import { computeBadgeStats, maxConsecutiveWeeks } from "./stats"

const run = (iso: string, km = 5, elevation = 0) => ({
  date: new Date(iso),
  distance: km * 1000,
  elevation,
})

describe("maxConsecutiveWeeks", () => {
  it("compte les semaines consécutives, pas les jours", () => {
    const dates = [
      "2026-09-01T08:00:00Z", // semaine du 31 août
      "2026-09-03T08:00:00Z", // même semaine
      "2026-09-08T08:00:00Z", // semaine du 7
      "2026-09-20T08:00:00Z", // semaine du 14
      "2026-10-05T08:00:00Z", // trou d'une semaine
    ].map((d) => new Date(d))
    expect(maxConsecutiveWeeks(dates)).toBe(3)
  })
  it("0 sans course", () => {
    expect(maxConsecutiveWeeks([])).toBe(0)
  })
})

describe("computeBadgeStats", () => {
  it("lit les heures à Paris", () => {
    // 05:30 UTC = 07:30 à Paris l'été : pas lève-tôt. 04:30 UTC = 06:30 : lève-tôt.
    const s = computeBadgeStats(
      [
        run("2026-07-01T05:30:00Z"),
        run("2026-07-02T04:30:00Z"),
        run("2026-07-03T19:30:00Z"), // 21:30 Paris
        run("2025-12-31T23:30:00Z"), // 1er janvier 00:30 à Paris
      ],
      0,
    )
    expect(s.earlyRuns).toBe(2) // 06:30 et 00:30
    expect(s.lateRuns).toBe(1)
    expect(s.newYearRuns).toBe(1)
  })
})

describe("earnedBadges", () => {
  it("accorde les paliers atteints et le 10 km avec tolérance GPS", () => {
    const runs = Array.from({ length: 12 }, (_, i) =>
      run(`2026-0${(i % 9) + 1}-10T10:00:00Z`, i === 0 ? 9.75 : 5, 100),
    )
    const keys = earnedBadges(computeBadgeStats(runs, 1)).map((b) => b.key)
    expect(keys).toContain("distance-50")
    expect(keys).toContain("runs-10")
    expect(keys).toContain("elevation-1000")
    expect(keys).toContain("first-5k")
    expect(keys).toContain("first-10k") // 9,75 km ≥ 97 % de 10 km
    expect(keys).toContain("first-record")
    expect(keys).not.toContain("half-marathon")
    expect(keys).not.toContain("distance-100")
  })

  it("des clés uniques dans le catalogue", () => {
    const keys = BADGES.map((b) => b.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
