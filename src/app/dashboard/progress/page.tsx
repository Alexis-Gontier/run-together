import TextHeading from '@/components/ui/text-heading'
import { PredictionCard } from '@/components/card/prediction-card'
import MonthlyDistanceChart from '@/components/chart/monthly-distance-chart'
import MonthlyTimeChart from '@/components/chart/monthly-time-chart'

export default function ProgressPage() {
  return (
    <>
      <TextHeading
          title="Progression"
          description="Suivez vos progrès et améliorez vos performances"
      />
      <PredictionCard />
      <div className="grid grid-cols-2 gap-4">
        <MonthlyTimeChart />
        <MonthlyDistanceChart />
      </div>
    </>
  )
}
