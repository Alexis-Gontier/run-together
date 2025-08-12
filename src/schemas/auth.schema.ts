import { z } from 'zod';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 2;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

const usernameValidation = z
  .string()
  .min(USERNAME_MIN_LENGTH, {
    message: `Le nom d'utilisateur doit contenir au moins ${USERNAME_MIN_LENGTH} caractères.`
  })
  .max(USERNAME_MAX_LENGTH, {
    message: `Le nom d'utilisateur ne peut pas dépasser ${USERNAME_MAX_LENGTH} caractères.`
  })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores."
  })

const passwordValidation = z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
        message: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
    })

const emailValidation = z
  .string()
  .email({
    message: "Veuillez entrer une adresse email valide."
  });

const nameValidation = z
  .string()
  .min(NAME_MIN_LENGTH, {
    message: `Le nom doit contenir au moins ${NAME_MIN_LENGTH} caractères.`
  })
  .max(NAME_MAX_LENGTH, {
    message: `Le nom ne peut pas dépasser ${NAME_MAX_LENGTH} caractères.`
  })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets."
  })

// Sign-up schema
export const signUpSchema = z.object({
  username: usernameValidation,
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
});

// Sign-in schema
export const signInSchema = z.object({
  username: usernameValidation,
  password: z.string().min(1, {
    message: "Le mot de passe est requis."
  }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;