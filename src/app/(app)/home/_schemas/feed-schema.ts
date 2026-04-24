import { z } from "zod"

export const feedSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
})

export type FeedInput = z.infer<typeof feedSchema>
