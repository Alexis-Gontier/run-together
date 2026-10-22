import { describe, expect, it } from "vitest"
import { previousMonth } from "../ranking"
import { buildMonthlyRankingMessage, formatMonth } from "./monthly-ranking"

describe("previousMonth", () => {
  it("renvoie le mois précédent, heure de Paris", () => {
    expect(previousMonth(new Date("2026-10-01T07:00:00Z"))).toEqual({
      start: new Date("2026-08-31T22:00:00Z"),
      end: new Date("2026-09-30T22:00:00Z"),
    })
  })
  it("passe l'année en janvier", () => {
    expect(previousMonth(new Date("2027-01-01T07:00:00Z")).start).toEqual(
      new Date("2026-11-30T23:00:00Z"),
    )
  })
})

describe("buildMonthlyRankingMessage", () => {
  const monthStart = new Date("2026-09-01T00:00:00Z")
  const ranking = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      name: `Coureur ${i + 1}`,
      distance: (20 - i) * 1000,
      runs: i === 9 ? 1 : 3,
    }))
  const build = (n: number) =>
    buildMonthlyRankingMessage(
      {
        monthStart,
        totalDistance: 182_000,
        totalRuns: 15,
        ranking: ranking(n),
      },
      "https://run-together.app/",
    ).embeds[0]

  it("n'envoie que l'image quand elle montre tout le classement", () => {
    expect(formatMonth(monthStart)).toBe("septembre 2026")
    const e = build(8)
    expect(e.title).toBeUndefined()
    expect(e.description).toBeUndefined()
    expect(e.image?.url).toBe("https://run-together.app/api/og/ranking/2026-09")
  })

  it("liste en texte la suite du classement au-delà de l'image", () => {
    expect(build(10).description?.split("\n")).toEqual([
      "**9.** Coureur 9 — **12,00 km** · 3 courses",
      "**10.** Coureur 10 — **11,00 km** · 1 course",
    ])
  })
})
