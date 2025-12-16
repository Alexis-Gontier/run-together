import { z } from "zod";

export const userInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  image: z.string().nullable(),
});

export const comparisonStatsSchema = z.object({
  totalRuns: z.number(),
  totalDistance: z.number(),
  totalDuration: z.number(),
  averageDistance: z.number(),
  averagePace: z.number(),
  averageDuration: z.number(),
  totalElevationGain: z.number(),
  lastRunDate: z.string().nullable(),
  firstRunDate: z.string().nullable(),
  runsPerMonth: z.number(),
  bestPace: z.number().nullable(),
  longestRun: z.number().nullable(),
});

export const userComparisonSchema = z.object({
  user: userInfoSchema,
  stats: comparisonStatsSchema,
});

export const runsCompareResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    comparisons: z.array(userComparisonSchema),
    comparedBy: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }).nullable(),
  error: z.string().optional(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
export type ComparisonStats = z.infer<typeof comparisonStatsSchema>;
export type UserComparison = z.infer<typeof userComparisonSchema>;
export type RunsCompareResponse = z.infer<typeof runsCompareResponseSchema>;
