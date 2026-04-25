"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
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
import { ROUTES } from "@/lib/constants/routes"
import { deleteRunAction } from "../_actions/delete-run-action"

export function DeleteRunButton({ id }: { id: string }) {
  const router = useRouter()

  const { execute, isPending } = useAction(deleteRunAction, {
    onSuccess: () => {
      toast.success("Course supprimée.")
      router.push(ROUTES.RUNS)
    },
    onError: () => toast.error("Impossible de supprimer la course."),
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer text-destructive hover:text-destructive"
        >
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la course ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La course sera définitivement
            supprimée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => execute({ id })}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
