"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
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
import { Input } from "@/components/shadcn-ui/input"
import { Label } from "@/components/shadcn-ui/label"
import { API_ROUTES, ROUTES } from "@/lib/constants/routes"
import {
  onboardingDisplayNameSchema,
  type OnboardingDisplayNameType,
} from "@/lib/schemas/auth-schema"
import { updateDisplayNameAction } from "../_actions/update-display-name-action"
import { completeOnboardingAction } from "../_actions/complete-onboarding-action"

type OnboardingWizardProps = {
  initialStep: number
  userName: string
  isStravaConnected: boolean
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i + 1 === current
              ? "w-8 bg-primary"
              : i + 1 < current
                ? "w-2 bg-primary"
                : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  )
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
        fill="#FC4C02"
      />
    </svg>
  )
}

export function OnboardingWizard({
  initialStep,
  userName,
  isStravaConnected,
}: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(initialStep)
  const [stravaConnected] = useState(isStravaConnected)

  const form = useForm<OnboardingDisplayNameType>({
    resolver: standardSchemaResolver(onboardingDisplayNameSchema),
    defaultValues: { name: userName },
  })

  const { execute: updateName, isPending: isUpdatingName } = useAction(
    updateDisplayNameAction,
    {
      onError: () => toast.error("Impossible de mettre à jour le nom."),
      onSuccess: () => setStep(2),
    },
  )

  const { execute: completeOnboarding, isPending: isCompleting } = useAction(
    completeOnboardingAction,
    {
      onError: () => toast.error("Une erreur est survenue."),
      onSuccess: () => router.push(ROUTES.HOME),
    },
  )

  if (step === 1) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bienvenue 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configurons ton profil en quelques étapes.
          </p>
        </div>
        <StepIndicator current={1} total={2} />
        <Card>
          <CardHeader>
            <CardTitle>Comment veux-tu être affiché ?</CardTitle>
            <CardDescription>
              Ton nom affiché sera visible par les autres membres.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit((data) => updateName(data))}>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom affiché</Label>
                <Input
                  id="name"
                  placeholder="Ex: Alex Martin"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={isUpdatingName}>
                {isUpdatingName ? "Enregistrement…" : "Suivant"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Connecte Strava</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Synchronise tes activités automatiquement.
        </p>
      </div>
      <StepIndicator current={2} total={2} />
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
          {stravaConnected ? (
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
          {!stravaConnected && (
            <Button
              variant="ghost"
              onClick={() => completeOnboarding()}
              disabled={isCompleting}
            >
              Ignorer pour l&apos;instant
            </Button>
          )}
          {stravaConnected && (
            <Button
              onClick={() => completeOnboarding()}
              disabled={isCompleting}
              className="ml-auto"
            >
              {isCompleting ? "Finalisation…" : "Terminer"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
