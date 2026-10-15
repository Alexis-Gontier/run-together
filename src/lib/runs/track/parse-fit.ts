import { Decoder, Stream } from "@garmin/fitsdk"
import type { RunSportType } from "../schemas"
import {
  NotARunError,
  type ParsedTrack,
  TrackParseError,
  type TrackPoint,
} from "./types"

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
  speed?: number
  enhancedSpeed?: number
}
type FitSession = {
  sport?: string
  subSport?: string
  totalCalories?: number
  totalDistance?: number
}
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
  if (sport !== "running") throw new NotARunError()
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

  const records = (messages.recordMesgs as FitRecord[] | undefined) ?? []
  const points: TrackPoint[] = []
  for (const r of records) {
    if (!r.timestamp) continue
    const point: TrackPoint = {
      lat: deg(r.positionLat),
      lng: deg(r.positionLong),
      ele: r.enhancedAltitude ?? r.altitude ?? null,
      time: r.timestamp,
      hr: r.heartRate ?? null,
      cad: r.cadence ?? null,
      dist: r.distance ?? null,
    }
    // Amazfit écrit deux records par seconde (position, puis distance) : on les fusionne,
    // sinon aucun segment n'a à la fois un temps et une distance.
    const prev = points.at(-1)
    if (prev?.time.getTime() === point.time.getTime()) {
      for (const key of Object.keys(point) as (keyof TrackPoint)[]) {
        if (key !== "time" && point[key] != null)
          Object.assign(prev, { [key]: point[key] })
      }
      continue
    }
    points.push(point)
  }
  if (!points.some((p) => p.dist != null || p.lat != null))
    distanceFromSpeed(points, records, session?.totalDistance)

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

/**
 * Zepp sans GPS (tapis, GPS coupé) : les records n'ont ni position ni distance, seulement la
 * vitesse. On l'intègre en distance cumulée, recalée sur le total de la session s'il existe.
 */
function distanceFromSpeed(
  points: TrackPoint[],
  records: FitRecord[],
  totalDistance: number | undefined,
) {
  const speedAt = new Map<number, number>()
  for (const r of records) {
    const v = r.enhancedSpeed ?? r.speed
    if (r.timestamp && v != null) speedAt.set(r.timestamp.getTime(), v)
  }
  if (speedAt.size === 0 || points.length === 0) return

  let dist = 0
  points[0].dist = 0
  for (let i = 1; i < points.length; i++) {
    const t = points[i].time.getTime()
    const dt = (t - points[i - 1].time.getTime()) / 1000
    dist += (speedAt.get(t) ?? 0) * dt
    points[i].dist = dist
  }
  if (totalDistance && dist > 0) {
    const scale = totalDistance / dist
    for (const p of points) p.dist = (p.dist ?? 0) * scale
  }
}
