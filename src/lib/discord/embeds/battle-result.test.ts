import { describe, expect, it } from "vitest"
import { buildBattleResultMessage } from "./battle-result"

describe("buildBattleResultMessage", () => {
  it("annonce le vainqueur et le score", () => {
    const e = buildBattleResultMessage({
      a: { name: "Alice", points: 6, wins: ["Distance — 120,5 km"] },
      b: { name: "Bob", points: 3, wins: [] },
      periodPhrase: "sur 3 mois",
    }).embeds[0]
    expect(e.title).toBe("⚔️ Bataille : Alice vs Bob")
    expect(e.description).toBe("**Alice** l'emporte sur 3 mois : **6 – 3**")
    expect(e.fields?.[0]).toMatchObject({
      name: "🏆 Alice — 6 pts",
      value: "Distance — 120,5 km",
    })
    expect(e.fields?.[1]).toMatchObject({
      name: "Bob — 3 pts",
      value: "Aucun point",
    })
  })

  it("gère le match nul", () => {
    const e = buildBattleResultMessage({
      a: { name: "Alice", points: 1, wins: ["Courses — 4"] },
      b: { name: "Bob", points: 1, wins: ["Dénivelé — 200 m"] },
      periodPhrase: "depuis toujours",
    }).embeds[0]
    expect(e.description).toBe("**Match nul** depuis toujours : **1 – 1**")
    expect(e.fields?.[0].name).toBe("Alice — 1 pt")
  })
})
