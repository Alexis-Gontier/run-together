import { z } from "zod"

export const progressPeriodSchema = z.enum(["3m", "6m", "1y", "all"])
export type ProgressPeriod = z.infer<typeof progressPeriodSchema>

export const getProgressSchema = z.object({
  period: progressPeriodSchema.default("3m"),
})
export type GetProgressInput = z.infer<typeof getProgressSchema>
