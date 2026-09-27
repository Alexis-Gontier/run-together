import { describe, expect, it } from "vitest"
import { parseTcx } from "./parse-tcx"

const tcx = (sport: string) => `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
  <Activities><Activity Sport="${sport}">
    <Id>2026-06-02T03:01:11Z</Id>
    <Creator><Name>Amazfit GTR 3 Pro</Name></Creator>
    <Lap StartTime="2026-06-02T03:01:11Z"><Calories>623.0</Calories><Track>
      <Trackpoint><Time>2026-06-02T03:01:11Z</Time></Trackpoint>
      <Trackpoint><Time>2026-06-02T03:01:12Z</Time>
        <Position><LatitudeDegrees>48.818</LatitudeDegrees><LongitudeDegrees>2.3167</LongitudeDegrees></Position>
        <AltitudeMeters>178.5</AltitudeMeters><DistanceMeters>3.2</DistanceMeters>
        <HeartRateBpm><Value>142</Value></HeartRateBpm><Cadence>78</Cadence>
      </Trackpoint>
      <Trackpoint><Position><LatitudeDegrees>48.819</LatitudeDegrees><LongitudeDegrees>2.3167</LongitudeDegrees></Position></Trackpoint>
    </Track></Lap>
  </Activity></Activities>
</TrainingCenterDatabase>`

describe("parseTcx", () => {
  it("lit points, appareil et calories", () => {
    const t = parseTcx(tcx("Running"))
    expect(t.points).toHaveLength(2) // le point sans <Time> est ignoré
    expect(t.points[0]).toMatchObject({ lat: null, lng: null, ele: null })
    expect(t.points[1]).toMatchObject({
      lat: 48.818,
      lng: 2.3167,
      ele: 178.5,
      dist: 3.2,
      hr: 142,
      cad: 78,
    })
    expect(t.sportType).toBe("Run")
    expect(t.deviceName).toBe("Amazfit GTR 3 Pro")
    expect(t.calories).toBe(623)
  })

  it("laisse le type ouvert pour « Other »", () => {
    expect(parseTcx(tcx("Other")).sportType).toBeNull()
  })

  it("refuse un autre sport", () => {
    expect(() => parseTcx(tcx("Biking"))).toThrow("pas une course")
  })

  it("refuse un document qui n'est pas du TCX", () => {
    expect(() => parseTcx("<html></html>")).toThrow("TCX invalide")
  })
})
