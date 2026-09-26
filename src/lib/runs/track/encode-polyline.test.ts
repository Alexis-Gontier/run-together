import { expect, it } from "vitest"
import { encodePolyline } from "./encode-polyline"

it("encode l'exemple de la documentation Google", () => {
  expect(
    encodePolyline([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]),
  ).toBe("_p~iF~ps|U_ulLnnqC_mqNvxq`@")
})
