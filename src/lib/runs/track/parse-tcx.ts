import { XMLParser } from "fast-xml-parser"
import type { RunSportType } from "../schemas"
import { type ParsedTrack, TrackParseError, type TrackPoint } from "./types"

type TcxPoint = {
  Time?: string
  Position?: {
    LatitudeDegrees?: number | string
    LongitudeDegrees?: number | string
  }
  AltitudeMeters?: number | string
  DistanceMeters?: number | string
  HeartRateBpm?: { Value?: number | string }
  Cadence?: number | string
  Extensions?: { TPX?: { RunCadence?: number | string } }
}

type TcxLap = {
  Calories?: number | string
  Track?: { Trackpoint?: TcxPoint[] }[]
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  isArray: (name) => ["Activity", "Lap", "Track", "Trackpoint"].includes(name),
})

const num = (v: unknown): number | null => {
  const n = Number(v)
  return v == null || v === "" || Number.isNaN(n) ? null : n
}

/** Attribut `Sport` TCX (`Running`, `Run`, `Biking`, `Other`) : seule la course est acceptée. */
function tcxSportType(sport: unknown): RunSportType | null {
  if (typeof sport !== "string") return null
  const s = sport.toLowerCase()
  if (s.startsWith("run")) return "Run"
  if (s === "other") return null
  throw new TrackParseError(
    "Ce fichier n'est pas une course à pied : seules les courses sont acceptées.",
  )
}

export function parseTcx(xml: string): ParsedTrack {
  let doc: {
    TrainingCenterDatabase?: {
      Activities?: {
        Activity?: {
          Sport?: string
          Creator?: { Name?: string }
          Lap?: TcxLap[]
        }[]
      }
    }
  }
  try {
    doc = parser.parse(xml)
  } catch {
    throw new TrackParseError("Fichier TCX invalide.")
  }
  const activity = doc.TrainingCenterDatabase?.Activities?.Activity?.[0]
  if (!activity) throw new TrackParseError("Fichier TCX invalide.")

  const sportType = tcxSportType(activity.Sport)
  const points: TrackPoint[] = []
  let calories: number | null = null
  for (const lap of activity.Lap ?? []) {
    const cal = num(lap.Calories)
    if (cal != null) calories = (calories ?? 0) + cal
    for (const track of lap.Track ?? []) {
      for (const p of track.Trackpoint ?? []) {
        const time = p.Time ? new Date(p.Time) : null
        if (!time || Number.isNaN(time.getTime())) continue
        points.push({
          lat: num(p.Position?.LatitudeDegrees),
          lng: num(p.Position?.LongitudeDegrees),
          ele: num(p.AltitudeMeters),
          time,
          hr: num(p.HeartRateBpm?.Value),
          cad: num(p.Cadence) ?? num(p.Extensions?.TPX?.RunCadence),
          dist: num(p.DistanceMeters),
        })
      }
    }
  }

  const creator = activity.Creator?.Name
  return {
    points,
    name: null,
    sportType,
    deviceName: typeof creator === "string" ? creator.trim() || null : null,
    calories: calories != null ? Math.round(calories) : null,
  }
}
