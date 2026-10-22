import { describe, expect, it } from "vitest"
import { buildRecordSetMessage } from "./record-set"

describe("buildRecordSetMessage", () => {
  it("annonce un record en une phrase, avec le gain sur l'ancien", () => {
    const m = buildRecordSetMessage("Alice", [
      { distance: "KM_5", duration: 1450, pace: 290, previousDuration: 1502 },
    ])
    expect(m.embeds).toEqual([])
    expect(m.content).toBe(
      "🏆 **Alice** bat son record sur **5 km** en **24'10\"** (ancien : 25'02\", −52 s)",
    )
  })

  it("salue un premier record sur une distance", () => {
    const m = buildRecordSetMessage("Alice", [
      { distance: "KM_1", duration: 240, pace: 240, previousDuration: null },
    ])
    expect(m.content).toBe(
      "🏆 **Alice** signe son premier record sur **1 km** : **4'00\"**",
    )
  })

  it("liste plusieurs records, premier record compris", () => {
    const m = buildRecordSetMessage("Alice", [
      { distance: "KM_10", duration: 3000, pace: 300, previousDuration: 3065 },
      { distance: "KM_1", duration: 240, pace: 240, previousDuration: null },
    ])
    expect(m.content?.split("\n")).toEqual([
      "🏆 **Alice** a 2 nouveaux records perso :",
      "- **10 km** en **50'00\"** (ancien : 51'05\", −1'05\")",
      "- **1 km** en **4'00\"** (premier record)",
    ])
  })

  it("ne dit pas « bat » quand ce ne sont que des premiers records", () => {
    const m = buildRecordSetMessage("Alice", [
      { distance: "KM_1", duration: 240, pace: 240, previousDuration: null },
      { distance: "KM_5", duration: 1450, pace: 290, previousDuration: null },
    ])
    expect(m.content?.split("\n")[0]).toBe(
      "🏆 **Alice** signe 2 premiers records :",
    )
  })

  it("dit « bat » quand tous les records existaient déjà", () => {
    const m = buildRecordSetMessage("Alice", [
      { distance: "KM_1", duration: 240, pace: 240, previousDuration: 250 },
      { distance: "KM_5", duration: 1450, pace: 290, previousDuration: 1502 },
    ])
    expect(m.content?.split("\n")[0]).toBe("🏆 **Alice** bat 2 records perso :")
  })
})
