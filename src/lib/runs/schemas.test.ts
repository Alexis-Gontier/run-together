import { describe, expect, it } from "vitest"
import { recordRunInputSchema } from "./schemas"

const base = {
  name: "Sortie",
  sportType: "Run",
  distance: 10000,
  duration: 3000,
  elevation: 50,
  date: new Date("2026-09-20T07:00:00Z"),
  splits: [],
}

describe("recordRunInputSchema", () => {
  it("accepte une course valide", () => {
    expect(recordRunInputSchema.safeParse(base).success).toBe(true)
  })
  it("accepte une date sérialisée en chaîne", () => {
    const r = recordRunInputSchema.safeParse({
      ...base,
      date: "2026-09-20T07:00:00.000Z",
    })
    expect(r.success).toBe(true)
  })
  it("refuse une allure plus rapide que 2'00\"/km", () => {
    const r = recordRunInputSchema.safeParse({ ...base, duration: 1000 })
    expect(r.success).toBe(false)
  })
  it("refuse une allure plus lente que 20'00\"/km", () => {
    const r = recordRunInputSchema.safeParse({ ...base, duration: 13000 })
    expect(r.success).toBe(false)
  })
  it("refuse une date future", () => {
    const r = recordRunInputSchema.safeParse({
      ...base,
      date: new Date(Date.now() + 3_600_000),
    })
    expect(r.success).toBe(false)
  })
  it("refuse > 300 km", () => {
    const r = recordRunInputSchema.safeParse({
      ...base,
      distance: 300_001,
      duration: 150_000,
    })
    expect(r.success).toBe(false)
  })
})
