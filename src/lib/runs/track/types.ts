import type { RunSportType, TrackData } from "../schemas"

export type TrackPoint = {
  lat: number | null
  lng: number | null
  ele: number | null
  time: Date
  hr: number | null
  cad: number | null
  // Distance cumulée fournie par l'appareil (FIT), en mètres — plus fiable que le GPS brut
  dist: number | null
}

export type ParsedTrack = {
  points: TrackPoint[]
  name: string | null
  sportType: RunSportType | null
  deviceName: string | null
  calories: number | null
}

export type TrackSummary = {
  name: string | null
  sportType: RunSportType
  date: Date
  distance: number
  duration: number
  elevation: number
  heartRateAvg: number | null
  heartRateMax: number | null
  cadenceAvg: number | null
  calories: number | null
  track: TrackData
}

/** Erreur attendue (fichier illisible, mauvais sport) : son message est montré tel quel. */
export class TrackParseError extends Error {}
