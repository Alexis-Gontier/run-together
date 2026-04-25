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
  onboardingDisplayNameSchema,
  type OnboardingDisplayNameType,
} from "@/lib/schemas/auth-schema"
import { updateDisplayNameAction } from "../_actions/update-display-name-action"
import { useOnboardingStore } from "../_store/onboarding-store"

export function StepDisplayName() {
  const { name, setName, nextStep } = useOnboardingStore()

  const form = useForm<OnboardingDisplayNameType>({
    resolver: standardSchemaResolver(onboardingDisplayNameSchema),
    defaultValues: { name },
  })

  const { execute, isPending } = useAction(updateDisplayNameAction, {
    onError: () => toast.error("Impossible de mettre à jour le nom."),
    onSuccess: (result) => {
      setName(result.input.name)
      nextStep()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment veux-tu être affiché ?</CardTitle>
        <CardDescription>
          Ton nom affiché sera visible par les autres membres.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit((data) => execute(data))}
        className="space-y-6"
      >
        <CardContent>
          <div className="space-y-2">
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Suivant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
