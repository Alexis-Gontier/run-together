import { describe, expect, it } from "vitest"
import { buildMemberJoinedMessage, buildTestMessage } from "./simple"

describe("buildMemberJoinedMessage", () => {
  it("n'envoie que la carte de bienvenue", () => {
    const e = buildMemberJoinedMessage("u1", "https://run-together.app/")
      .embeds[0]
    expect(e.title).toBeUndefined()
    expect(e.footer).toBeUndefined()
    expect(e.image?.url).toBe("https://run-together.app/api/og/member/u1")
  })
})

describe("buildTestMessage", () => {
  it("joint une image à URL unique pour forcer Discord à la recharger", () => {
    const e = buildTestMessage("https://run-together.app").embeds[0]
    expect(e.image?.url).toMatch(
      /^https:\/\/run-together\.app\/api\/og\/test\?t=\d+$/,
    )
  })
})
