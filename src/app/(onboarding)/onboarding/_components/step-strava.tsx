"use client"

import { ArrowLeft, CheckCircle2, ExternalLink, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { Button } from "@/components/shadcn-ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { API_ROUTES, ROUTES } from "@/lib/constants/routes"
import { StravaSyncDialog } from "@/components/ui/strava-sync-dialog"
import { completeOnboardingAction } from "../_actions/complete-onboarding-action"
import { useOnboardingStore } from "../_store/onboarding-store"

type StepStravaProps = {
  onBack: () => void
}

function StravaLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden
    >
      <path
        d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
        fill="currentColor"
      />
    </svg>
  )
}

export function StepStrava({ onBack }: StepStravaProps) {
  const router = useRouter()
  const { isStravaConnected } = useOnboardingStore()

  const { execute, isPending } = useAction(completeOnboardingAction, {
    onError: () => toast.error("Une erreur est survenue."),
    onSuccess: () => router.push(ROUTES.HOME),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#FC4C02]/10">
            <StravaLogo />
          </div>
          <div>
            <CardTitle>Connecte Strava</CardTitle>
            <CardDescription>Synchronisation des activités</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStravaConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-500/10 px-4 py-3">
              <CheckCircle2 className="size-5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Compte Strava connecté
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-500/70">
                  Utilise le bouton ci-dessous pour importer tes courses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                La sync récupère tes{" "}
                <span className="font-medium text-foreground">
                  200 dernières activités
                </span>{" "}
                Strava. Seules les courses à pied (Run, Trail, Virtual) sont
                importées. Tu pourras resynchroniser à tout moment depuis les
                paramètres.
              </p>
            </div>
            <StravaSyncDialog />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connecte ton compte Strava pour importer tes courses
              automatiquement. Tu peux aussi le faire plus tard depuis les
              paramètres.
            </p>
            <Button
              asChild
              className="w-full cursor-pointer gap-2 bg-[#FC4C02] text-white hover:bg-[#e04300]"
            >
              <a href={API_ROUTES.STRAVA_CONNECT}>
                <StravaLogo />
                Se connecter avec Strava
                <ExternalLink className="ml-auto size-3.5 opacity-70" />
              </a>
            </Button>
          </div>
        )}
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
        {isStravaConnected ? (
          <LoadingButton
            onClick={() => execute()}
            isLoading={isPending}
            className="cursor-pointer"
          >
            Terminer
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="ghost"
            onClick={() => execute()}
            isLoading={isPending}
            className="cursor-pointer text-muted-foreground"
          >
            Ignorer pour l&apos;instant
          </LoadingButton>
        )}
      </CardFooter>
    </Card>
  )
}
