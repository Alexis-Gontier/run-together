import { z } from "zod"

export const usernameSchema = z
  .string()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
  .max(20, "Le nom d'utilisateur doit contenir au maximum 20 caractères")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores",
  )
export const nameSchema = z.string().min(1).max(50)
export const emailSchema = z.email()
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe doit contenir au maximum 128 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(
    /[^A-Za-z0-9]/,
    "Le mot de passe doit contenir au moins un caractère spécial",
  )

export const signUpSchema = z
  .object({
    username: usernameSchema,
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1).max(128),
})

export type SignUpType = z.infer<typeof signUpSchema>
export type SignInType = z.infer<typeof signInSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export type ChangePasswordType = z.infer<typeof changePasswordSchema>

export const onboardingDisplayNameSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères."),
})

export type OnboardingDisplayNameType = z.infer<
  typeof onboardingDisplayNameSchema
>

export const onboardingEmailSchema = z.object({
  email: z.email("L'adresse e-mail est invalide."),
})

export type OnboardingEmailType = z.infer<typeof onboardingEmailSchema>
