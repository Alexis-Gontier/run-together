import { describe, expect, it } from "vitest"
import { parseGpx } from "./parse-gpx"

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Garmin Connect" version="1.1"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk>
    <name>Sortie du dimanche</name>
    <type>trail_running</type>
    <trkseg>
      <trkpt lat="45.0000" lon="5.0000"><ele>200.4</ele><time>2026-09-20T07:00:00Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>140</gpxtpx:hr><gpxtpx:cad>84</gpxtpx:cad></gpxtpx:TrackPointExtension></extensions>
      </trkpt>
      <trkpt lat="45.0003" lon="5.0000"><ele>201</ele><time>2026-09-20T07:00:10Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>145</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>
      </trkpt>
      <trkpt lat="45.0006" lon="5.0000"><ele>203</ele><time>2026-09-20T07:00:20Z</time></trkpt>
      <trkpt lat="45.0009" lon="5.0000"><ele>204</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`

describe("parseGpx", () => {
  it("lit points, extensions, nom, type et appareil", () => {
    const t = parseGpx(GPX)
    expect(t.points).toHaveLength(3) // le point sans <time> est ignoré
    expect(t.points[0]).toMatchObject({
      lat: 45,
      lng: 5,
      ele: 200.4,
      hr: 140,
      cad: 84,
    })
    expect(t.points[2].hr).toBeNull()
    expect(t.name).toBe("Sortie du dimanche")
    expect(t.sportType).toBe("TrailRun")
    expect(t.deviceName).toBe("Garmin Connect")
  })

  it("refuse un autre sport déclaré, accepte un type absent ou inconnu", () => {
    expect(() => parseGpx(GPX.replace("trail_running", "cycling"))).toThrow(
      "pas une course",
    )
    expect(parseGpx(GPX.replace("trail_running", "9")).sportType).toBeNull()
  })

  it("refuse un document qui n'est pas du GPX", () => {
    expect(() => parseGpx("<html></html>")).toThrow("GPX invalide")
  })
})
