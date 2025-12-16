import { z } from "zod";

export const userItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  totalRuns: z.number(),
  createdAt: z.string(),
});

export const usersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userItemSchema),
  meta: z.object({
    total: z.number(),
    limit: z.number(),
  }),
});

export type UserItem = z.infer<typeof userItemSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
