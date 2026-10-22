import { describe, expect, it } from "vitest"
import { parisCalendarDate, parisDay, parisMidnight } from "./paris"

describe("parisMidnight", () => {
  it("heure d'été : UTC+2", () => {
    expect(parisMidnight(2026, 9, 21).toISOString()).toBe(
      "2026-09-20T22:00:00.000Z",
    )
  })

  it("heure d'hiver : UTC+1", () => {
    expect(parisMidnight(2026, 12, 1).toISOString()).toBe(
      "2026-11-30T23:00:00.000Z",
    )
  })

  it("normalise les débordements", () => {
    expect(parisMidnight(2026, 13, 1)).toEqual(parisMidnight(2027, 1, 1))
  })
})

describe("parisDay", () => {
  it("dimanche 23:30 à Paris reste dimanche", () => {
    expect(parisDay(new Date("2026-09-27T21:30:00Z"))).toBe("2026-09-27")
  })

  it("lundi 00:30 à Paris est déjà lundi", () => {
    expect(parisDay(new Date("2026-09-27T22:30:00Z"))).toBe("2026-09-28")
  })
})

describe("parisCalendarDate", () => {
  it("place le jour de Paris à midi UTC", () => {
    expect(parisCalendarDate(new Date("2026-09-27T22:30:00Z"))).toEqual(
      new Date("2026-09-28T12:00:00Z"),
    )
  })
})
