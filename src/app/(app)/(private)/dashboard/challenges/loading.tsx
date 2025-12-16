import { Skeleton } from '@/components/shadcn-ui/skeleton'
import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'

export default function loading() {
    return (
        <>
            <DashboardTextHeading
                title="Défis et Gages"
                description="Suivez les défis de chaque participant et leurs gages en cas d'échec"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-70 w-full rounded-md" />
                ))}
            </div>
        </>
    )
}
