import { z } from "zod"
import { defaultRunName } from "@/lib/runs/pace"
import {
  type RecordRunInput,
  RUN_SPORT_TYPES,
  trackDataSchema,
} from "@/lib/runs/schemas"

// Champ numérique facultatif d'un <input> : "" → null, sinon entier borné.
const optionalInt = (min: number, max: number, label: string) =>
  z
    .union([
      z.literal(""),
      z.coerce
        .number(`${label} invalide.`)
        .int(`${label} : nombre entier attendu.`)
        .min(min, `${label} : minimum ${min}.`)
        .max(max, `${label} : maximum ${max}.`),
    ])
    .transform((v) => (v === "" ? null : v))

const durationPart = (max: number) =>
  z.coerce.number("Durée invalide.").int("Durée invalide.").min(0).max(max)

export const runFormSchema = z
  .object({
    name: z.string().trim().max(100, "100 caractères maximum."),
    sportType: z.enum(RUN_SPORT_TYPES),
    date: z.iso.date("Date invalide."),
    time: z.iso.time({ precision: -1, error: "Heure invalide." }),
    distanceKm: z.coerce
      .number("Distance invalide.")
      .min(0.1, "Distance minimale : 0,1 km.")
      .max(300, "Distance maximale : 300 km."),
    hours: durationPart(99),
    minutes: durationPart(59),
    seconds: durationPart(59),
    elevation: optionalInt(0, 20_000, "D+"),
    heartRateAvg: optionalInt(30, 250, "FC moyenne"),
    heartRateMax: optionalInt(30, 250, "FC max"),
    cadenceAvg: optionalInt(20, 300, "Cadence"),
    calories: optionalInt(0, 20_000, "Calories"),
    publishToDiscord: z.boolean(),
    track: trackDataSchema.nullable(),
  })
  .refine((v) => v.hours * 3600 + v.minutes * 60 + v.seconds > 0, {
    message: "La durée est requise.",
    path: ["minutes"],
  })
export type RunFormInput = z.input<typeof runFormSchema>
export type RunFormValues = z.output<typeof runFormSchema>

/**
 * Valeurs du formulaire → entrée de `recordRun`. Appelée **dans le navigateur** : la date et
 * l'heure saisies sont interprétées dans le fuseau de l'utilisateur.
 */
export function runFormToInput(values: RunFormValues): RecordRunInput {
  const date = new Date(`${values.date}T${values.time}`)
  const track = values.track
  return {
    name: values.name || defaultRunName(date),
    sportType: values.sportType,
    distance: Math.round(values.distanceKm * 1000),
    duration: values.hours * 3600 + values.minutes * 60 + values.seconds,
    elevation: values.elevation ?? 0,
    date,
    heartRateAvg: values.heartRateAvg,
    heartRateMax: values.heartRateMax,
    cadenceAvg: values.cadenceAvg,
    calories: values.calories,
    splits: track?.splits ?? [],
    polyline: track?.polyline ?? null,
    summaryPolyline: track?.summaryPolyline ?? null,
    startLat: track?.startLat ?? null,
    startLng: track?.startLng ?? null,
    deviceName: track?.deviceName ?? null,
  }
}
