import { describe, expect, it } from "vitest"
import { buildBattleResultMessage } from "./battle-result"
import { BRAND_COLOR, RECORD_COLOR } from "./common"

const build = (a: number, b: number) =>
  buildBattleResultMessage(
    {
      a: { id: "u1", points: a },
      b: { id: "u2", points: b },
      period: "3m",
      day: "2026-10-22",
    },
    "https://run-together.app/",
  ).embeds[0]

describe("buildBattleResultMessage", () => {
  it("n'envoie que l'image du duel", () => {
    expect(build(6, 3)).toEqual({
      color: RECORD_COLOR,
      image: {
        url: "https://run-together.app/api/og/battle/u1/u2/3m?at=2026-10-22",
      },
    })
  })

  it("reste vert sur un match nul", () => {
    expect(build(1, 1).color).toBe(BRAND_COLOR)
  })
})
