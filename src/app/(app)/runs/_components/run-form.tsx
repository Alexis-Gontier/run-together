"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { format } from "date-fns"
import { MapPin, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useState } from "react"
import { Controller, type FieldPath, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/shadcn-ui/field"
import { Input } from "@/components/shadcn-ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"
import { Switch } from "@/components/shadcn-ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs"
import { LoadingButton } from "@/components/ui/loading-button"
import { runRoute } from "@/lib/constants/routes"
import { computePace, defaultRunName } from "@/lib/runs/pace"
import type { RunSportType, TrackData } from "@/lib/runs/schemas"
import type { TrackSummary } from "@/lib/runs/track/types"
import { formatRunPace } from "@/lib/utils/run"
import { createRunAction } from "../_actions/create-run-action"
import { updateRunAction } from "../_actions/update-run-action"
import {
  type RunFormInput,
  type RunFormValues,
  runFormSchema,
  runFormToInput,
} from "../_schemas/run-form-schema"
import { BulkImport } from "./bulk-import"
import { RunDatePicker } from "./run-date-picker"
import { TrackDropzone } from "./track-dropzone"

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

type RunFormProps = { run?: EditableRun; defaultPublish?: boolean }

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

export function RunForm({ run, defaultPublish = true }: RunFormProps) {
  const router = useRouter()
  const isEdit = !!run
  const locked = run?.isStrava ?? false
  const [tab, setTab] = useState("manual")
  const [importedFrom, setImportedFrom] = useState<string | null>(null)

  const form = useForm<RunFormInput, unknown, RunFormValues>({
    resolver: standardSchemaResolver(runFormSchema),
    defaultValues: { ...EMPTY, publishToDiscord: defaultPublish },
  })

  // Valeurs initiales calculées au montage : la date doit être lue dans le fuseau du navigateur,
  // pas dans celui du serveur qui fait le premier rendu.
  useEffect(() => {
    if (run) form.reset(toFormValues(run))
    else {
      const now = new Date()
      form.setValue("date", format(now, "yyyy-MM-dd"))
      form.setValue("time", format(now, "HH:mm"))
    }
  }, [run, form])

  const [distanceKm, hours, minutes, seconds, date, time, track] = useWatch({
    control: form.control,
    name: [
      "distanceKm",
      "hours",
      "minutes",
      "seconds",
      "date",
      "time",
      "track",
    ],
  })
  const distanceM = Number(String(distanceKm).replace(",", ".")) * 1000
  const durationS =
    Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)
  const pace =
    distanceM > 0 && durationS > 0 ? computePace(distanceM, durationS) : null
  const namePlaceholder =
    date && time
      ? defaultRunName(new Date(`${date}T${time}`))
      : "Course du matin"

  const onResult = (data?: { error: string } | { runId: string }) => {
    if (!data) return
    if ("error" in data) {
      toast.error(data.error)
      return
    }
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

  const create = useAction(createRunAction, {
    onSuccess: ({ data }) => onResult(data),
    onError,
  })
  const update = useAction(updateRunAction, {
    onSuccess: ({ data }) => onResult(data),
    onError,
  })
  const isPending = create.isPending || update.isPending

  function onSubmit(values: RunFormValues) {
    const input = runFormToInput(values)
    if (run) update.execute({ id: run.id, values: input })
    else create.execute({ values: input, publish: values.publishToDiscord })
  }

  function onParsed(summary: TrackSummary, fileName: string) {
    form.reset({
      ...toFormValues(summary),
      publishToDiscord: form.getValues("publishToDiscord"),
    })
    setImportedFrom(fileName)
    setTab("manual")
  }

  const numberField = (
    name: FieldPath<RunFormInput>,
    label: string,
    opts: { suffix?: string; disabled?: boolean } = {},
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <div className="relative">
            <Input
              id={field.name}
              name={field.name}
              value={String(field.value ?? "")}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              inputMode="numeric"
              disabled={opts.disabled}
              aria-invalid={fieldState.invalid}
              className={opts.suffix ? "pr-12" : undefined}
            />
            {opts.suffix && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground text-xs">
                {opts.suffix}
              </span>
            )}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )

  const formBody = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {importedFrom && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
          <MapPin className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-muted-foreground">
            Données importées de{" "}
            <span className="font-medium text-foreground">{importedFrom}</span>{" "}
            — vérifie avant d&apos;enregistrer.
          </p>
        </div>
      )}
      {locked && (
        <p className="rounded-lg border bg-muted/40 px-3 py-2.5 text-muted-foreground text-sm">
          Course importée de Strava : seuls le nom et la date sont modifiables.
        </p>
      )}

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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="distanceKm"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Distance</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={String(field.value ?? "")}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(",", "."))
                    }
                    onBlur={field.onBlur}
                    inputMode="decimal"
                    placeholder="10.00"
                    disabled={locked}
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground text-xs">
                    km
                  </span>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="sportType"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={locked}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPORT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            {numberField("hours", "Heures", { suffix: "h", disabled: locked })}
            {numberField("minutes", "Minutes", {
              suffix: "min",
              disabled: locked,
            })}
            {numberField("seconds", "Secondes", {
              suffix: "s",
              disabled: locked,
            })}
          </div>
          <FieldDescription>
            {pace ? (
              <>
                Allure :{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatRunPace(pace)} /km
                </span>
              </>
            ) : (
              "Temps en mouvement, pauses exclues."
            )}
          </FieldDescription>
        </div>

        <details className="group rounded-lg border px-4 py-3">
          <summary className="cursor-pointer select-none font-medium text-sm">
            Plus de détails
            <span className="ml-2 font-normal text-muted-foreground">
              D+, fréquence cardiaque, cadence, calories
            </span>
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {numberField("elevation", "Dénivelé positif", {
              suffix: "m",
              disabled: locked,
            })}
            {numberField("calories", "Calories", {
              suffix: "kcal",
              disabled: locked,
            })}
            {numberField("heartRateAvg", "FC moyenne", {
              suffix: "bpm",
              disabled: locked,
            })}
            {numberField("heartRateMax", "FC max", {
              suffix: "bpm",
              disabled: locked,
            })}
            {numberField("cadenceAvg", "Cadence", {
              suffix: "ppm",
              disabled: locked,
            })}
          </div>
        </details>

        {track && !locked && (
          <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Tracé GPS
              {track.splits.length > 0 && ` · ${track.splits.length} splits`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer text-muted-foreground"
              onClick={() => form.setValue("track", null)}
            >
              <X className="size-4" />
              Retirer
            </Button>
          </div>
        )}

        {!isEdit && (
          <Controller
            name="publishToDiscord"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
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
      </FieldGroup>

      <LoadingButton
        type="submit"
        isLoading={isPending}
        className="w-full cursor-pointer"
      >
        Enregistrer
      </LoadingButton>
    </form>
  )

  if (isEdit) return formBody

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-6">
      <TabsList className="w-full">
        <TabsTrigger value="manual" className="cursor-pointer">
          Saisie manuelle
        </TabsTrigger>
        <TabsTrigger value="file" className="cursor-pointer">
          Importer un fichier
        </TabsTrigger>
        <TabsTrigger value="bulk" className="cursor-pointer">
          Plusieurs fichiers
        </TabsTrigger>
      </TabsList>
      <TabsContent value="manual">{formBody}</TabsContent>
      <TabsContent value="file">
        <TrackDropzone onParsed={onParsed} />
      </TabsContent>
      <TabsContent value="bulk">
        <BulkImport />
      </TabsContent>
    </Tabs>
  )
}
