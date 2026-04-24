import { z } from "zod"

export const leaderboardMetricSchema = z.enum(["distance", "runs", "pace"])
export type LeaderboardMetric = z.infer<typeof leaderboardMetricSchema>

export const leaderboardPeriodSchema = z.enum([
  "week",
  "month",
  "3m",
  "6m",
  "1y",
  "all",
])
export type LeaderboardPeriod = z.infer<typeof leaderboardPeriodSchema>

export const getLeaderboardSchema = z.object({
  metric: leaderboardMetricSchema.default("distance"),
  period: leaderboardPeriodSchema.default("month"),
})
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>
