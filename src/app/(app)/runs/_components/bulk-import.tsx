"use client"

import { CheckCircle2, Copy, FilesIcon, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Progress } from "@/components/shadcn-ui/progress"
import { runRoute } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import { formatRunDate, formatRunDistance } from "@/lib/utils/run"
import { importTrackFileAction } from "../_actions/import-track-file-action"

const MAX_BYTES = 15 * 1024 * 1024
const ACCEPTED = /\.(gpx|tcx|fit)(\.gz)?$/i

type Row = { name: string } & (
  | { status: "pending" | "running" }
  | { status: "imported"; runId: string; date: Date; distance: number }
  | { status: "duplicate"; date: Date }
  | { status: "error"; message: string }
)

/**
 * Import de plusieurs fichiers (ex. dossier `activities/` de l'archive Strava) : un appel par
 * fichier, à la suite, sans notification Discord. Les doublons sont ignorés.
 */
export function BulkImport() {
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { executeAsync } = useAction(importTrackFileAction)

  const done = rows.filter(
    (r) => r.status !== "pending" && r.status !== "running",
  ).length
  const count = (s: Row["status"]) => rows.filter((r) => r.status === s).length

  async function run(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) =>
      ACCEPTED.test(f.name),
    )
    if (files.length === 0) {
      toast.error("Aucun fichier .gpx, .tcx ou .fit (compressé ou non).")
      return
    }
    const set = (i: number, row: Row) =>
      setRows((prev) => prev.map((r, j) => (j === i ? row : r)))

    setRows(files.map((f) => ({ name: f.name, status: "pending" })))
    setRunning(true)
    for (const [i, file] of files.entries()) {
      const name = file.name
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
        const { data } = await executeAsync({ file })
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
          accept=".gpx,.tcx,.fit,.gz"
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
            .gpx, .tcx, .fit, ou compressés en .gz — par exemple le dossier{" "}
            <code>activities/</code> de ton archive Strava. Les courses sont
            enregistrées directement, sans publication sur Discord ; les
            doublons sont ignorés.
          </p>
        </div>
      </label>

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>
                {running ? "Import en cours…" : "Import terminé"} · {done}/
                {rows.length}
              </span>
              <span>
                {count("imported")} importée(s) · {count("duplicate")}{" "}
                doublon(s) · {count("error")} erreur(s)
              </span>
            </div>
            <Progress value={(done / rows.length) * 100} className="h-1.5" />
          </div>

          <ul className="divide-y rounded-lg border text-sm">
            {rows.map((r, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: deux fichiers peuvent porter le même nom
              <li key={i} className="flex items-center gap-3 px-3 py-2">
                <RowIcon status={r.status} />
                <span className="min-w-0 flex-1 truncate">{r.name}</span>
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
  if (status === "running")
    return (
      <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
    )
  if (status === "imported")
    return <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
  if (status === "duplicate")
    return <Copy className="size-4 shrink-0 text-muted-foreground" />
  if (status === "error")
    return <XCircle className="size-4 shrink-0 text-destructive" />
  return <span className="size-4 shrink-0" />
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
