import { DashboardTextHeading } from "@/components/ui/dashboard-text-heading";
import { BmiForm } from "@/components/bmi/bmi-create-form";
import { StatCard } from "@/components/ui/stat-card";
import { getBmisAction } from "@/lib/actions/bmi";
import { Activity, Ruler, Weight } from "lucide-react";
import { calculateBMI, getBMICategory } from "@/lib/utils/bmi";
import { BmiHistory } from "@/components/bmi/bmi-history";
import { BMIEvolutionChart } from "@/components/bmi/bmi-evolution-chart";
import { HeightEvolutionChart } from "@/components/bmi/height-evolution-chart";
import { WeightEvolutionChart } from "@/components/bmi/weight-evolution-chart";

export default async function BmiPage() {

    const result = await getBmisAction();
    // await new Promise(resolve => setTimeout(resolve, 2000))

    const latestMetric = result.data?.success && result.data.data && result.data.data.length > 0 ? result.data.data[0] : null
    const bmi = latestMetric ? calculateBMI(latestMetric.weight, latestMetric.height) : null

    return (
        <>
            <DashboardTextHeading
                title="BMI"
                description="Monitor your Body Mass Index"
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BmiForm />
                <BmiHistory metrics={result.data?.success && result.data.data ? result.data.data : []} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Current BMI"
                    value={bmi ? bmi.toFixed(1) : "N/A"}
                    description={getBMICategory(bmi)}
                    icon={<Activity size={16} />}
                />
                <StatCard
                    title="Current Weight"
                    value={latestMetric ? `${latestMetric.weight} kg` : "N/A"}
                    description="Your current weight"
                    icon={<Weight size={16} />}
                />
                <StatCard
                    title="Current Height"
                    value={latestMetric ? `${latestMetric.height} cm` : "N/A"}
                    description="Your current height"
                    icon={<Ruler size={16} />}
                />
            </div>
            <BMIEvolutionChart metrics={result.data?.success && result.data.data ? result.data.data : []} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HeightEvolutionChart metrics={result.data?.success && result.data.data ? result.data.data : []} />
                <WeightEvolutionChart metrics={result.data?.success && result.data.data ? result.data.data : []} />
            </div>
        </>
    )
}
