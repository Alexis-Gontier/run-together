import { z } from "zod"
import { nameSchema, usernameSchema } from "@/lib/schemas/auth-schema"

export const updateProfileSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
})
export type UpdateProfileType = z.infer<typeof updateProfileSchema>
