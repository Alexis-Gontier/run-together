import { getRequiredUser } from "@/lib/auth/auth-session"
import { getLeaderboardAction } from "./_actions/get-leaderboard-action"
import { getPrLeaderboardAction } from "./_actions/get-pr-leaderboard-action"
import { LeaderboardEntries } from "./_components/leaderboard-entries"
import { PrLeaderboardEntries } from "./_components/pr-leaderboard-entries"
import { LeaderboardFilters } from "./_components/leaderboard-filters"
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
  PrDist,
} from "./_schemas/leaderboard-schema"

type Props = {
  searchParams: Promise<{ metric?: string; period?: string; dist?: string }>
}

const VALID_METRICS: LeaderboardMetric[] = ["distance", "runs", "pace", "pr"]
const VALID_PERIODS: LeaderboardPeriod[] = [
  "week",
  "month",
  "3m",
  "6m",
  "1y",
  "all",
]
const VALID_PR_DISTS: PrDist[] = [
  "KM_1",
  "KM_5",
  "KM_10",
  "HALF_MARATHON",
  "MARATHON",
]

export default async function LeaderboardPage({ searchParams }: Props) {
  const { metric, period, dist } = await searchParams

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

  const selectedPrDist: PrDist = VALID_PR_DISTS.includes(dist as PrDist)
    ? (dist as PrDist)
    : "KM_5"

  if (selectedMetric === "pr") {
    const [user, result] = await Promise.all([
      getRequiredUser(),
      getPrLeaderboardAction({ dist: selectedPrDist }),
    ])
    const entries = result?.data?.entries ?? []
    return (
      <>
        <LeaderboardFilters
          metric={selectedMetric}
          period={selectedPeriod}
          prDist={selectedPrDist}
        />
        <PrLeaderboardEntries entries={entries} currentUserId={user.id} />
      </>
    )
  }

  const [user, result] = await Promise.all([
    getRequiredUser(),
    getLeaderboardAction({ metric: selectedMetric, period: selectedPeriod }),
  ])
  const entries = result?.data?.entries ?? []

  return (
    <>
      <LeaderboardFilters
        metric={selectedMetric}
        period={selectedPeriod}
        prDist={selectedPrDist}
      />
      <LeaderboardEntries
        entries={entries}
        metric={selectedMetric}
        currentUserId={user.id}
      />
    </>
  )
}
