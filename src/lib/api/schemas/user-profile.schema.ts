import { z } from "zod";

export const userStatsSchema = z.object({
  totalRuns: z.number(),
  totalDistance: z.number(),
  totalDuration: z.number(),
  averagePace: z.number(),
  totalElevation: z.number(),
  longestRun: z.number(),
  fastestPace: z.number(),
  currentMonthRuns: z.number(),
  currentMonthDistance: z.number(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  createdAt: z.string(),
  monthObjectif: z.number().nullable(),
  stats: userStatsSchema,
});

export const userProfileResponseSchema = z.object({
  success: z.boolean(),
  data: userProfileSchema,
});

export type UserStats = z.infer<typeof userStatsSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
