import { describe, expect, it } from "vitest"
import { buildBadgeUnlockedMessage } from "./badge-unlocked"
import { RECORD_COLOR } from "./common"

describe("buildBadgeUnlockedMessage", () => {
  it("n'envoie que l'image des badges, sans texte", () => {
    expect(
      buildBadgeUnlockedMessage("run1", "https://run-together.app/").embeds[0],
    ).toEqual({
      color: RECORD_COLOR,
      image: { url: "https://run-together.app/api/og/badges/run1" },
    })
  })
})
