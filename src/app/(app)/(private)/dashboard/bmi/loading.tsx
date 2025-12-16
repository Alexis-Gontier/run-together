import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { Skeleton } from '@/components/shadcn-ui/skeleton'

export default function loading() {
  return (
    <>
      <DashboardTextHeading
        title="Statistiques IMC"
        description="Suivez votre indice de masse corporelle et votre évolution de poids et de taille au fil du temps"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-85 w-full rounded-xl" />
        <Skeleton className="h-85 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-39 w-full rounded-xl" />
        <Skeleton className="h-39 w-full rounded-xl" />
        <Skeleton className="h-39 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-85 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-85 w-full rounded-xl" />
        <Skeleton className="h-85 w-full rounded-xl" />
      </div>
    </>
  )
}