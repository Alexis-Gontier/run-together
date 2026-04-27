import { getRunsStatsAction } from "./_actions/get-runs-stats-action"
import { YearSelector } from "./_components/year-selector"
import { StatCard } from "./_components/stat-card"
import { buildStatCards } from "./_utils/stats"
import { MonthAccordionList } from "./_components/month-accordion-list"

type Props = {
  searchParams: Promise<{ year?: string }>
}

export default async function RunsPage({ searchParams }: Props) {
  const currentYear = new Date().getFullYear()
  const { year } = await searchParams
  const yearNum = year ? parseInt(year) : null
  const selectedYear = yearNum === 0 ? undefined : (yearNum ?? currentYear)

  const result = await getRunsStatsAction({ year: selectedYear })
  const data = result?.data

  if (!data) return null

  const statCards = buildStatCards(data.globalStats)

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <YearSelector years={data.years} />
      <MonthAccordionList months={data.months} />
    </div>
  )
}
