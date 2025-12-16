import { z } from "zod";

export const leaderboardUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  image: z.string().nullable(),
  totalRuns: z.number(),
  totalDistance: z.number(),
  averagePace: z.number(),
  isCurrentUser: z.boolean(),
  rank: z.number(),
});

export const leaderboardResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    leaderboard: z.array(leaderboardUserSchema),
    currentUser: leaderboardUserSchema.nullable(),
    totalUsers: z.number(),
    period: z.string(),
    metric: z.string(),
  }),
});

export type LeaderboardUser = z.infer<typeof leaderboardUserSchema>;
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
