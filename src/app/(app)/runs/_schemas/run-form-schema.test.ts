import { describe, expect, it } from "vitest"
import { runFormSchema, runFormToInput } from "./run-form-schema"

const form = {
  name: "",
  sportType: "Run",
  date: "2026-09-20",
  time: "07:15",
  distanceKm: "10.5",
  hours: "0",
  minutes: "52",
  seconds: "30",
  elevation: "",
  heartRateAvg: "148",
  heartRateMax: "",
  cadenceAvg: "",
  calories: "",
  publishToDiscord: true,
  track: null,
}

describe("runFormSchema + runFormToInput", () => {
  it("convertit une saisie en entrée normalisée", () => {
    const values = runFormSchema.parse(form)
    const input = runFormToInput(values)
    expect(input).toMatchObject({
      distance: 10500,
      duration: 3150,
      elevation: 0,
      heartRateAvg: 148,
      heartRateMax: null,
      name: "Course du matin",
      splits: [],
    })
    expect(input.date.getHours()).toBe(7)
    expect(input.date.getMinutes()).toBe(15)
  })

  it("exige une durée non nulle", () => {
    const r = runFormSchema.safeParse({ ...form, minutes: "0", seconds: "0" })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].path).toEqual(["minutes"])
  })

  it("refuse une FC hors bornes", () => {
    const r = runFormSchema.safeParse({ ...form, heartRateAvg: "400" })
    expect(r.success).toBe(false)
  })
})
