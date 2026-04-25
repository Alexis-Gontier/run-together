import { getRequiredUser } from "@/lib/auth/auth-session"
import { getLeaderboardAction } from "./_actions/get-leaderboard-action"
import { LeaderboardEntries } from "./_components/leaderboard-entries"
import { LeaderboardFilters } from "./_components/leaderboard-filters"
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

  const [user, result] = await Promise.all([
    getRequiredUser(),
    getLeaderboardAction({ metric: selectedMetric, period: selectedPeriod }),
  ])

  const entries = result?.data?.entries ?? []

  return (
    <>
      <LeaderboardFilters metric={selectedMetric} period={selectedPeriod} />
      <LeaderboardEntries
        entries={entries}
        metric={selectedMetric}
        currentUserId={user.id}
      />
    </>
  )
}
