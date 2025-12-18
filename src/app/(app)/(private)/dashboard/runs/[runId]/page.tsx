import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { RunDetailContent } from '@/components/run/run-detail-content'
import { Button } from '@/components/shadcn-ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type RunDetailPageProps = {
    params: Promise<{
        runId: string
    }>
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
    const { runId } = await params

    return (
        <>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/runs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <DashboardTextHeading
                    title="Détails de la course"
                    description="Consultez toutes les informations sur cette course"
                />
            </div>
            <RunDetailContent runId={runId} />
        </>
    )
}
