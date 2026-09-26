import { Skeleton } from "@/components/shadcn-ui/skeleton"

export default function RightPanelLoading() {
  return (
    <div className="space-y-4 p-4" aria-busy="true">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  )
}
