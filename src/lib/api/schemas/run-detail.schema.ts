import { z } from "zod";

export const runDetailUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
});

export const runDetailSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stravaId: z.bigint().nullable(),
  date: z.string(),
  distance: z.number(),
  duration: z.number(),
  pace: z.number(),
  elevationGain: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: runDetailUserSchema,
});

export const runDetailResponseSchema = z.object({
  success: z.boolean(),
  data: runDetailSchema,
});

export type RunDetailUser = z.infer<typeof runDetailUserSchema>;
export type RunDetail = z.infer<typeof runDetailSchema>;
export type RunDetailResponse = z.infer<typeof runDetailResponseSchema>;
