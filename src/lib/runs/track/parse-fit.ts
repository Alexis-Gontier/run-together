import { Decoder, Stream } from "@garmin/fitsdk"
import type { RunSportType } from "../schemas"
import { type ParsedTrack, TrackParseError, type TrackPoint } from "./types"

// Les positions FIT sont en semicercles : 2³¹ semicercles = 180°.
const SEMICIRCLE_TO_DEG = 180 / 2 ** 31

type FitRecord = {
  timestamp?: Date
  positionLat?: number
  positionLong?: number
  altitude?: number
  enhancedAltitude?: number
  heartRate?: number
  cadence?: number
  distance?: number
}
type FitSession = { sport?: string; subSport?: string; totalCalories?: number }
type FitFileId = {
  manufacturer?: string
  garminProduct?: string
  product?: number
}

const deg = (v: number | undefined) =>
  v == null ? null : v * SEMICIRCLE_TO_DEG

function fitSportType(session: FitSession | undefined): RunSportType {
  const sport = session?.sport
  const sub = session?.subSport ?? ""
  if (sport !== "running")
    throw new TrackParseError("Ce fichier n'est pas une course à pied.")
  if (sub.includes("trail")) return "TrailRun"
  if (sub.includes("treadmill") || sub.includes("virtual")) return "VirtualRun"
  return "Run"
}

function fitDeviceName(fileId: FitFileId | undefined): string | null {
  if (!fileId?.manufacturer) return null
  const brand =
    fileId.manufacturer.charAt(0).toUpperCase() + fileId.manufacturer.slice(1)
  return fileId.garminProduct ? `${brand} ${fileId.garminProduct}` : brand
}

export function parseFit(bytes: Uint8Array): ParsedTrack {
  const stream = Stream.fromByteArray(Array.from(bytes))
  if (!Decoder.isFIT(stream)) throw new TrackParseError("Fichier FIT invalide.")

  const { messages, errors } = new Decoder(stream).read({
    convertDateTimesToDates: true,
    applyScaleAndOffset: true,
    convertTypesToStrings: true,
  })
  if (errors.length > 0) throw new TrackParseError("Fichier FIT corrompu.")

  const session = (messages.sessionMesgs as FitSession[] | undefined)?.[0]
  const sportType = fitSportType(session)

  const points: TrackPoint[] = []
  for (const r of (messages.recordMesgs as FitRecord[] | undefined) ?? []) {
    if (!r.timestamp) continue
    points.push({
      lat: deg(r.positionLat),
      lng: deg(r.positionLong),
      ele: r.enhancedAltitude ?? r.altitude ?? null,
      time: r.timestamp,
      hr: r.heartRate ?? null,
      cad: r.cadence ?? null,
      dist: r.distance ?? null,
    })
  }

  return {
    points,
    name: null,
    sportType,
    deviceName: fitDeviceName(
      (messages.fileIdMesgs as FitFileId[] | undefined)?.[0],
    ),
    calories: session?.totalCalories ?? null,
  }
}
