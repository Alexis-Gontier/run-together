"use client"

import {
  CheckCircle2,
  Copy,
  FilesIcon,
  FolderOpen,
  Loader2,
  MinusCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
import { Progress } from "@/components/shadcn-ui/progress"
import { runRoute } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import { formatRunDate, formatRunDistance } from "@/lib/utils/run"
import { importTrackFileAction } from "../_actions/import-track-file-action"
import {
  type ArchiveActivity,
  parseActivitiesCsv,
} from "../_utils/strava-archive"

const MAX_BYTES = 15 * 1024 * 1024
const ACCEPTED = /\.(gpx|tcx|fit)(\.gz)?$/i
const CSV_NAME = "activities.csv"

type Row = { name: string } & (
  | { status: "pending" | "running" }
  | { status: "imported"; runId: string; date: Date; distance: number }
  | { status: "duplicate" }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string }
)

/**
 * Import de plusieurs fichiers, ou du dossier de l'archive Strava : un appel par fichier, à la
 * suite, sans notification Discord. Avec `activities.csv`, les autres sports sont écartés sans
 * appel serveur et les courses reprennent leur titre Strava. Doublons et autres sports sont ignorés.
 */
export function BulkImport() {
  const [rows, setRows] = useState<Row[]>([])
  const [csvCount, setCsvCount] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [dragging, setDragging] = useState(false)
  const folderRef = useRef<HTMLInputElement>(null)
  const { executeAsync } = useAction(importTrackFileAction)

  // Quitter la page interrompt l'import : on prévient tant qu'il tourne.
  useEffect(() => {
    if (!running) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [running])

  const done = rows.filter(
    (r) => r.status !== "pending" && r.status !== "running",
  ).length
  const count = (s: Row["status"]) => rows.filter((r) => r.status === s).length

  async function run(fileList: FileList | null) {
    const all = Array.from(fileList ?? [])
    const files = all.filter((f) => ACCEPTED.test(f.name))
    if (files.length === 0) {
      toast.error("Aucun fichier .gpx, .tcx ou .fit (compressé ou non).")
      return
    }
    const csv = all.find((f) => f.name.toLowerCase() === CSV_NAME)
    let archive = new Map<string, ArchiveActivity>()
    if (csv) {
      try {
        archive = parseActivitiesCsv(await csv.text())
      } catch {
        toast.error(`${CSV_NAME} illisible : import sans titres ni types.`)
      }
    }
    setCsvCount(csv ? archive.size : null)

    const set = (i: number, row: Row) =>
      setRows((prev) => prev.map((r, j) => (j === i ? row : r)))
    const label = (f: File) => archive.get(f.name)?.name ?? f.name

    setRows(files.map((f) => ({ name: label(f), status: "pending" })))
    setRunning(true)
    for (const [i, file] of files.entries()) {
      const name = label(file)
      const meta = archive.get(file.name)
      if (meta && !meta.sportType) {
        set(i, {
          name,
          status: "skipped",
          message: meta.type || "Pas une course",
        })
        continue
      }
      if (file.size > MAX_BYTES) {
        set(i, {
          name,
          status: "error",
          message: "Fichier trop lourd (15 Mo max).",
        })
        continue
      }
      set(i, { name, status: "running" })
      try {
        const { data } = await executeAsync({
          file,
          name: meta?.name ?? undefined,
          sportType: meta?.sportType ?? undefined,
        })
        if (!data) throw new Error()
        set(i, { name, ...data })
      } catch {
        set(i, {
          name,
          status: "error",
          message: "Impossible d'importer ce fichier.",
        })
      }
    }
    setRunning(false)
  }

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!running) run(e.dataTransfer.files)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/40",
          running && "pointer-events-none opacity-70",
        )}
      >
        <input
          type="file"
          multiple
          accept=".gpx,.tcx,.fit,.gz,.csv"
          className="sr-only"
          disabled={running}
          onChange={(e) => {
            run(e.target.files)
            e.target.value = ""
          }}
        />
        <FilesIcon className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium text-sm">
            Glisse plusieurs fichiers ici, ou clique pour les choisir
          </p>
          <p className="text-muted-foreground text-xs">
            .gpx, .tcx, .fit, compressés en .gz ou non. Les courses sont
            enregistrées directement, sans publication sur Discord ; les
            doublons et les autres sports sont ignorés.
          </p>
        </div>
      </label>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={running}
          onClick={() => folderRef.current?.click()}
        >
          <FolderOpen />
          Choisir le dossier de l&apos;archive Strava
        </Button>
        <p className="text-muted-foreground text-xs">
          Avec <code>{CSV_NAME}</code>, vélo et marche sont écartés et tes
          courses gardent leur titre Strava.
        </p>
        <input
          ref={folderRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          disabled={running}
          // Attribut non standard (pas typé par React) : sélection d'un dossier entier.
          {...({ webkitdirectory: "" } as object)}
          onChange={(e) => {
            run(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {rows.length > 0 && (
        <div className="space-y-3">
          {csvCount != null && (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-muted-foreground text-xs">
              {csvCount > 0
                ? `${CSV_NAME} lu : ${csvCount} activités, types et titres Strava appliqués.`
                : `${CSV_NAME} trouvé mais aucune activité reconnue : import sans titres ni types.`}
            </p>
          )}
          <div className="space-y-1.5">
            <div className="flex flex-wrap justify-between gap-x-3 text-muted-foreground text-xs">
              <span>
                {running ? "Import en cours…" : "Import terminé"} · {done}/
                {rows.length}
              </span>
              <span>
                {count("imported")} importée(s) · {count("duplicate")}{" "}
                doublon(s) · {count("skipped")} ignorée(s) · {count("error")}{" "}
                erreur(s)
              </span>
            </div>
            <Progress value={(done / rows.length) * 100} className="h-1.5" />
          </div>

          <ul className="divide-y rounded-lg border text-sm">
            {rows.map((r, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: deux fichiers peuvent porter le même nom
              <li key={i} className="flex items-center gap-3 px-3 py-2">
                <RowIcon status={r.status} />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    r.status === "skipped" && "text-muted-foreground",
                  )}
                >
                  {r.name}
                </span>
                <RowDetail row={r} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RowIcon({ status }: { status: Row["status"] }) {
  const cls = "size-4 shrink-0"
  switch (status) {
    case "running":
      return (
        <Loader2 className={cn(cls, "animate-spin text-muted-foreground")} />
      )
    case "imported":
      return <CheckCircle2 className={cn(cls, "text-emerald-500")} />
    case "duplicate":
      return <Copy className={cn(cls, "text-muted-foreground")} />
    case "skipped":
      return <MinusCircle className={cn(cls, "text-muted-foreground")} />
    case "error":
      return <XCircle className={cn(cls, "text-destructive")} />
    default:
      return <span className={cls} />
  }
}

function RowDetail({ row }: { row: Row }) {
  const cls = "shrink-0 text-right text-muted-foreground text-xs"
  switch (row.status) {
    case "imported":
      return (
        <Link href={runRoute(row.runId)} className={cn(cls, "hover:underline")}>
          {formatRunDate(row.date)} · {formatRunDistance(row.distance)} km
        </Link>
      )
    case "duplicate":
      return <span className={cls}>Déjà enregistrée</span>
    case "skipped":
      return (
        <span className={cn(cls, "max-w-1/2 truncate")}>
          Ignorée · {row.message}
        </span>
      )
    case "error":
      return (
        <span className={cn(cls, "max-w-1/2 truncate text-destructive")}>
          {row.message}
        </span>
      )
    default:
      return null
  }
}
