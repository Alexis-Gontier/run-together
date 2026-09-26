import { describe, expect, it } from "vitest"
import { buildBadgeUnlockedMessage } from "./badge-unlocked"

const badge = { emoji: "🏔️", name: "Everest", description: "8 849 m de D+" }

describe("buildBadgeUnlockedMessage", () => {
  it("illustre les badges de la course avec l'image OG", () => {
    const e = buildBadgeUnlockedMessage(
      { name: "Alice", username: "alice" },
      [badge, { ...badge, name: "Six Seven" }],
      "run1",
      "https://run-together.app/",
    ).embeds[0]
    expect(e.title).toBe("🏅 alice débloque 2 badges")
    expect(e.url).toBe("https://run-together.app/profile/alice")
    expect(e.image?.url).toBe("https://run-together.app/api/og/badges/run1")
    expect(e.fields).toHaveLength(2)
  })
})
