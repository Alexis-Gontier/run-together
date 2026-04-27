"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useAction } from "next-safe-action/hooks"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Field, FieldError, FieldLabel } from "@/components/shadcn-ui/field"
import { Input } from "@/components/shadcn-ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { signInSchema, type SignInType } from "@/lib/schemas/auth-schema"
import { loginAction } from "../_actions/login-action"

export function LoginWithUsernameForm() {
  const form = useForm<SignInType>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const { execute, isPending } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data?.error) toast.error(data.error)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Une erreur est survenue.")
    },
  })

  function onSubmit(data: SignInType) {
    execute(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
            <PasswordInput
              {...field}
              id={field.name}
              autoComplete="current-password"
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
        Se connecter
      </LoadingButton>
    </form>
  )
}
