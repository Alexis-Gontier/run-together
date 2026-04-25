"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
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
import { API_ROUTES, ROUTES } from "@/lib/constants/routes"
import { completeOnboardingAction } from "../_actions/complete-onboarding-action"
import { useOnboardingStore } from "../_store/onboarding-store"

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
        fill="#FC4C02"
      />
    </svg>
  )
}

export function StepStrava() {
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
          <StravaLogo />
          <div>
            <CardTitle>Strava</CardTitle>
            <CardDescription>Synchronisation des activités</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isStravaConnected ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-500/10 px-4 py-3">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Compte Strava connecté
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Connecte ton compte Strava pour importer tes courses
              automatiquement.
            </p>
            <Button
              asChild
              className="w-fit bg-[#FC4C02] text-white hover:bg-[#e04300]"
            >
              <a href={API_ROUTES.STRAVA_CONNECT}>
                <StravaLogo />
                Se connecter avec Strava
              </a>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        {!isStravaConnected && (
          <Button
            variant="ghost"
            onClick={() => execute()}
            disabled={isPending}
          >
            Ignorer pour l&apos;instant
          </Button>
        )}
        {isStravaConnected && (
          <Button
            onClick={() => execute()}
            disabled={isPending}
            className="ml-auto"
          >
            {isPending ? "Finalisation…" : "Terminer"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
