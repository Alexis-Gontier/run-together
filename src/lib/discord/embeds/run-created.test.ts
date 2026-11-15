import { describe, expect, it } from "vitest"
import { BRAND_COLOR, RECORD_COLOR } from "./common"
import { buildRunCreatedMessage } from "./run-created"

const message = (hasRecords: boolean) =>
  buildRunCreatedMessage(
    {
      runId: "run1",
      hasRecords,
      userName: "Alex",
      distance: 10_520,
      duration: 3150,
      pace: 299,
    },
    "https://run-together.app/",
  )
const embed = (hasRecords: boolean) => message(hasRecords).embeds[0]

describe("buildRunCreatedMessage", () => {
  it("résume la course dans le titre, lien vers la course, sous l'image", () => {
    expect(message(false)).toEqual({
      embeds: [
        {
          title: `Alex a couru 10.52 km en 52'30" (4'59"/km)`,
          url: "https://run-together.app/runs/run1",
          color: BRAND_COLOR,
          image: { url: "https://run-together.app/api/og/run/run1" },
        },
      ],
    })
  })

  it("passe en or quand la course bat un record", () => {
    expect(embed(true).color).toBe(RECORD_COLOR)
  })
})
