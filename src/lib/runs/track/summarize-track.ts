import type { TrackData } from "../schemas"
import { encodePolyline } from "./encode-polyline"
import { haversine } from "./geo"
import {
  type ParsedTrack,
  TrackParseError,
  type TrackPoint,
  type TrackSummary,
} from "./types"

// Un segment est une pause s'il avance à moins de 0,5 m/s, ou s'il couvre plus de 30 s pour
// moins de 10 m (montre en pause automatique qui reprend plus loin).
const PAUSE_SPEED = 0.5
const PAUSE_GAP_S = 30
const PAUSE_GAP_M = 10
// Le D+ ne compte qu'au-delà de 3 m d'écart avec le dernier palier : lisse le bruit altimétrique.
const ELE_HYSTERESIS = 3
// Le dernier split n'est gardé que s'il fait au moins 50 m.
const MIN_LAST_SPLIT = 50
const SUMMARY_MAX_POINTS = 200

export function summarizeTrack(parsed: ParsedTrack): TrackSummary {
  const pts = parsed.points
  if (pts.length < 2)
    throw new TrackParseError("Le fichier ne contient aucun point exploitable.")

  let distance = 0
  let moving = 0
  let gain = 0
  let eleRef = pts.find((p) => p.ele != null)?.ele ?? null
  // Dernière altitude connue, et altitude au début du split en cours (dénivelé net par split).
  let lastEle = eleRef
  let splitStartEle = eleRef

  const splits: TrackData["splits"] = []
  let splitStart = 0
  let splitHr: number[] = []
  let nextKm = 1000

  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dt = (b.time.getTime() - a.time.getTime()) / 1000
    if (dt <= 0) continue

    const d = segmentDistance(a, b)
    const paused = d / dt < PAUSE_SPEED || (dt > PAUSE_GAP_S && d < PAUSE_GAP_M)

    if (!paused) {
      // Interpoler chaque frontière de kilomètre franchie dans ce segment.
      while (distance + d >= nextKm) {
        const frac = (nextKm - distance) / d
        const at = moving + dt * frac
        const eleAt =
          a.ele != null && b.ele != null
            ? a.ele + (b.ele - a.ele) * frac
            : lastEle
        splits.push({
          kilometer: splits.length + 1,
          distance: 1000,
          duration: Math.round(at - splitStart),
          heartRate: average(splitHr),
          elevation: netElevation(splitStartEle, eleAt),
        })
        splitStart = at
        splitStartEle = eleAt
        splitHr = []
        nextKm += 1000
      }
      distance += d
      moving += dt
    }
    if (b.hr != null) splitHr.push(b.hr)
    if (b.ele != null) lastEle = b.ele

    if (b.ele != null && eleRef != null) {
      if (b.ele - eleRef >= ELE_HYSTERESIS) {
        gain += b.ele - eleRef
        eleRef = b.ele
      } else if (eleRef - b.ele >= ELE_HYSTERESIS) {
        eleRef = b.ele
      }
    }
  }

  const rest = distance - (nextKm - 1000)
  if (rest >= MIN_LAST_SPLIT) {
    splits.push({
      kilometer: splits.length + 1,
      distance: Math.round(rest),
      duration: Math.round(moving - splitStart),
      heartRate: average(splitHr),
      elevation: netElevation(splitStartEle, lastEle),
    })
  }

  const coords = pts.flatMap((p) =>
    p.lat != null && p.lng != null ? [[p.lat, p.lng] as [number, number]] : [],
  )
  const step = Math.max(1, Math.ceil(coords.length / SUMMARY_MAX_POINTS))
  const summary = coords.filter(
    (_, i) => i % step === 0 || i === coords.length - 1,
  )

  const hrs = pts.flatMap((p) => (p.hr != null ? [p.hr] : []))
  const cads = pts.flatMap((p) => (p.cad != null ? [p.cad] : []))

  return {
    name: parsed.name,
    sportType: parsed.sportType ?? "Run",
    date: pts[0].time,
    distance: Math.round(distance),
    duration: Math.round(moving),
    elevation: Math.round(gain),
    heartRateAvg: average(hrs),
    heartRateMax: hrs.length ? Math.max(...hrs) : null,
    cadenceAvg: average(cads),
    calories: parsed.calories,
    track: {
      polyline: coords.length ? encodePolyline(coords) : null,
      summaryPolyline: summary.length ? encodePolyline(summary) : null,
      startLat: coords[0]?.[0] ?? null,
      startLng: coords[0]?.[1] ?? null,
      deviceName: parsed.deviceName,
      splits,
    },
  }
}

function segmentDistance(a: TrackPoint, b: TrackPoint): number {
  if (a.dist != null && b.dist != null) return Math.max(0, b.dist - a.dist)
  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null)
    return haversine(a.lat, a.lng, b.lat, b.lng)
  return 0
}

function netElevation(from: number | null, to: number | null): number | null {
  if (from == null || to == null) return null
  return Math.round((to - from) * 10) / 10
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length)
}
