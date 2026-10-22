import { describe, expect, it } from "vitest"
import { previousWeek, weekFromMonday } from "./recap"

describe("previousWeek", () => {
  it("lundi matin → semaine du lundi au dimanche précédents, heure de Paris", () => {
    const { start, end } = previousWeek(new Date("2026-09-28T07:00:00Z"))
    expect(start.toISOString()).toBe("2026-09-20T22:00:00.000Z")
    expect(end.toISOString()).toBe("2026-09-27T22:00:00.000Z")
  })

  it("en milieu de semaine → dernière semaine complète", () => {
    const { start, end } = previousWeek(new Date("2026-09-24T12:00:00Z"))
    expect(start.toISOString()).toBe("2026-09-13T22:00:00.000Z")
    expect(end.toISOString()).toBe("2026-09-20T22:00:00.000Z")
  })

  it("lundi 00:30 à Paris (encore dimanche en UTC) → semaine qui vient de finir", () => {
    const { end } = previousWeek(new Date("2026-09-27T22:30:00Z"))
    expect(end.toISOString()).toBe("2026-09-27T22:00:00.000Z")
  })
})

describe("weekFromMonday", () => {
  it("traverse le passage à l'heure d'hiver", () => {
    const { start, end } = weekFromMonday("2026-10-19")
    expect(start.toISOString()).toBe("2026-10-18T22:00:00.000Z")
    expect(end.toISOString()).toBe("2026-10-25T23:00:00.000Z")
  })
})
