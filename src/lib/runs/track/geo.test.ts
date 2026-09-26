import { expect, it } from "vitest"
import { haversine } from "./geo"

it("Paris → Lyon ≈ 392 km", () => {
  expect(haversine(48.8566, 2.3522, 45.764, 4.8357)).toBeCloseTo(392_000, -4)
})
