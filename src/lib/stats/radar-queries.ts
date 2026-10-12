import { prisma } from "@/lib/db/prisma"
import { type StatsPeriod, statsPeriodRange } from "./periods"
import { type RunnerTotals, runnerTotals } from "./radar"

export type RunnerProfile = {
  user: {
    id: string
    name: string | null
    username: string | null
    displayUsername: string | null
    image: string | null
  }
  totals: RunnerTotals
}

/** Totaux de chaque membre ayant couru sur la période — base commune des radars. */
export async function getRunnerProfiles(
  period: StatsPeriod,
): Promise<RunnerProfile[]> {
  const { start, end } = statsPeriodRange(period)
  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
      runs: { some: { date: { gte: start, lte: end } } },
    },
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      image: true,
      runs: {
        where: { date: { gte: start, lte: end } },
        select: { date: true, distance: true, duration: true, elevation: true },
      },
    },
  })
  return users.map(({ runs, ...user }) => ({
    user,
    totals: runnerTotals(runs, start, end),
  }))
}
