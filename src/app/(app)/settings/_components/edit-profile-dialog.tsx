"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/shadcn-ui/field"
import { Input } from "@/components/shadcn-ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { updateProfileAction } from "../_actions/update-profile-action"
import {
  type UpdateProfileType,
  updateProfileSchema,
} from "../_schemas/update-profile-schema"

export function EditProfileDialog({ name, username }: UpdateProfileType) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { control, handleSubmit, reset } = useForm<UpdateProfileType>({
    resolver: standardSchemaResolver(updateProfileSchema),
    defaultValues: { name, username },
  })

  const { execute, isPending } = useAction(updateProfileAction, {
    onSuccess: ({ data }) => {
      if (data && "error" in data) {
        toast.error(data.error)
        return
      }
      toast.success("Profil mis à jour.")
      setOpen(false)
      router.refresh()
    },
    onError: () => toast.error("Impossible de mettre à jour le profil."),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset({ name, username })
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Ton nom est affiché dans le fil, les classements et sur Discord.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-profile"
          onSubmit={handleSubmit((values) => execute(values))}
          className="space-y-4"
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nom d'utilisateur</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Utilisé dans l'adresse de ton profil.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <LoadingButton
            type="submit"
            form="edit-profile"
            isLoading={isPending}
            className="cursor-pointer"
          >
            Enregistrer
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
