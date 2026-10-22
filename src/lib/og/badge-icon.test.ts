import { describe, expect, it } from "vitest"
import { BADGES } from "@/lib/badges/catalog"
import { badgeIconNode, badgeIconSrc } from "./badge-icon"

describe("badgeIconNode", () => {
  it("trouve le tracé de chaque icône du catalogue", () => {
    const missing = BADGES.filter((b) => !badgeIconNode(b.icon)).map(
      (b) => b.icon,
    )
    expect(missing).toEqual([])
  })
})

describe("badgeIconSrc", () => {
  it("dessine l'icône dans la teinte demandée", () => {
    const src = badgeIconSrc("route", "#10b981", 48)
    const svg = Buffer.from(
      src?.replace("data:image/svg+xml;base64,", "") ?? "",
      "base64",
    ).toString()
    expect(svg).toContain('stroke="#10b981"')
    expect(svg).toContain('<circle cx="6" cy="19" r="3"/>')
  })
})
