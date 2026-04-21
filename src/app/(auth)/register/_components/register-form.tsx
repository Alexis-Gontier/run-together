"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Field, FieldError, FieldLabel } from "@/components/shadcn-ui/field"
import { Input } from "@/components/shadcn-ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { signUpSchema, type SignUpType } from "@/lib/schemas/auth-schema"
import { registerAction } from "../_actions/register-action"

export function RegisterForm() {
  const form = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { execute, isPending } = useAction(registerAction, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Une erreur est survenue.")
    },
  })

  function onSubmit(data: SignUpType) {
    execute(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
            <Input
              {...field}
              id={field.name}
              autoComplete="name"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="username"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Nom d&apos;utilisateur</FieldLabel>
            <Input
              {...field}
              id={field.name}
              autoComplete="username"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              autoComplete="email"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
            <PasswordInput
              {...field}
              id={field.name}
              autoComplete="new-password"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Confirmer le mot de passe
            </FieldLabel>
            <PasswordInput
              {...field}
              id={field.name}
              autoComplete="new-password"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <LoadingButton
        type="submit"
        isLoading={isPending}
        className="w-full cursor-pointer"
      >
        Créer un compte
      </LoadingButton>
    </form>
  )
}
