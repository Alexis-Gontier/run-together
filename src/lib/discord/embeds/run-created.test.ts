import { describe, expect, it } from "vitest"
import { BRAND_COLOR, RECORD_COLOR } from "./common"
import { buildRunCreatedMessage, type RunCreatedData } from "./run-created"

const data: RunCreatedData = {
  runId: "run1",
  runName: "Sortie du matin",
  userName: "Alice",
  username: "alice",
  distance: 10500,
  duration: 3150,
  pace: 300,
  elevation: 0,
  heartRateAvg: null,
  date: new Date("2026-09-20T05:15:00Z"),
  sportType: "Run",
  newPRs: [],
}
const embed = (d: RunCreatedData) =>
  buildRunCreatedMessage(d, "https://run-together.app/").embeds[0]

describe("buildRunCreatedMessage", () => {
  it("résume la course et pointe vers les pages de l'app", () => {
    const e = embed(data)
    expect(e.description).toBe("**Alice** a couru **10,50 km** en **52'30\"**")
    expect(e.url).toBe("https://run-together.app/runs/run1")
    expect(e.author?.url).toBe("https://run-together.app/profile/alice")
    expect(e.image?.url).toBe("https://run-together.app/api/og/run/run1")
    expect(e.color).toBe(BRAND_COLOR)
    expect(e.fields?.map((f) => f.name)).toEqual([
      "Distance",
      "Allure",
      "Durée",
    ])
  })

  it("ajoute D+, FC et le type quand ils existent", () => {
    const e = embed({
      ...data,
      elevation: 120,
      heartRateAvg: 152,
      sportType: "TrailRun",
    })
    expect(e.fields?.map((f) => f.name)).toContain("D+")
    expect(e.fields?.map((f) => f.name)).toContain("FC moyenne")
    expect(e.description).toMatch(/· Trail$/)
  })

  it("met les records en avant avec le gain sur l'ancien", () => {
    const e = embed({
      ...data,
      newPRs: [
        { distance: "KM_5", duration: 1450, pace: 290, previousDuration: 1502 },
        {
          distance: "KM_10",
          duration: 3000,
          pace: 300,
          previousDuration: 3065,
        },
        { distance: "KM_1", duration: 240, pace: 240, previousDuration: null },
      ],
    })
    expect(e.color).toBe(RECORD_COLOR)
    const records = e.fields?.find((f) => f.name.startsWith("🏆"))
    expect(records?.name).toBe("🏆 Records personnels")
    expect(records?.value.split("\n")).toEqual([
      "**5 km** — 24'10\" (ancien : 25'02\", −52 s)",
      "**10 km** — 50'00\" (ancien : 51'05\", −1'05\")",
      "**1 km** — 4'00\" (premier record)",
    ])
  })
})
