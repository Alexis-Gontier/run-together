"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/shadcn-ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import {
  changePasswordSchema,
  type ChangePasswordType,
} from "@/lib/schemas/auth-schema"
import { changePasswordAction } from "../_actions/change-password-action"

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)

  const { control, handleSubmit, reset } = useForm<ChangePasswordType>({
    resolver: standardSchemaResolver(changePasswordSchema),
  })

  const { execute, isPending } = useAction(changePasswordAction, {
    onSuccess: () => {
      toast.success("Mot de passe modifié.")
      setOpen(false)
      reset()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le mot de passe</DialogTitle>
          <DialogDescription>
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => execute(data))}
          className="flex flex-col gap-4"
        >
          <Controller
            name="currentPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="currentPassword">
                  Mot de passe actuel
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="currentPassword"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="newPassword">
                  Nouveau mot de passe
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="newPassword"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="confirmPassword"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <DialogFooter>
            <LoadingButton type="submit" isLoading={isPending}>
              Enregistrer
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
