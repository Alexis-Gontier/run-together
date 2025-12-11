import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { RunCalendar } from '@/components/run/run-calendar'
import { RunObjective } from '@/components/run/run-objective'

export default function page() {
    return (
        <>
            <DashboardTextHeading
                title="Dashboard"
                description="Welcome to your dashboard"
            />
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <RunCalendar />
                    <RunObjective />
                </div>
            </div>
        </>
    )
}
