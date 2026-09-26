import { describe, expect, it } from "vitest"
import { displayName } from "./display-name"

describe("displayName", () => {
  it("préfère le username (avec sa casse d'affichage)", () => {
    expect(
      displayName({
        name: "Alice Martin",
        username: "alice",
        displayUsername: "Alice",
      }),
    ).toBe("Alice")
    expect(displayName({ name: "Alice Martin", username: "alice" })).toBe(
      "alice",
    )
  })
  it("retombe sur le nom, puis « Inconnu »", () => {
    expect(displayName({ name: "Alice Martin", username: null })).toBe(
      "Alice Martin",
    )
    expect(displayName({})).toBe("Inconnu")
  })
})
