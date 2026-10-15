"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { format } from "date-fns"
import { Lock, TriangleAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useRef, useState } from "react"
import { Controller, type FieldPath, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn-ui/alert"
import { Button } from "@/components/shadcn-ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/shadcn-ui/field"
import { Input } from "@/components/shadcn-ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/shadcn-ui/input-group"
import { Switch } from "@/components/shadcn-ui/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shadcn-ui/toggle-group"
import { LoadingButton } from "@/components/ui/loading-button"
import type { RunWithUser } from "@/components/ui/run-card"
import { runRoute } from "@/lib/constants/routes"
import { defaultRunName } from "@/lib/runs/pace"
import type {
  RecordRunInput,
  RunSportType,
  TrackData,
} from "@/lib/runs/schemas"
import type { TrackSummary } from "@/lib/runs/track/types"
import { createRunAction } from "../_actions/create-run-action"
import { updateRunAction } from "../_actions/update-run-action"
import {
  type RunFormInput,
  type RunFormValues,
  runFormSchema,
  runFormToInput,
} from "../_schemas/run-form-schema"
import { type NearbyRun, NearbyRunComparison } from "./nearby-run-comparison"
import { RunDatePicker } from "./run-date-picker"
import { RunPreview } from "./run-preview"

const SPORT_LABELS: Record<RunSportType, string> = {
  Run: "Route",
  TrailRun: "Trail",
  VirtualRun: "Tapis",
}

/** Course existante, telle que la page d'édition la transmet (sans conversion de fuseau). */
export type EditableRun = {
  id: string
  isStrava: boolean
  name: string
  sportType: RunSportType
  date: Date
  distance: number
  duration: number
  elevation: number
  heartRateAvg: number | null
  heartRateMax: number | null
  cadenceAvg: number | null
  calories: number | null
  track: TrackData | null
}

type RunFormProps = {
  run?: EditableRun
  /** Auteur affiché dans l'aperçu (carte du fil). */
  user: RunWithUser["user"]
  defaultPublish?: boolean
  /** « Annuler » : par défaut, retour à la page précédente. */
  onCancel?: () => void
  /** Fichier analysé qui pré-remplit le formulaire (ajout). */
  imported?: { summary: TrackSummary; fileName: string }
}

const str = (v: number | null | undefined) => (v == null ? "" : String(v))

function toFormValues(r: {
  name: string | null
  sportType: RunSportType
  date: Date
  distance: number
  duration: number
  elevation: number
  heartRateAvg: number | null
  heartRateMax: number | null
  cadenceAvg: number | null
  calories: number | null
  track: TrackData | null
}): RunFormInput {
  return {
    name: r.name ?? "",
    sportType: r.sportType,
    // Fuseau du navigateur : cette fonction ne tourne qu'après le montage.
    date: format(r.date, "yyyy-MM-dd"),
    time: format(r.date, "HH:mm"),
    distanceKm: (r.distance / 1000).toFixed(2),
    hours: String(Math.floor(r.duration / 3600)),
    minutes: String(Math.floor((r.duration % 3600) / 60)),
    seconds: String(r.duration % 60),
    elevation: r.elevation ? String(r.elevation) : "",
    heartRateAvg: str(r.heartRateAvg),
    heartRateMax: str(r.heartRateMax),
    cadenceAvg: str(r.cadenceAvg),
    calories: str(r.calories),
    publishToDiscord: true,
    track: r.track,
  }
}

const EMPTY: RunFormInput = {
  name: "",
  sportType: "Run",
  date: "",
  time: "",
  distanceKm: "",
  hours: "0",
  minutes: "",
  seconds: "0",
  elevation: "",
  heartRateAvg: "",
  heartRateMax: "",
  cadenceAvg: "",
  calories: "",
  publishToDiscord: true,
  track: null,
}

export function RunForm({
  run,
  user,
  defaultPublish = true,
  imported,
  onCancel,
}: RunFormProps) {
  const router = useRouter()
  const isEdit = !!run
  const locked = run?.isStrava ?? false
  // Course déjà enregistrée à ±30 min : l'enregistrement attend confirmation.
  const [nearby, setNearby] = useState<{
    existing: NearbyRun
    candidate: { date: Date; distance: number; duration: number }
  } | null>(null)

  const form = useForm<RunFormInput, unknown, RunFormValues>({
    resolver: standardSchemaResolver(runFormSchema),
    defaultValues: { ...EMPTY, publishToDiscord: defaultPublish },
  })

  // Valeurs initiales calculées au montage : la date doit être lue dans le fuseau du navigateur,
  // pas dans celui du serveur qui fait le premier rendu.
  useEffect(() => {
    if (run) form.reset(toFormValues(run))
    else if (imported)
      form.reset({
        ...toFormValues(imported.summary),
        publishToDiscord: defaultPublish,
      })
    else {
      const now = new Date()
      form.setValue("date", format(now, "yyyy-MM-dd"))
      form.setValue("time", format(now, "HH:mm"))
    }
  }, [run, imported, defaultPublish, form])

  const [
    name,
    distanceKm,
    hours,
    minutes,
    seconds,
    elevation,
    heartRateAvg,
    heartRateMax,
    cadenceAvg,
    calories,
    date,
    time,
    track,
  ] = useWatch({
    control: form.control,
    name: [
      "name",
      "distanceKm",
      "hours",
      "minutes",
      "seconds",
      "elevation",
      "heartRateAvg",
      "heartRateMax",
      "cadenceAvg",
      "calories",
      "date",
      "time",
      "track",
    ],
  })
  const startsAt = date && time ? new Date(`${date}T${time}`) : null
  const validStart = startsAt && !Number.isNaN(startsAt.getTime())
  const distanceM = Number(String(distanceKm).replace(",", ".")) * 1000 || 0
  const durationS =
    Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)
  const namePlaceholder = validStart
    ? defaultRunName(startsAt)
    : "Course du matin"

  const onResult = (data?: { error?: string; runId?: string }) => {
    if (data?.error) {
      toast.error(data.error)
      return
    }
    if (!data?.runId) return
    toast.success(isEdit ? "Course modifiée." : "Course enregistrée.")
    router.push(runRoute(data.runId))
  }
  const onError = ({
    error,
  }: {
    error: { serverError?: string; validationErrors?: unknown }
  }) =>
    toast.error(
      error.validationErrors
        ? "Certaines valeurs sont invalides."
        : "Impossible d'enregistrer la course.",
    )

  // Dernières valeurs envoyées : comparées à la course proche si le serveur en renvoie une.
  const submitted = useRef<RecordRunInput | null>(null)
  const create = useAction(createRunAction, {
    onSuccess: ({ data }) => {
      if (data?.nearby && submitted.current) {
        setNearby({ existing: data.nearby, candidate: submitted.current })
        return
      }
      onResult(data)
    },
    onError,
  })
  const update = useAction(updateRunAction, {
    onSuccess: ({ data }) => onResult(data),
    onError,
  })
  const isPending = create.isPending || update.isPending

  function onSubmit(values: RunFormValues, force = false) {
    const input = runFormToInput(values)
    submitted.current = input
    setNearby(null)
    if (run) update.execute({ id: run.id, values: input })
    else
      create.execute({
        values: input,
        publish: values.publishToDiscord,
        force,
      })
  }

  const unitField = (
    name: FieldPath<RunFormInput>,
    label: string,
    unit: string,
    opts: { decimal?: boolean; placeholder?: string } = {},
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={locked}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={field.name}
              name={field.name}
              value={String(field.value ?? "")}
              onChange={(e) =>
                field.onChange(
                  opts.decimal
                    ? e.target.value.replace(",", ".")
                    : e.target.value,
                )
              }
              onBlur={field.onBlur}
              inputMode={opts.decimal ? "decimal" : "numeric"}
              placeholder={opts.placeholder}
              disabled={locked}
              aria-invalid={fieldState.invalid}
              className="tabular-nums"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>{unit}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
      className="flex flex-col gap-8"
    >
      {locked && (
        <Alert>
          <Lock />
          <AlertTitle>Course importée de Strava</AlertTitle>
          <AlertDescription>
            Seuls le nom et la date sont modifiables.
          </AlertDescription>
        </Alert>
      )}

      <FieldSet>
        <FieldLegend>La course</FieldLegend>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={namePlaceholder}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                  <RunDatePicker
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="time"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Heure de départ</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="time"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="sportType"
            control={form.control}
            render={({ field }) => (
              <Field data-disabled={locked}>
                <FieldLabel id="sportType-label">Type</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  aria-labelledby="sportType-label"
                  value={field.value}
                  // Un clic sur l'option active la désélectionnerait : on l'ignore.
                  onValueChange={(v) => v && field.onChange(v)}
                  disabled={locked}
                  className="w-full"
                >
                  {Object.entries(SPORT_LABELS).map(([value, label]) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="flex-1 cursor-pointer"
                    >
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Performance</FieldLegend>
        <FieldDescription>Temps en mouvement, pauses exclues.</FieldDescription>
        <FieldGroup>
          {unitField("distanceKm", "Distance", "km", {
            decimal: true,
            placeholder: "10.00",
          })}
          <div className="grid grid-cols-3 gap-4">
            {unitField("hours", "Heures", "h")}
            {unitField("minutes", "Minutes", "min")}
            {unitField("seconds", "Secondes", "s")}
          </div>
        </FieldGroup>
      </FieldSet>

      <Accordion type="single" collapsible className="rounded-xl border px-4">
        <AccordionItem value="details">
          <AccordionTrigger className="cursor-pointer">
            <span className="flex flex-col gap-0.5">
              Plus de détails
              <span className="font-normal text-muted-foreground text-xs">
                D+, fréquence cardiaque, cadence, calories
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4 pt-1">
              {unitField("elevation", "Dénivelé positif", "m")}
              {unitField("calories", "Calories", "kcal")}
              {unitField("heartRateAvg", "FC moyenne", "bpm")}
              {unitField("heartRateMax", "FC max", "bpm")}
              {unitField("cadenceAvg", "Cadence", "ppm")}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <FieldSet>
        <FieldLegend>Aperçu</FieldLegend>
        <FieldDescription>
          La course telle qu'elle apparaîtra dans le fil.
        </FieldDescription>
        <RunPreview
          user={user}
          name={name?.trim() || namePlaceholder}
          date={validStart ? startsAt : new Date()}
          deviceName={track?.deviceName ?? null}
          distance={distanceM}
          duration={durationS}
          elevation={Number(elevation) || 0}
          heartRateAvg={Number(heartRateAvg) || null}
          heartRateMax={Number(heartRateMax) || null}
          cadenceAvg={Number(cadenceAvg) || null}
          calories={Number(calories) || null}
          polyline={track?.summaryPolyline ?? null}
          splits={track ? track.splits.length : null}
          source={imported?.fileName ?? null}
        />
      </FieldSet>

      {/* Barre d'action collée en bas : au-dessus de la navigation mobile. */}
      <div className="sticky bottom-16 z-10 -mx-4 flex flex-col gap-3 border-t bg-background/85 px-4 py-3 backdrop-blur md:bottom-0">
        {nearby ? (
          <Alert className="fade-in slide-in-from-bottom-1 animate-in">
            <TriangleAlert />
            <AlertTitle>Tu as déjà une course à cette heure-là</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <span>Sans doute la même sortie, mesurée autrement.</span>
              <NearbyRunComparison
                candidate={nearby.candidate}
                existing={nearby.existing}
                className="w-full"
              />
              <span className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => setNearby(null)}
                >
                  Annuler
                </Button>
                <LoadingButton
                  type="button"
                  isLoading={isPending}
                  className="cursor-pointer"
                  onClick={form.handleSubmit((values) =>
                    onSubmit(values, true),
                  )}
                >
                  Enregistrer quand même
                </LoadingButton>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-between gap-4">
            {isEdit ? (
              <span />
            ) : (
              <Controller
                name="publishToDiscord"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal" className="w-auto">
                    <Switch
                      id={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel htmlFor={field.name}>
                      Publier sur Discord
                    </FieldLabel>
                  </Field>
                )}
              />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="cursor-pointer"
                disabled={isPending}
                onClick={onCancel ?? (() => router.back())}
              >
                Annuler
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isPending}
                size="lg"
                className="cursor-pointer"
              >
                Enregistrer
              </LoadingButton>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
