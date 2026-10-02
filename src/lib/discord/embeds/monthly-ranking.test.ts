import { describe, expect, it } from "vitest"
import { previousMonth } from "../ranking"
import { buildMonthlyRankingMessage, formatMonth } from "./monthly-ranking"

describe("previousMonth", () => {
  it("renvoie le mois précédent en UTC", () => {
    expect(previousMonth(new Date("2026-10-01T07:00:00Z"))).toEqual({
      start: new Date("2026-09-01T00:00:00Z"),
      end: new Date("2026-10-01T00:00:00Z"),
    })
  })
  it("passe l'année en janvier", () => {
    expect(previousMonth(new Date("2027-01-01T07:00:00Z")).start).toEqual(
      new Date("2026-12-01T00:00:00Z"),
    )
  })
})

describe("buildMonthlyRankingMessage", () => {
  it("classe les membres à la distance", () => {
    const monthStart = new Date("2026-09-01T00:00:00Z")
    expect(formatMonth(monthStart)).toBe("septembre 2026")
    const e = buildMonthlyRankingMessage({
      monthStart,
      totalDistance: 182_000,
      totalRuns: 15,
      ranking: [
        { name: "Alice", distance: 120_000, runs: 9 },
        { name: "Bob", distance: 42_000, runs: 5 },
        { name: "Chloé", distance: 15_000, runs: 1 },
        { name: "Dan", distance: 5_000, runs: 1 },
      ],
    }).embeds[0]
    expect(e.title).toBe("🏁 Classement de septembre 2026")
    expect(e.description?.split("\n")).toEqual([
      "**4** coureurs · **15** courses · **182,00 km** au total",
      "",
      "🥇 Alice — **120,00 km** · 9 courses",
      "🥈 Bob — **42,00 km** · 5 courses",
      "🥉 Chloé — **15,00 km** · 1 course",
      "**4.** Dan — **5,00 km** · 1 course",
    ])
  })
})
