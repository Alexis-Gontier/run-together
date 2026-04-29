import { z } from "zod"

export const leaderboardMetricSchema = z.enum([
  "distance",
  "runs",
  "pace",
  "pr",
])
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

export const prDistSchema = z.enum([
  "KM_1",
  "KM_5",
  "KM_10",
  "HALF_MARATHON",
  "MARATHON",
])
export type PrDist = z.infer<typeof prDistSchema>

export const getLeaderboardSchema = z.object({
  metric: leaderboardMetricSchema.default("distance"),
  period: leaderboardPeriodSchema.default("month"),
})
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>

export const getPrLeaderboardSchema = z.object({
  dist: prDistSchema.default("KM_5"),
})
export type GetPrLeaderboardInput = z.infer<typeof getPrLeaderboardSchema>
