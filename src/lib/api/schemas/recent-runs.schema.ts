import { z } from "zod";

export const recentRunUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  image: z.string().nullable(),
});

export const recentRunSchema = z.object({
  id: z.string(),
  date: z.string(),
  distance: z.number(),
  duration: z.number(),
  pace: z.number(),
  elevationGain: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  user: recentRunUserSchema,
});

export const recentRunsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(recentRunSchema),
});

export type RecentRunUser = z.infer<typeof recentRunUserSchema>;
export type RecentRun = z.infer<typeof recentRunSchema>;
export type RecentRunsResponse = z.infer<typeof recentRunsResponseSchema>;
