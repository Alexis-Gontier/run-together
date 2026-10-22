import { describe, expect, it } from "vitest"
import { BRAND_COLOR, RECORD_COLOR } from "./common"
import { buildRunCreatedMessage } from "./run-created"

const embed = (hasRecords: boolean) =>
  buildRunCreatedMessage(
    { runId: "run1", hasRecords },
    "https://run-together.app/",
  ).embeds[0]

describe("buildRunCreatedMessage", () => {
  it("n'envoie que l'image : coureur, course et stats sont dessus", () => {
    expect(embed(false)).toEqual({
      color: BRAND_COLOR,
      image: { url: "https://run-together.app/api/og/run/run1" },
    })
  })

  it("passe en or quand la course bat un record", () => {
    expect(embed(true).color).toBe(RECORD_COLOR)
  })
})
