import { z } from "zod"
import {
  usernameSchema,
  nameSchema,
  emailSchema,
  passwordSchema,
} from "@/lib/schemas/auth-schema"

export const banUserSchema = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
})
export type BanUserType = z.infer<typeof banUserSchema>

export const unbanUserSchema = z.object({
  userId: z.string(),
})
export type UnbanUserType = z.infer<typeof unbanUserSchema>

export const deleteUserSchema = z.object({
  userId: z.string(),
})
export type DeleteUserType = z.infer<typeof deleteUserSchema>

export const setRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["user", "admin"]),
})
export type SetRoleType = z.infer<typeof setRoleSchema>

export const impersonateUserSchema = z.object({
  userId: z.string(),
})
export type ImpersonateUserType = z.infer<typeof impersonateUserSchema>

export const createUserSchema = z.object({
  username: usernameSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["user", "admin"]),
})
export type CreateUserType = z.infer<typeof createUserSchema>

export const changePasswordSchema = z.object({
  userId: z.string(),
  newPassword: passwordSchema,
})
export type ChangePasswordType = z.infer<typeof changePasswordSchema>

export const setOnboardingSchema = z.object({
  userId: z.string(),
  completed: z.boolean(),
})
export type SetOnboardingType = z.infer<typeof setOnboardingSchema>

export const revokeSessionsSchema = z.object({
  userId: z.string(),
})
export type RevokeSessionsType = z.infer<typeof revokeSessionsSchema>
