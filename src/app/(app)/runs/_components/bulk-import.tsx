"use client"

import {
  CheckCircle2,
  CircleAlert,
  Copy,
  FileText,
  Loader2,
  MinusCircle,
  RotateCcw,
  TriangleAlert,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn-ui/alert"
import { Button } from "@/components/shadcn-ui/button"
import { Progress } from "@/components/shadcn-ui/progress"
import { runRoute } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import { formatRunDate, formatRunDistance } from "@/lib/utils/run"
import { evaluateMyBadgesAction } from "../_actions/evaluate-my-badges-action"
import { importTrackFileAction } from "../_actions/import-track-file-action"
import {
  type ArchiveActivity,
  parseActivitiesCsv,
} from "../_utils/strava-archive"
import { CSV_NAME, isTrackFile, MAX_TRACK_BYTES } from "../_utils/track-files"
import { type NearbyRun, NearbyRunComparison } from "./nearby-run-comparison"

type Job = { file: File; meta?: ArchiveActivity }

type Row = { name: string } & (
  | { status: "pending" | "running" }
  | { status: "imported"; runId: string; date: Date; distance: number }
  | { status: "duplicate" }
  | {
      status: "conflict"
      nearby: NearbyRun
      candidate: { date: Date; distance: number; duration: number }
    }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string }
)

/**
 * Import de plusieurs fichiers, ou du dossier de l'archive Strava : un appel par fichier, à la
 * suite, sans notification Discord. Avec `activities.csv`, les autres sports sont écartés sans
 * appel serveur et les courses reprennent leur titre Strava. Doublons et autres sports sont ignorés ;
 * une course proche d'une existante attend confirmation. Badges évalués une fois, à la fin.
 */
export function BulkImport({
  files,
  onRestart,
}: {
  files: File[]
  onRestart: () => void
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [csvCount, setCsvCount] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const jobs = useRef<Job[]>([])
  const started = useRef(false)
  const { executeAsync } = useAction(importTrackFileAction)
  const badges = useAction(evaluateMyBadgesAction)

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

  // Lancé une seule fois avec les fichiers déposés (le ref résiste au double effet de StrictMode).
  // biome-ignore lint/correctness/useExhaustiveDependencies: import unique, au montage
  useEffect(() => {
    if (started.current) return
    started.current = true
    run(files)
  }, [])

  async function run(all: File[]) {
    const files = all.filter((f) => isTrackFile(f.name))
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

    const label = (f: File) => archive.get(f.name)?.name ?? f.name
    jobs.current = files.map((file) => ({ file, meta: archive.get(file.name) }))
    setRows(files.map((f) => ({ name: label(f), status: "pending" })))
    await importAll(
      files.map((_, i) => i),
      false,
    )
  }

  const setRow = (i: number, row: Row) =>
    setRows((prev) => prev.map((r, j) => (j === i ? row : r)))

  /** Importe les fichiers d'indices donnés, à la suite, puis évalue les badges une fois. */
  async function importAll(indices: number[], force: boolean) {
    setRunning(true)
    let imported = 0
    for (const i of indices) {
      const { file, meta } = jobs.current[i]
      const name = meta?.name ?? file.name
      if (meta && !meta.sportType) {
        setRow(i, {
          name,
          status: "skipped",
          message: meta.type || "Pas une course",
        })
        continue
      }
      if (file.size > MAX_TRACK_BYTES) {
        setRow(i, {
          name,
          status: "error",
          message: "Fichier trop lourd (15 Mo max).",
        })
        continue
      }
      setRow(i, { name, status: "running" })
      try {
        const { data } = await executeAsync({
          file,
          name: meta?.name ?? undefined,
          sportType: meta?.sportType ?? undefined,
          force,
        })
        if (!data) throw new Error()
        setRow(i, { name, ...data })
        if (data.status === "imported") imported++
      } catch {
        setRow(i, {
          name,
          status: "error",
          message: "Impossible d'importer ce fichier.",
        })
      }
    }
    try {
      if (imported > 0) {
        const result = await badges.executeAsync()
        const unlocked = result?.data?.unlocked ?? 0
        if (unlocked > 0)
          toast.success(`${unlocked} badge(s) débloqué(s) avec cet historique.`)
      }
    } finally {
      setRunning(false)
    }
  }

  const conflicts = rows.flatMap((r, i) => (r.status === "conflict" ? [i] : []))

  /** Garde la course déjà enregistrée : le fichier n'est pas importé. */
  const ignore = (indices: number[]) =>
    setRows((prev) =>
      prev.map((r, i) =>
        indices.includes(i) && r.status === "conflict"
          ? { name: r.name, status: "skipped", message: "Existante gardée" }
          : r,
      ),
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-semibold text-lg tracking-tight">
            {running ? "Import en cours…" : "Import terminé"} · {done}/
            {rows.length}
          </h2>
          <p className="text-muted-foreground text-xs">
            {count("imported")} importée(s) · {count("duplicate")} doublon(s) ·{" "}
            {count("conflict")} à confirmer · {count("skipped")} ignorée(s) ·{" "}
            {count("error")} erreur(s)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 cursor-pointer"
          disabled={running}
          onClick={onRestart}
        >
          <RotateCcw data-icon="inline-start" />
          Nouvel import
        </Button>
      </div>
      <Progress value={rows.length ? (done / rows.length) * 100 : 0} />

      {csvCount != null && (
        <Alert>
          <FileText />
          <AlertDescription>
            {csvCount > 0
              ? `${CSV_NAME} lu : ${csvCount} activités, types et titres Strava appliqués.`
              : `${CSV_NAME} trouvé mais aucune activité reconnue : import sans titres ni types.`}
          </AlertDescription>
        </Alert>
      )}

      {conflicts.length > 0 && !running && (
        <Alert className="fade-in animate-in">
          <TriangleAlert />
          <AlertTitle>{conflicts.length} course(s) à confirmer</AlertTitle>
          <AlertDescription>
            Elles démarrent à moins de 30 min d&apos;une course déjà enregistrée
            : sans doute la même, mesurée autrement. Compare et choisis ligne
            par ligne, ou d&apos;un coup.
          </AlertDescription>
          <AlertAction className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => ignore(conflicts)}
            >
              Tout ignorer
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => importAll(conflicts, true)}
            >
              Tout importer
            </Button>
          </AlertAction>
        </Alert>
      )}

      <ul className="divide-y overflow-hidden rounded-xl border text-sm">
        {rows.map((r, i) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: deux fichiers peuvent porter le même nom
            key={i}
            data-status={r.status}
            className="flex flex-col gap-2 px-4 py-2.5 transition-colors data-[status=conflict]:bg-muted/40"
          >
            <div className="flex items-center gap-3">
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
              {r.status === "conflict" && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 cursor-pointer px-2 text-xs"
                    disabled={running}
                    onClick={() => ignore([i])}
                  >
                    Ignorer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 cursor-pointer px-2 text-xs"
                    disabled={running}
                    onClick={() => importAll([i], true)}
                  >
                    Importer
                  </Button>
                </div>
              )}
            </div>
            {r.status === "conflict" && (
              <NearbyRunComparison
                candidate={r.candidate}
                existing={r.nearby}
                className="pl-7"
              />
            )}
          </li>
        ))}
      </ul>
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
    case "conflict":
      return <CircleAlert className={cn(cls, "text-amber-500")} />
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
    case "conflict":
      return <span className={cn(cls, "text-amber-600")}>À confirmer</span>
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
