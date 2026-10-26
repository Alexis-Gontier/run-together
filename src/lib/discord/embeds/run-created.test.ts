import { describe, expect, it } from "vitest"
import { BRAND_COLOR, RECORD_COLOR } from "./common"
import { buildRunCreatedMessage } from "./run-created"

const message = (hasRecords: boolean) =>
  buildRunCreatedMessage(
    { runId: "run1", hasRecords },
    "https://run-together.app/",
  )
const embed = (hasRecords: boolean) => message(hasRecords).embeds[0]

describe("buildRunCreatedMessage", () => {
  it("n'envoie que l'image : coureur, course et stats sont dessus", () => {
    expect(embed(false)).toEqual({
      color: BRAND_COLOR,
      image: { url: "https://run-together.app/api/og/run/run1" },
    })
  })

  it("ajoute un bouton vers la page de la course", () => {
    expect(message(false).components).toEqual([
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "Voir la course",
            url: "https://run-together.app/runs/run1",
          },
        ],
      },
    ])
  })

  it("passe en or quand la course bat un record", () => {
    expect(embed(true).color).toBe(RECORD_COLOR)
  })
})
