import { describe, expect, it } from "vitest"
import { previousWeek } from "./recap"

describe("previousWeek", () => {
  it("lundi matin → semaine du lundi au dimanche précédents", () => {
    const { start, end } = previousWeek(new Date("2026-09-28T07:00:00Z"))
    expect(start.toISOString()).toBe("2026-09-21T00:00:00.000Z")
    expect(end.toISOString()).toBe("2026-09-28T00:00:00.000Z")
  })

  it("en milieu de semaine → dernière semaine complète", () => {
    const { start, end } = previousWeek(new Date("2026-09-24T12:00:00Z"))
    expect(start.toISOString()).toBe("2026-09-14T00:00:00.000Z")
    expect(end.toISOString()).toBe("2026-09-21T00:00:00.000Z")
  })
})
