import { describe, expect, it } from "vitest"
import {
  buildWeeklyRecapMessage,
  fitField,
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
  it("n'envoie que l'image quand elle montre tous les records", () => {
    const e = buildWeeklyRecapMessage(data, "https://run-together.app/")
      .embeds[0]
    expect(e.title).toBeUndefined()
    expect(e.description).toBeUndefined()
    expect(e.footer).toBeUndefined()
    expect(e.fields).toEqual([])
    expect(e.image?.url).toBe(
      "https://run-together.app/api/og/recap/2026-09-21",
    )
  })

  it("liste en texte les records au-delà de l'image", () => {
    const record = data.records[0]
    const e = buildWeeklyRecapMessage(
      {
        ...data,
        records: [record, record, record, { ...record, name: "Bob" }],
      },
      "https://run-together.app",
    ).embeds[0]
    expect(e.fields).toEqual([
      {
        name: "🏆 Autres records de la semaine",
        value: "Bob — **10 km** en 48'10\"",
      },
    ])
  })
})

describe("fitField", () => {
  it("garde tout quand ça tient", () => {
    expect(fitField(["a", "b"])).toBe("a\nb")
  })

  it("résume la fin sans dépasser 1024 caractères", () => {
    const lines = Array.from({ length: 40 }, (_, i) => `${i}`.padEnd(40, "x"))
    const value = fitField(lines)
    expect(value.length).toBeLessThanOrEqual(1024)
    expect(value).toMatch(/… et \d+ autres$/)
  })
})
