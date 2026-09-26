"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { Field, FieldError, FieldLabel } from "@/components/shadcn-ui/field"
import { Input } from "@/components/shadcn-ui/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shadcn-ui/toggle-group"
import { LoadingButton } from "@/components/ui/loading-button"
import { updateWeeklyGoalAction } from "../_actions/update-weekly-goal-action"
import { weeklyGoalSchema } from "../_schemas/weekly-goal-schema"

const PRESETS = [10, 20, 30, 50]

export function WeeklyGoalCard({ goalKm }: { goalKm: number | null }) {
  const router = useRouter()
  const [value, setValue] = useState(goalKm ? String(goalKm) : "")
  const [error, setError] = useState<string | null>(null)

  const { execute, isPending } = useAction(updateWeeklyGoalAction, {
    onSuccess: ({ input }) => {
      toast.success(
        input.weeklyGoalKm
          ? `Objectif fixé à ${input.weeklyGoalKm} km par semaine.`
          : "Objectif retiré.",
      )
      router.refresh()
    },
    onError: () => toast.error("Impossible d'enregistrer l'objectif."),
  })

  function save(raw: string) {
    const parsed = weeklyGoalSchema.safeParse({
      weeklyGoalKm: raw.trim() === "" ? null : Number(raw),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Valeur invalide.")
      return
    }
    setError(null)
    execute(parsed.data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Objectif hebdomadaire</CardTitle>
        <CardDescription>
          Les kilomètres que tu vises chaque semaine. Ta progression
          s&apos;affiche dans « Ma semaine ».
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={PRESETS.includes(Number(value)) ? value : ""}
          onValueChange={(v) => {
            if (!v) return
            setValue(v)
            save(v)
          }}
          aria-label="Objectifs courants"
        >
          {PRESETS.map((km) => (
            <ToggleGroupItem
              key={km}
              value={String(km)}
              className="cursor-pointer px-3"
            >
              {km} km
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            save(value)
          }}
        >
          <Field data-invalid={!!error} className="max-w-40">
            <FieldLabel htmlFor="weekly-goal">Autre objectif (km)</FieldLabel>
            <Input
              id="weekly-goal"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Aucun"
              aria-invalid={!!error}
            />
          </Field>
          <LoadingButton
            type="submit"
            isLoading={isPending}
            className="cursor-pointer"
          >
            Enregistrer
          </LoadingButton>
          {goalKm && (
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer text-muted-foreground"
              onClick={() => {
                setValue("")
                save("")
              }}
            >
              Retirer
            </Button>
          )}
        </form>
        {error && <FieldError>{error}</FieldError>}
      </CardContent>
    </Card>
  )
}
