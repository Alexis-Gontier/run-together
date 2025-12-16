import { DashboardTextHeading } from "@/components/ui/dashboard-text-heading";
import { UserSelector } from "@/components/comparison/user-selector";
import { ComparisonResults } from "@/components/comparison/comparison-results";
import { PeriodSelector } from "@/components/comparison/period-selector";
import { RefreshButton } from "@/components/comparison/refresh-button";
import { ComparisonCharts } from "@/components/comparison/comparison-charts";
import { ComparisonTable } from "@/components/comparison/comparison-table";

export default function ComparisonPage() {
    return (
        <>
            <div className="flex justify-between items-end">
                <DashboardTextHeading
                    title="Comparaison"
                    description="Comparez vos performances avec d'autres membres de la communauté"
                />
                <RefreshButton />
            </div>

            <div className="grid grid-cols-4 gap-6">
                <div className="col-span-3">
                    <UserSelector />
                </div>
                <PeriodSelector />
            </div>

            {/* <ComparisonResults /> */}

            {/* <ComparisonCharts /> */}

            <ComparisonTable />
        </>
    )
}
