"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
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
import { Input } from "@/components/shadcn-ui/input"
import { Label } from "@/components/shadcn-ui/label"
import {
  onboardingDisplayNameSchema,
  type OnboardingDisplayNameType,
} from "@/lib/schemas/auth-schema"
import { updateDisplayNameAction } from "../_actions/update-display-name-action"
import { useOnboardingStore } from "../_store/onboarding-store"

type StepDisplayNameProps = {
  onNext: () => void
  onBack: () => void
}

export function StepDisplayName({ onNext, onBack }: StepDisplayNameProps) {
  const { setName } = useOnboardingStore()

  const form = useForm<OnboardingDisplayNameType>({
    resolver: standardSchemaResolver(onboardingDisplayNameSchema),
    defaultValues: { firstName: "", lastName: "" },
  })

  const { execute, isPending } = useAction(updateDisplayNameAction, {
    onError: () => toast.error("Impossible de mettre à jour le nom."),
    onSuccess: (result) => {
      setName(`${result.input.firstName} ${result.input.lastName}`.trim())
      onNext()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment veux-tu être affiché ?</CardTitle>
        <CardDescription>
          Ton nom sera visible par les autres membres.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit((data) => execute(data))}
        className="space-y-6"
      >
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Alex"
                autoFocus
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Martin"
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
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
          <LoadingButton
            type="submit"
            isLoading={isPending}
            className="cursor-pointer gap-1.5"
          >
            Suivant
            <ArrowRight className="size-4" />
          </LoadingButton>
        </CardFooter>
      </form>
    </Card>
  )
}
