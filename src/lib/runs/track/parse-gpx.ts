import { XMLParser } from "fast-xml-parser"
import type { RunSportType } from "../schemas"
import { type ParsedTrack, TrackParseError, type TrackPoint } from "./types"

type GpxPoint = {
  lat?: string
  lon?: string
  ele?: number | string
  time?: string
  extensions?: {
    TrackPointExtension?: { hr?: number | string; cad?: number | string }
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  isArray: (name) => ["trk", "trkseg", "trkpt"].includes(name),
})

const num = (v: unknown): number | null => {
  const n = Number(v)
  return v == null || v === "" || Number.isNaN(n) ? null : n
}

/** Type GPX libre (`running`, `trail_running`, `treadmill`…) → type de course, ou null. */
export function gpxSportType(type: unknown): RunSportType | null {
  if (typeof type !== "string") return null
  const t = type.toLowerCase()
  if (t.includes("trail")) return "TrailRun"
  if (t.includes("treadmill") || t.includes("virtual")) return "VirtualRun"
  if (t.includes("run")) return "Run"
  return null
}

export function parseGpx(xml: string): ParsedTrack {
  let doc: {
    gpx?: {
      creator?: string
      trk?: {
        name?: string
        type?: string
        trkseg?: { trkpt?: GpxPoint[] }[]
      }[]
    }
  }
  try {
    doc = parser.parse(xml)
  } catch {
    throw new TrackParseError("Fichier GPX invalide.")
  }
  const gpx = doc.gpx
  if (!gpx) throw new TrackParseError("Fichier GPX invalide.")

  const trk = gpx.trk?.[0]
  const points: TrackPoint[] = []
  for (const seg of trk?.trkseg ?? []) {
    for (const p of seg.trkpt ?? []) {
      const time = p.time ? new Date(p.time) : null
      if (!time || Number.isNaN(time.getTime())) continue
      const ext = p.extensions?.TrackPointExtension
      points.push({
        lat: num(p.lat),
        lng: num(p.lon),
        ele: num(p.ele),
        time,
        hr: num(ext?.hr),
        cad: num(ext?.cad),
        dist: null,
      })
    }
  }

  return {
    points,
    name: typeof trk?.name === "string" ? trk.name.trim() || null : null,
    sportType: gpxSportType(trk?.type),
    deviceName: gpx.creator?.trim() || null,
    calories: null,
  }
}
