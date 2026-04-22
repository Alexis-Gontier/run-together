"use client"

import { useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog"
import { Button } from "@/components/shadcn-ui/button"
import { signOutAction } from "../_actions/sign-out-action"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Déconnexion
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous allez être déconnecté de votre compte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => startTransition(() => signOutAction())}
            className="cursor-pointer"
          >
            {isPending ? "Déconnexion…" : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
