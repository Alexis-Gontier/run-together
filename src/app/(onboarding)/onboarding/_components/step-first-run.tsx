"use client"

import { ArrowLeft, FileUp, PencilLine, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { ROUTES } from "@/lib/constants/routes"
import { completeOnboardingAction } from "../_actions/complete-onboarding-action"

type StepFirstRunProps = {
  onBack: () => void
}

export function StepFirstRun({ onBack }: StepFirstRunProps) {
  const router = useRouter()
  const [target, setTarget] = useState<string>(ROUTES.HOME)

  const { execute, isPending } = useAction(completeOnboardingAction, {
    onError: () => toast.error("Une erreur est survenue."),
    onSuccess: () => router.push(target),
  })

  function finish(to: string) {
    setTarget(to)
    execute()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>Ta première course</CardTitle>
            <CardDescription>
              Saisie manuelle ou fichier GPX/FIT
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
          <PencilLine className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">À la main</span> :
            distance, durée, date — l&apos;allure est calculée pour toi.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
          <FileUp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Par fichier</span> :
            importe le .gpx ou .fit exporté de ta montre pour garder le tracé,
            les splits et la fréquence cardiaque.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isPending}
          className="cursor-pointer gap-1.5"
        >
          <ArrowLeft className="size-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <LoadingButton
            variant="ghost"
            onClick={() => finish(ROUTES.HOME)}
            isLoading={isPending && target === ROUTES.HOME}
            disabled={isPending}
            className="cursor-pointer text-muted-foreground"
          >
            Plus tard
          </LoadingButton>
          <LoadingButton
            onClick={() => finish(ROUTES.RUN_NEW)}
            isLoading={isPending && target === ROUTES.RUN_NEW}
            disabled={isPending}
            className="cursor-pointer"
          >
            Ajouter une course
          </LoadingButton>
        </div>
      </CardFooter>
    </Card>
  )
}
