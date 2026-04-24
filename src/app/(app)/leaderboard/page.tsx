import { DebugJson } from "@/components/ui/debug-json"
import { getLeaderboardAction } from "./_actions/get-leaderboard-action"
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
} from "./_schemas/leaderboard-schema"

type Props = {
  searchParams: Promise<{ metric?: string; period?: string }>
}

const VALID_METRICS: LeaderboardMetric[] = ["distance", "runs", "pace"]
const VALID_PERIODS: LeaderboardPeriod[] = [
  "week",
  "month",
  "3m",
  "6m",
  "1y",
  "all",
]

export default async function LeaderboardPage({ searchParams }: Props) {
  const { metric, period } = await searchParams

  const selectedMetric: LeaderboardMetric = VALID_METRICS.includes(
    metric as LeaderboardMetric,
  )
    ? (metric as LeaderboardMetric)
    : "distance"

  const selectedPeriod: LeaderboardPeriod = VALID_PERIODS.includes(
    period as LeaderboardPeriod,
  )
    ? (period as LeaderboardPeriod)
    : "month"

  const result = await getLeaderboardAction({
    metric: selectedMetric,
    period: selectedPeriod,
  })

  return <DebugJson data={result?.data} />
}
