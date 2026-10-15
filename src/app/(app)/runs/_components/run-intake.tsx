"use client"

import { FolderOpen, Loader2, PenLine, Upload } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/shadcn-ui/badge"
import { Button } from "@/components/shadcn-ui/button"
import type { TrackSummary } from "@/lib/runs/track/types"
import { cn } from "@/lib/utils/cn"
import { parseTrackAction } from "../_actions/parse-track-action"
import { CSV_NAME, isTrackFile, MAX_TRACK_BYTES } from "../_utils/track-files"

const FORMATS = ["GPX", "TCX", "FIT", ".GZ"]

type RunIntakeProps = {
  onParsed: (summary: TrackSummary, fileName: string) => void
  onBulk: (files: File[]) => void
  onManual: () => void
}

/**
 * Point d'entrée de l'ajout : une seule zone de dépôt. Un fichier → analysé puis vérifié dans le
 * formulaire ; plusieurs (ou un dossier, ou avec `activities.csv`) → import en masse.
 */
export function RunIntake({ onParsed, onBulk, onManual }: RunIntakeProps) {
  const folderRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState("")

  const { execute, isPending } = useAction(parseTrackAction, {
    onSuccess: ({ data }) => {
      if (!data) return
      if ("error" in data) {
        toast.error(data.error)
        return
      }
      onParsed(data.summary, fileName)
    },
    onError: ({ error }) =>
      toast.error(
        error.validationErrors
          ? "Fichier refusé (15 Mo max)."
          : "Impossible de lire ce fichier.",
      ),
  })

  function handle(list: FileList | null) {
    const all = Array.from(list ?? [])
    const tracks = all.filter((f) => isTrackFile(f.name))
    if (tracks.length === 0) {
      toast.error("Aucun fichier .gpx, .tcx ou .fit (compressé ou non).")
      return
    }
    const withCsv = all.some((f) => f.name.toLowerCase() === CSV_NAME)
    if (tracks.length > 1 || withCsv) {
      onBulk(all)
      return
    }
    const [file] = tracks
    if (file.size > MAX_TRACK_BYTES) {
      toast.error("Fichier trop lourd (15 Mo max).")
      return
    }
    setFileName(file.name)
    execute({ file })
  }

  return (
    <section className="flex flex-col gap-3">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!isPending) handle(e.dataTransfer.files)
        }}
        data-dragging={dragging || undefined}
        className={cn(
          "group/drop relative isolate flex min-h-80 cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-dashed bg-card px-6 py-12 text-center transition-colors duration-300",
          "hover:border-primary/60 data-dragging:border-primary data-dragging:bg-primary/5",
          isPending && "pointer-events-none",
        )}
      >
        <TrackLanes />
        <input
          type="file"
          multiple
          accept=".gpx,.tcx,.fit,.gz,.csv"
          aria-label="Fichiers de course (.gpx, .tcx, .fit)"
          className="sr-only"
          disabled={isPending}
          onChange={(e) => {
            handle(e.target.files)
            e.target.value = ""
          }}
        />
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/25 transition-transform duration-300 group-hover/drop:-translate-y-1 group-data-dragging/drop:scale-110">
          {isPending ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <Upload className="size-7" />
          )}
        </div>
        <div className="flex max-w-sm flex-col gap-1.5">
          <h2 className="font-semibold text-xl tracking-tight">
            {isPending ? `Analyse de ${fileName}…` : "Dépose ta course"}
          </h2>
          <p className="text-balance text-muted-foreground text-sm">
            Un fichier pour le vérifier avant d&apos;enregistrer, plusieurs pour
            importer tout un historique. Ou clique pour les choisir.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {FORMATS.map((f) => (
            <Badge
              key={f}
              variant="outline"
              className="font-mono tracking-wider"
            >
              {f}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">15 Mo max par fichier</p>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <IntakeOption
          icon={PenLine}
          title="Saisir à la main"
          description="Distance, chrono, date : sans fichier."
          onClick={onManual}
          disabled={isPending}
        />
        <IntakeOption
          icon={FolderOpen}
          title="Dossier d'archive Strava"
          description="Tout l'historique, titres Strava gardés."
          onClick={() => folderRef.current?.click()}
          disabled={isPending}
        />
        <input
          ref={folderRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-label="Dossier de l'archive Strava"
          // Attribut non standard (pas typé par React) : sélection d'un dossier entier.
          {...({ webkitdirectory: "" } as object)}
          onChange={(e) => {
            handle(e.target.files)
            e.target.value = ""
          }}
        />
      </div>
    </section>
  )
}

function IntakeOption({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: typeof PenLine
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="h-auto cursor-pointer justify-start gap-3 whitespace-normal rounded-xl p-4 text-left"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="font-normal text-muted-foreground text-xs">
          {description}
        </span>
      </span>
    </Button>
  )
}

/** Couloirs de piste d'athlétisme en fond : ellipses concentriques qui s'estompent vers le haut. */
function TrackLanes({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 opacity-70 transition-opacity duration-300 group-hover/drop:opacity-100 group-data-dragging/drop:opacity-100",
        "bg-[repeating-radial-gradient(ellipse_120%_90%_at_50%_120%,transparent_0_28px,color-mix(in_oklch,var(--primary)_45%,transparent)_28px_29.5px),radial-gradient(ellipse_70%_55%_at_50%_100%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]",
        "mask-[radial-gradient(ellipse_100%_85%_at_50%_100%,black_25%,transparent_80%)]",
        className,
      )}
    />
  )
}
