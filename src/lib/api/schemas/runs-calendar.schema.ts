import { z } from 'zod';

export const runCalendarDataSchema = z.object({
  hasActivity: z.boolean(),
  runs: z.array(
    z.object({
      id: z.string(),
      distance: z.number(),
      duration: z.number(),
      pace: z.number(),
    })
  ),
});

export const runsCalendarResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    calendar: z.record(z.string(), runCalendarDataSchema),
    year: z.number(),
    stats: z.object({
      totalRuns: z.number(),
      totalDistance: z.number(),
      totalHours: z.number(),
    }),
  }),
});

export type RunCalendarData = z.infer<typeof runCalendarDataSchema>;
export type RunsCalendarResponse = z.infer<typeof runsCalendarResponseSchema>;
