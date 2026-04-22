import type { StravaActivity } from "@/lib/strava/schemas"

// Summary activity returned by GET /athlete/activities
// Detailed fields (cadence, splits, etc.) require GET /activities/{id}
export type StravaActivitySummary = StravaActivity
