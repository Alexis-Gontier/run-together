import { Skeleton } from "@/components/shadcn-ui/skeleton"

/** Squelette générique des pages de l'app : la forme d'une liste de cartes plutôt qu'un spinner. */
export default function Loading() {
  return (
    <div className="space-y-4 p-4" aria-busy="true">
      <span className="sr-only">Chargement…</span>
      {["a", "b", "c"].map((key) => (
        <div key={key} className="space-y-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      ))}
    </div>
  )
}
