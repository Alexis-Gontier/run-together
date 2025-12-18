import { z } from "zod";

export const userCalendarRunSchema = z.object({
  id: z.string(),
  distance: z.number(),
  duration: z.number(),
  pace: z.number(),
});

export const userCalendarDaySchema = z.object({
  hasActivity: z.boolean(),
  runs: z.array(userCalendarRunSchema),
});

export const userCalendarStatsSchema = z.object({
  totalRuns: z.number(),
  totalDistance: z.number(),
  totalHours: z.number(),
});

export const userCalendarDataSchema = z.object({
  calendar: z.record(z.string(), userCalendarDaySchema),
  year: z.number(),
  stats: userCalendarStatsSchema,
});

export const userCalendarResponseSchema = z.object({
  success: z.boolean(),
  data: userCalendarDataSchema,
});

export type UserCalendarRun = z.infer<typeof userCalendarRunSchema>;
export type UserCalendarDay = z.infer<typeof userCalendarDaySchema>;
export type UserCalendarStats = z.infer<typeof userCalendarStatsSchema>;
export type UserCalendarData = z.infer<typeof userCalendarDataSchema>;
export type UserCalendarResponse = z.infer<typeof userCalendarResponseSchema>;
