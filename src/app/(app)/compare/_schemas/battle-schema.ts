import { z } from "zod"

export const publishBattleSchema = z.object({
  with: z.string().min(1, "Choisis un membre"),
  period: z.enum(["1m", "3m", "6m", "1y", "all"]),
})

export type PublishBattleInput = z.infer<typeof publishBattleSchema>
