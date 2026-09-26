import type { z } from "zod"
import type { RecordRunInput } from "@/lib/runs/schemas"
import type { stravaActivityDetailSchema } from "./schemas"

type StravaActivityDetail = z.infer<typeof stravaActivityDetailSchema>

const round = (v: number | null | undefined) =>
  v == null ? null : Math.round(v)

/**
 * Activité Strava → entrée de `recordRun`. Volontairement **non** repassée par
 * `recordRunInputSchema` : l'historique Strava peut sortir des bornes d'allure (marche, pauses)
 * et doit rester importable.
 */
export function stravaActivityToRunInput(
  activity: StravaActivityDetail,
): RecordRunInput {
  return {
    name: activity.name,
    sportType: activity.sport_type as RecordRunInput["sportType"],
    distance: Math.round(activity.distance),
    duration: activity.moving_time,
    elevation: Math.round(activity.total_elevation_gain),
    date: new Date(activity.start_date),
    heartRateAvg: round(activity.average_heartrate),
    heartRateMax: round(activity.max_heartrate),
    cadenceAvg: round(activity.average_cadence),
    calories: round(activity.calories),
    startLat: activity.start_latlng?.[0] ?? null,
    startLng: activity.start_latlng?.[1] ?? null,
    summaryPolyline: activity.map?.summary_polyline ?? null,
    polyline: activity.map?.polyline ?? null,
    deviceName: activity.device_name ?? null,
    splits: (activity.splits_metric ?? []).map((s) => ({
      kilometer: s.split,
      distance: s.distance,
      duration: s.moving_time,
      heartRate: round(s.average_heartrate),
      elevation: s.elevation_difference ?? null,
    })),
  }
}
