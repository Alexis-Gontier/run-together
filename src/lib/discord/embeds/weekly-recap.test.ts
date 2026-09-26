import { describe, expect, it } from "vitest"
import {
  buildWeeklyRecapMessage,
  formatWeekRange,
  type WeeklyRecapData,
} from "./weekly-recap"

const data: WeeklyRecapData = {
  weekStart: new Date("2026-09-21T00:00:00Z"),
  weekEnd: new Date("2026-09-28T00:00:00Z"),
  totalDistance: 84_300,
  totalRuns: 9,
  runners: 3,
  topDistance: [
    { name: "Alice", distance: 42_300 },
    { name: "Bob", distance: 30_000 },
  ],
  topRuns: [{ name: "Alice", runs: 5 }],
  bestPace: { name: "Bob", pace: 268, distance: 30_000 },
  records: [{ name: "Alice", distance: "KM_10", duration: 2890 }],
}

describe("formatWeekRange", () => {
  it("même mois", () => {
    expect(formatWeekRange(data.weekStart, data.weekEnd)).toBe(
      "du 21 au 27 septembre",
    )
  })
  it("écrit « 1er »", () => {
    expect(
      formatWeekRange(
        new Date("2026-06-01T00:00:00Z"),
        new Date("2026-06-08T00:00:00Z"),
      ),
    ).toBe("du 1er au 7 juin")
  })
  it("à cheval sur deux mois", () => {
    expect(
      formatWeekRange(
        new Date("2026-09-28T00:00:00Z"),
        new Date("2026-10-05T00:00:00Z"),
      ),
    ).toBe("du 28 septembre au 4 octobre")
  })
})

describe("buildWeeklyRecapMessage", () => {
  it("résume la semaine du groupe", () => {
    const e = buildWeeklyRecapMessage(data, "https://run-together.app/")
      .embeds[0]
    expect(e.title).toBe("📊 Récap de la semaine du 21 au 27 septembre")
    expect(e.image?.url).toBe(
      "https://run-together.app/api/og/recap/2026-09-21",
    )
    expect(e.description).toBe(
      "**3** coureurs · **9** courses · **84,30 km** au total",
    )
    const byName = Object.fromEntries(
      (e.fields ?? []).map((f) => [f.name, f.value]),
    )
    expect(byName.Distance).toBe("🥇 Alice — 42,30 km\n🥈 Bob — 30,00 km")
    expect(byName.Régularité).toBe("🥇 Alice — 5 courses")
    expect(byName["⚡ Meilleure allure"]).toBe("Bob — 4'28\" /km sur 30,00 km")
    expect(byName["🏆 Records de la semaine"]).toBe(
      "Alice — **10 km** en 48'10\"",
    )
  })

  it("omet les sections vides", () => {
    const e = buildWeeklyRecapMessage(
      {
        ...data,
        bestPace: null,
        records: [],
      },
      "https://run-together.app",
    ).embeds[0]
    expect(e.fields?.map((f) => f.name)).toEqual(["Distance", "Régularité"])
  })
})
