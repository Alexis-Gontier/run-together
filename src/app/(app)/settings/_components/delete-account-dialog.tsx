"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog"
import { Button } from "@/components/shadcn-ui/button"
import { Field, FieldLabel } from "@/components/shadcn-ui/field"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { authClient } from "@/lib/auth/auth-client"
import { AUTH_ROUTES } from "@/lib/constants/routes"

/** Suppression définitive du compte, confirmée par le mot de passe (courses comprises). */
export function DeleteAccountDialog() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()

  function onConfirm() {
    startTransition(async () => {
      const { error } = await authClient.deleteUser({ password })
      if (error) {
        toast.error(
          error.status === 400 || error.status === 401
            ? "Mot de passe incorrect."
            : "Impossible de supprimer le compte.",
        )
        return
      }
      toast.success("Compte supprimé.")
      router.push(AUTH_ROUTES.LOGIN)
    })
  }

  return (
    <AlertDialog onOpenChange={(open) => !open && setPassword("")}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="cursor-pointer">
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ton compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            Ton compte, tes courses et tes records seront supprimés
            définitivement. Exporte tes données avant si tu veux les garder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="delete-password">
            Confirme avec ton mot de passe
          </FieldLabel>
          <PasswordInput
            id="delete-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Annuler
          </AlertDialogCancel>
          <LoadingButton
            variant="destructive"
            onClick={onConfirm}
            isLoading={isPending}
            disabled={password.length === 0}
            className="cursor-pointer"
          >
            Supprimer définitivement
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
