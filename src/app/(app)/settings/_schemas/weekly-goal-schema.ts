import { z } from "zod"

export const weeklyGoalSchema = z.object({
  // null : pas d'objectif
  weeklyGoalKm: z
    .int("Nombre entier de kilomètres.")
    .min(1, "Au moins 1 km.")
    .max(300, "300 km maximum.")
    .nullable(),
})
export type WeeklyGoalType = z.infer<typeof weeklyGoalSchema>
