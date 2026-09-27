import {
  Encoder,
  type FileIdMesg,
  Profile,
  type RecordMesg,
  type SessionMesg,
} from "@garmin/fitsdk"
import { describe, expect, it } from "vitest"
import { parseFit } from "./parse-fit"

const DEG_TO_SEMICIRCLE = 2 ** 31 / 180

function buildFit(
  sport: SessionMesg["sport"],
  subSport: SessionMesg["subSport"] = "generic",
  // Façon Amazfit : la position et la distance dans deux records au même horodatage.
  splitRecords = false,
): Uint8Array {
  const start = new Date("2026-09-20T07:00:00Z")
  const encoder = new Encoder()
  const fileId: FileIdMesg = {
    type: "activity",
    manufacturer: "garmin",
    product: 0,
    timeCreated: start,
    serialNumber: 1234,
  }
  encoder.onMesg(Profile.MesgNum.FILE_ID, fileId)
  for (let i = 0; i < 3; i++) {
    const timestamp = new Date(start.getTime() + i * 10_000)
    const position: RecordMesg = {
      timestamp,
      positionLat: Math.round((45 + i * 0.0003) * DEG_TO_SEMICIRCLE),
      positionLong: Math.round(5 * DEG_TO_SEMICIRCLE),
      heartRate: 140 + i,
    }
    const distance: RecordMesg = { timestamp, distance: i * 30 }
    if (splitRecords) {
      encoder.onMesg(Profile.MesgNum.RECORD, position)
      encoder.onMesg(Profile.MesgNum.RECORD, distance)
    } else {
      encoder.onMesg(Profile.MesgNum.RECORD, { ...position, ...distance })
    }
  }
  const session: SessionMesg = {
    timestamp: new Date(start.getTime() + 20_000),
    startTime: start,
    sport,
    subSport,
    totalCalories: 42,
  }
  encoder.onMesg(Profile.MesgNum.SESSION, session)
  return encoder.close()
}

describe("parseFit", () => {
  it("lit points, coordonnées en degrés, calories et type", () => {
    const t = parseFit(buildFit("running", "trail"))
    expect(t.points).toHaveLength(3)
    expect(t.points[0].lat).toBeCloseTo(45, 4)
    expect(t.points[0].lng).toBeCloseTo(5, 4)
    expect(t.points[2]).toMatchObject({ hr: 142, dist: 60 })
    expect(t.calories).toBe(42)
    expect(t.sportType).toBe("TrailRun")
    expect(t.deviceName).toMatch(/^Garmin/)
  })

  it("fusionne les records qui partagent un horodatage", () => {
    const t = parseFit(buildFit("running", "generic", true))
    expect(t.points).toHaveLength(3)
    expect(t.points[2]).toMatchObject({ hr: 142, dist: 60 })
    expect(t.points[2].lat).toBeCloseTo(45.0006, 4)
  })

  it("refuse une activité qui n'est pas de la course", () => {
    expect(() => parseFit(buildFit("cycling"))).toThrow("course à pied")
  })

  it("refuse des octets qui ne sont pas du FIT", () => {
    expect(() => parseFit(new TextEncoder().encode("hello"))).toThrow(
      "FIT invalide",
    )
  })
})
