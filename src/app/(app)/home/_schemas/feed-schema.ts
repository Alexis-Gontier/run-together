import { z } from "zod"

export const feedSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  // « Tout le monde » ou seulement mes courses
  scope: z.enum(["all", "me"]).default("all"),
})

export type FeedScope = z.infer<typeof feedSchema>["scope"]

export type FeedInput = z.infer<typeof feedSchema>
