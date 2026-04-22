"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mountain, RefreshCw, Footprints } from "lucide-react"
import { toast } from "sonner"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn-ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog"
import { Button } from "@/components/shadcn-ui/button"
import { Checkbox } from "@/components/shadcn-ui/checkbox"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { ScrollArea } from "@/components/shadcn-ui/scroll-area"
import { LoadingButton } from "@/components/ui/loading-button"
import { cn } from "@/lib/utils/cn"
import { getStravaUnimportedRunsAction } from "@/lib/actions/run/get-strava-unimported-runs-action"
import { importStravaRunsAction } from "@/lib/actions/run/import-strava-runs-action"
import type { StravaActivitySummary } from "@/lib/strava/types"
import {
  formatDuration,
  formatRunDate,
  formatDistanceShort,
} from "@/lib/utils/run"

export function StravaSyncDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activities, setActivities] = useState<StravaActivitySummary[] | null>(
    null,
  )
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) return
    setActivities(null)
    setSelected(new Set())
    setLoading(true)
    const result = await getStravaUnimportedRunsAction()
    setActivities(result?.data ?? [])
    setLoading(false)
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAll() {
    if (!activities) return
    if (selected.size === activities.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(activities.map((a) => a.id)))
    }
  }

  function handleImport() {
    if (selected.size === 0 || !activities) return
    startTransition(async () => {
      const toImport = activities
        .filter((a) => selected.has(a.id))
        .map((a) => ({ ...a, name: a.name ?? "Course" }))
      const result = await importStravaRunsAction({ activities: toImport })

      if (result?.serverError) {
        toast.error("Erreur lors de l'import Strava")
        return
      }

      const count = result?.data?.count ?? toImport.length
      toast.success(
        `${count} course${count > 1 ? "s" : ""} importée${count > 1 ? "s" : ""} depuis Strava`,
      )
      setOpen(false)
      router.refresh()
    })
  }

  const allSelected = !!activities && selected.size === activities.length

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <RefreshCw data-icon="inline-start" />
          Synchroniser
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Importer depuis Strava</DialogTitle>
          <DialogDescription className="sr-only">
            Sélectionnez les courses Strava à importer dans votre compte.
          </DialogDescription>
        </DialogHeader>

        {!loading && activities && activities.length > 0 && (
          <div className="flex items-center gap-3 border-y bg-muted/40 px-6 py-2.5">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={toggleAll}
            />
            <label
              htmlFor="select-all"
              className="cursor-pointer text-xs font-medium text-muted-foreground select-none"
            >
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </label>
            <span className="ml-auto text-xs text-muted-foreground">
              {activities.length} course{activities.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        <ScrollArea
          className={cn(
            activities && activities.length > 0 ? "h-[400px]" : "h-auto",
          )}
        >
          {loading && (
            <div className="flex flex-col divide-y px-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-4 shrink-0 rounded" />
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-40 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-3 w-12 rounded" />
                      <Skeleton className="h-3 w-10 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && activities?.length === 0 && (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Footprints />
                </EmptyMedia>
                <EmptyTitle>Tout est à jour</EmptyTitle>
                <EmptyDescription>
                  Aucune nouvelle course à importer depuis Strava.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!loading && activities && activities.length > 0 && (
            <div className="divide-y">
              {activities.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selected.has(a.id)}
                    onCheckedChange={() => toggleSelect(a.id)}
                  />
                  <div className="flex flex-1 items-center justify-between gap-4 text-sm">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{a.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRunDate(new Date(a.start_date_local))}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground tabular-nums">
                        {formatDistanceShort(a.distance / 1000)}
                        <span className="ml-0.5 font-normal text-muted-foreground">
                          km
                        </span>
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatDuration(a.moving_time)}
                      </span>
                      {a.total_elevation_gain > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Mountain className="size-3" />
                          {Math.round(a.total_elevation_gain)}m
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <span className="text-sm text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} sélectionnée${selected.size > 1 ? "s" : ""}`
              : "Aucune sélection"}
          </span>
          <LoadingButton
            onClick={handleImport}
            disabled={selected.size === 0}
            isLoading={isPending}
            className="cursor-pointer"
          >
            Importer
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
