"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordType>({
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
          <Field>
            <FieldLabel htmlFor="currentPassword">
              Mot de passe actuel
            </FieldLabel>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            <FieldError errors={[errors.currentPassword]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            <FieldError errors={[errors.newPassword]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirmer le mot de passe
            </FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
