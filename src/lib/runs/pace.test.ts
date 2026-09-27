import { describe, expect, it } from "vitest"
import { computePace, defaultRunName } from "./pace"

describe("computePace", () => {
  it("10 km en 50 min → 300 s/km", () => {
    expect(computePace(10000, 3000)).toBe(300)
  })
  it("arrondit", () => {
    expect(computePace(4200, 1234)).toBe(294)
  })
  it("distance nulle → 0", () => {
    expect(computePace(0, 100)).toBe(0)
  })
})

describe("defaultRunName", () => {
  const at = (h: number) => new Date(2026, 8, 26, h, 0)
  it.each([
    [6, "Course du matin"],
    [11, "Course du matin"],
    [12, "Course du midi"],
    [15, "Course de l'après-midi"],
    [19, "Course du soir"],
    [23, "Course de nuit"],
    [3, "Course de nuit"],
  ])("%ih → %s", (h, name) => {
    expect(defaultRunName(at(h))).toBe(name)
  })

  it("lit l'heure dans le fuseau demandé", () => {
    // 20:30 UTC = 22:30 à Paris en été ; 10:30 UTC = 12:30.
    expect(
      defaultRunName(new Date("2026-06-02T20:30:00Z"), "Europe/Paris"),
    ).toBe("Course de nuit")
    expect(
      defaultRunName(new Date("2026-06-02T10:30:00Z"), "Europe/Paris"),
    ).toBe("Course du midi")
  })
})
