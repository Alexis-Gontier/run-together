import { z } from "zod"

// --- OAuth ---

export const stravaTokenRefreshSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
})
export type StravaTokenRefresh = z.infer<typeof stravaTokenRefreshSchema>

export const stravaTokenExchangeSchema = stravaTokenRefreshSchema.extend({
  athlete: z.object({ id: z.number() }),
})
export type StravaTokenExchange = z.infer<typeof stravaTokenExchangeSchema>

// --- Athlete ---

export const stravaAthleteSchema = z.object({
  id: z.number(),
  username: z.string().nullable(),
  firstname: z.string(),
  lastname: z.string(),
  profile: z.string(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  sex: z.string().nullable(),
})
export type StravaAthlete = z.infer<typeof stravaAthleteSchema>

// --- Activity ---

export const stravaActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  sport_type: z.string(),
  start_date: z.string(),
  start_date_local: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number(),
  total_elevation_gain: z.number(),
  average_speed: z.number(),
  max_speed: z.number(),
  average_heartrate: z.number().nullish(),
  max_heartrate: z.number().nullish(),
  average_cadence: z.number().nullish(),
  start_latlng: z
    .union([z.tuple([z.number(), z.number()]), z.tuple([])])
    .optional(),
  map: z
    .object({
      id: z.string(),
      summary_polyline: z.string().nullable(),
    })
    .optional(),
})
export type StravaActivity = z.infer<typeof stravaActivitySchema>

// --- Detailed Activity (GET /activities/{id}) ---

const splitMetricSchema = z.object({
  split: z.number(),
  distance: z.number(),
  moving_time: z.number(),
  elevation_difference: z.number().optional(),
  average_heartrate: z.number().optional(),
  average_cadence: z.number().optional(),
})

export const stravaActivityDetailSchema = stravaActivitySchema.extend({
  calories: z.number().optional(),
  device_name: z.string().optional(),
  splits_metric: z.array(splitMetricSchema).optional(),
  map: z
    .object({
      id: z.string(),
      summary_polyline: z.string().nullable(),
      polyline: z.string().nullable(),
    })
    .optional(),
})
export type StravaActivityDetail = z.infer<typeof stravaActivityDetailSchema>
