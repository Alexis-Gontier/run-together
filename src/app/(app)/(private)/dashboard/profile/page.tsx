import { Card, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { StatCard } from '@/components/ui/stat-card'

export default function page() {
    return (
        <>
            <DashboardTextHeading
                title="Profile"
                description="View and edit your profile information"
            />
            <div className="grid grid-cols-4 gap-6">
                <StatCard />
                <StatCard />
                <StatCard />
                <StatCard />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Records Personnels
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>
        </>
    )
}
