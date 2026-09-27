import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { recordRunInputSchema } from "../schemas"
import { parseTrackFile } from "./parse-track"
import { trackSummaryToRunInput } from "./summary-to-input"
import type { TrackSummary } from "./types"

const summary: TrackSummary = {
  name: null,
  sportType: "Run",
  date: new Date("2026-09-05T01:02:27Z"),
  distance: 4440.4,
  duration: 1895,
  elevation: 9.2,
  heartRateAvg: null,
  heartRateMax: null,
  cadenceAvg: 78,
  calories: null,
  track: {
    polyline: "abc",
    summaryPolyline: "ab",
    startLat: 48.8,
    startLng: 2.3,
    deviceName: "Amazfit",
    splits: [],
  },
}

describe("trackSummaryToRunInput", () => {
  it("arrondit, nomme à l'heure de Paris et passe le schéma", () => {
    const input = trackSummaryToRunInput(summary)
    expect(input).toMatchObject({
      name: "Course de nuit", // 03:02 à Paris
      distance: 4440,
      elevation: 9,
      polyline: "abc",
      deviceName: "Amazfit",
    })
    expect(recordRunInputSchema.safeParse(input).success).toBe(true)
  })

  it("garde le nom du fichier s'il existe", () => {
    expect(trackSummaryToRunInput({ ...summary, name: "Sortie" }).name).toBe(
      "Sortie",
    )
  })
})

describe("parseTrackFile", () => {
  const gpx = `<gpx creator="x"><trk><trkseg>${Array.from(
    { length: 20 },
    (_, i) =>
      `<trkpt lat="${45 + i * 0.0003}" lon="5"><time>2026-09-20T07:00:${String(i * 3).padStart(2, "0")}Z</time></trkpt>`,
  ).join("")}</trkseg></trk></gpx>`

  it("décompresse un fichier .gz", () => {
    const bytes = new Uint8Array(gzipSync(gpx))
    const s = parseTrackFile("course.gpx.gz", bytes)
    expect(s.distance).toBeGreaterThan(600)
  })

  it("refuse une archive .gz corrompue", () => {
    expect(() =>
      parseTrackFile("course.fit.gz", new TextEncoder().encode("nope")),
    ).toThrow(".gz illisible")
  })
})
