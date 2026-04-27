"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils/cn"
import { useOnboardingStore } from "../_store/onboarding-store"
import { StepDisplayName } from "./step-display-name"
import { StepEmail } from "./step-email"
import { StepIndicator } from "./step-indicator"
import { StepStrava } from "./step-strava"
import { StepWelcome } from "./step-welcome"

type OnboardingWizardProps = {
  initialStep: number
  userName: string
  userEmail: string
  isStravaConnected: boolean
}

export function OnboardingWizard({
  initialStep,
  userName,
  userEmail,
  isStravaConnected,
}: OnboardingWizardProps) {
  const { step, init, nextStep, prevStep } = useOnboardingStore()
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      init({
        step: initialStep,
        name: userName,
        email: userEmail,
        isStravaConnected,
      })
      initialized.current = true
    }
  }, [init, initialStep, userName, userEmail, isStravaConnected])

  function goNext() {
    setDirection("forward")
    nextStep()
  }

  function goBack() {
    setDirection("backward")
    prevStep()
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {step > 0 && (
        <div className="flex flex-col items-center gap-2">
          <StepIndicator current={step} total={3} />
          <p className="text-xs text-muted-foreground">Étape {step} sur 3</p>
        </div>
      )}

      <div
        key={step}
        className={cn(
          "animate-in duration-250 fade-in-0 fill-mode-both",
          direction === "forward"
            ? "slide-in-from-right-4"
            : "slide-in-from-left-4",
        )}
      >
        {step === 0 && <StepWelcome onStart={goNext} />}
        {step === 1 && <StepDisplayName onNext={goNext} onBack={goBack} />}
        {step === 2 && <StepEmail onNext={goNext} onBack={goBack} />}
        {step === 3 && <StepStrava onBack={goBack} />}
      </div>
    </div>
  )
}
