import { getRunsStatsAction } from "./_actions/get-runs-stats-action"
import { DebugJson } from "@/components/ui/debug-json"

type Props = {
  searchParams: Promise<{ year?: string }>
}

export default async function RunsPage({ searchParams }: Props) {
  const currentYear = new Date().getFullYear()
  const { year } = await searchParams
  const yearNum = year ? parseInt(year) : null
  const selectedYear = yearNum === 0 ? undefined : (yearNum ?? currentYear)

  const result = await getRunsStatsAction({ year: selectedYear })

  return <DebugJson data={result?.data} />
}
