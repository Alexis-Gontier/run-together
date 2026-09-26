import { z } from "zod"
import { computePace } from "./pace"

export const RUN_SPORT_TYPES = ["Run", "TrailRun", "VirtualRun"] as const
export type RunSportType = (typeof RUN_SPORT_TYPES)[number]

const MIN_PACE = 120 // 2'00"/km
const MAX_PACE = 1200 // 20'00"/km

const splitInputSchema = z.object({
  kilometer: z.int().positive(),
  distance: z.number().positive(),
  duration: z.int().nonnegative(),
  heartRate: z.int().positive().nullable(),
  elevation: z.number().nullable(),
})
export type SplitInput = z.infer<typeof splitInputSchema>

/** Données de trace issues d'un fichier GPX/FIT, renvoyées au formulaire puis à l'enregistrement. */
export const trackDataSchema = z.object({
  polyline: z.string().nullable(),
  summaryPolyline: z.string().nullable(),
  startLat: z.number().nullable(),
  startLng: z.number().nullable(),
  deviceName: z.string().max(100).nullable(),
  splits: z.array(splitInputSchema).max(400),
})
export type TrackData = z.infer<typeof trackDataSchema>

/** Entrée normalisée de `recordRun`, quelle que soit la source. */
export const recordRunInputSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis.").max(100),
    sportType: z.enum(RUN_SPORT_TYPES),
    distance: z
      .int()
      .min(100, "Distance minimale : 0,1 km.")
      .max(300_000, "Distance maximale : 300 km."),
    duration: z.int().positive("La durée est requise."),
    elevation: z.int().min(0).max(20_000).default(0),
    // `coerce` : la date traverse la frontière Server Action, sérialisée ou non.
    date: z.coerce
      .date("Date invalide.")
      .refine((d) => d.getTime() <= Date.now() + 60_000, {
        message: "La date ne peut pas être dans le futur.",
      }),
    heartRateAvg: z.int().min(30).max(250).nullish(),
    heartRateMax: z.int().min(30).max(250).nullish(),
    cadenceAvg: z.int().min(20).max(300).nullish(),
    calories: z.int().min(0).max(20_000).nullish(),
    splits: z.array(splitInputSchema).max(400).default([]),
    polyline: z.string().nullish(),
    summaryPolyline: z.string().nullish(),
    startLat: z.number().nullish(),
    startLng: z.number().nullish(),
    deviceName: z.string().max(100).nullish(),
  })
  .refine(
    (r) => {
      const p = computePace(r.distance, r.duration)
      return p >= MIN_PACE && p <= MAX_PACE
    },
    {
      message:
        "Allure improbable : elle doit être entre 2'00\" et 20'00\" /km.",
      path: ["duration"],
    },
  )
export type RecordRunInput = z.infer<typeof recordRunInputSchema>
