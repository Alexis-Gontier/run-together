import { z } from "zod";

export const runSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stravaId: z.bigint().nullable(),
  date: z.string().or(z.date()),
  distance: z.number(),
  duration: z.number(),
  pace: z.number(),
  elevationGain: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const runsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(runSchema),
  meta: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});

export type Run = z.infer<typeof runSchema>;
export type RunsResponse = z.infer<typeof runsResponseSchema>;
