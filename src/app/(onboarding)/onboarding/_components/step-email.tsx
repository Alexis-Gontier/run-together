"use client"

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
import {
  onboardingEmailSchema,
  type OnboardingEmailType,
} from "@/lib/schemas/auth-schema"
import { updateEmailAction } from "../_actions/update-email-action"
import { useOnboardingStore } from "../_store/onboarding-store"

export function StepEmail() {
  const { email, setEmail, nextStep } = useOnboardingStore()

  const form = useForm<OnboardingEmailType>({
    resolver: standardSchemaResolver(onboardingEmailSchema),
    defaultValues: { email },
  })

  const { execute, isPending } = useAction(updateEmailAction, {
    onError: () => toast.error("Impossible de mettre à jour l'e-mail."),
    onSuccess: (result) => {
      setEmail(result.input.email)
      nextStep()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quelle est ton adresse e-mail ?</CardTitle>
        <CardDescription>
          Elle sera utilisée pour les notifications et la récupération de
          compte.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit((data) => execute(data))}>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: alex@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Suivant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
