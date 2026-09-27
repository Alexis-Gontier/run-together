"use client"

import { FileUp, Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRef, useState } from "react"
import { toast } from "sonner"
import type { TrackSummary } from "@/lib/runs/track/types"
import { cn } from "@/lib/utils/cn"
import { parseTrackAction } from "../_actions/parse-track-action"

const MAX_BYTES = 15 * 1024 * 1024

type TrackDropzoneProps = {
  onParsed: (summary: TrackSummary, fileName: string) => void
}

export function TrackDropzone({ onParsed }: TrackDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
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

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!/\.(gpx|tcx|fit)(\.gz)?$/i.test(file.name)) {
      toast.error(
        "Format non pris en charge : utilise un fichier .gpx, .tcx ou .fit.",
      )
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("Fichier trop lourd (15 Mo max).")
      return
    }
    setFileName(file.name)
    execute({ file })
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files[0])
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/40",
        isPending && "pointer-events-none opacity-70",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".gpx,.tcx,.fit,.gz"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      {isPending ? (
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      ) : (
        <FileUp className="size-8 text-muted-foreground" />
      )}
      <div className="space-y-1">
        <p className="font-medium text-sm">
          {isPending
            ? "Analyse du fichier…"
            : "Glisse ton fichier .gpx, .tcx ou .fit ici, ou clique pour le choisir"}
        </p>
        <p className="text-muted-foreground text-xs">
          Fichier de ta montre ou de Strava, compressé en .gz ou non. 15 Mo max.
        </p>
      </div>
    </label>
  )
}
