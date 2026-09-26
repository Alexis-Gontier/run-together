import { describe, expect, it } from "vitest"
import { BADGES, earnedBadges } from "./catalog"
import {
  computeBadgeStats,
  EMPTY_CONTEXT,
  isPalindromeDuration,
  maxConsecutiveWeeks,
} from "./stats"

// Allure par défaut : 5'00"/km.
const run = (iso: string, km = 5, elevation = 0, pace = 300) => ({
  date: new Date(iso),
  distance: km * 1000,
  duration: Math.round(km * pace),
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
      EMPTY_CONTEXT,
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
    const keys = earnedBadges(
      computeBadgeStats(runs, { ...EMPTY_CONTEXT, recordDistances: 1 }),
    ).map((b) => b.key)
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

describe("badges pour rire", () => {
  it("six seven, π, nuit blanche, Noël, dimanche, double dose, fusée, escargot", () => {
    const s = computeBadgeStats(
      [
        run("2026-09-20T08:00:00Z", 6.7), // dimanche, 6,7 km
        run("2026-09-21T08:00:00Z", 5, 0, 367), // allure 6'07"
        run("2026-09-22T08:00:00Z", 3.14),
        run("2026-09-22T17:00:00Z", 5, 0, 235), // 2e course du jour, fusée
        run("2026-09-23T00:30:00Z"), // 02:30 à Paris
        run("2026-12-25T10:00:00Z", 4, 0, 500), // Noël, escargot
      ],
      EMPTY_CONTEXT,
    )
    expect(s).toMatchObject({
      sixSevenRuns: 2,
      piRuns: 1,
      nightRuns: 1,
      christmasRuns: 1,
      sundayRuns: 1,
      doubleDays: 1,
      fastRuns: 1,
      slowRuns: 1,
    })
  })
})

describe("isPalindromeDuration", () => {
  it.each([
    [45 * 60 + 54, true], // 45:54
    [3600 + 2 * 60 + 1, true], // 1:02:01
    [12 * 60 + 21, true], // 12:21
    [101, false], // 1:41
    [45 * 60, false], // 45:00
  ])("%i s → %s", (seconds, expected) => {
    expect(isPalindromeDuration(seconds)).toBe(expected)
  })
})

describe("volume, métronome, pile poil, badges collectifs", () => {
  it("compte les nouvelles statistiques", () => {
    const s = computeBadgeStats(
      [
        run("2026-09-14T08:17:00Z", 10), // semaine du 14 : 10 + 8 = 18 km
        run("2026-09-16T08:17:00Z", 8),
        run("2026-09-22T08:17:00Z", 5), // même allure que les deux autres
        run("2026-09-13T11:00:00Z", 4.004), // dimanche 13 à 13:00 pile, pile poil
      ],
      { ...EMPTY_CONTEXT, groupKm: 12000, groupElevation: 1000 },
    )
    expect(s.maxWeekKm).toBe(18)
    expect(s.maxMonthKm).toBeCloseTo(27.004)
    expect(s.samePaceRuns).toBe(4)
    expect(s.roundKmRuns).toBe(4)
    expect(s.onTheHourRuns).toBe(1)
    expect(s.groupKm).toBe(12000)
  })

  it("pas de badge collectif sans course", () => {
    const s = computeBadgeStats([], { ...EMPTY_CONTEXT, groupKm: 12000 })
    expect(s.groupKm).toBe(0)
  })

  it("vendredi 13", () => {
    const s = computeBadgeStats([run("2026-11-13T10:00:00Z")], EMPTY_CONTEXT)
    expect(s.friday13Runs).toBe(1)
  })
})
