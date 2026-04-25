"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { getLeaderboardSchema } from "../_schemas/leaderboard-schema"
import {
  computeEvolution,
  computeStats,
  getMetricValue,
  getPeriodRange,
} from "../_utils/leaderboard-utils"

export const getLeaderboardAction = authActionClient
  .inputSchema(getLeaderboardSchema)
  .action(async ({ parsedInput: { metric, period } }) => {
    const { currentStart, currentEnd, prevStart, prevEnd } =
      getPeriodRange(period)

    const [allUsers, runs] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, username: true, image: true },
      }),
      prisma.run.findMany({
        where: { date: { gte: prevStart ?? currentStart, lte: currentEnd } },
        orderBy: { date: "asc" },
        select: {
          date: true,
          distance: true,
          duration: true,
          pace: true,
          userId: true,
        },
      }),
    ])

    const currentRuns = runs.filter(
      (r) => r.date >= currentStart && r.date <= currentEnd,
    )
    const prevRuns =
      prevStart && prevEnd
        ? runs.filter((r) => r.date >= prevStart && r.date <= prevEnd)
        : []

    // Group by userId
    type UserEntry = {
      user: (typeof allUsers)[number]
      current: typeof runs
      prev: typeof runs
    }
    const userMap = new Map<string, UserEntry>(
      allUsers.map((u) => [u.id, { user: u, current: [], prev: [] }]),
    )
    for (const run of currentRuns) userMap.get(run.userId)?.current.push(run)
    for (const run of prevRuns) userMap.get(run.userId)?.prev.push(run)

    // Compute stats per user
    const entries = Array.from(userMap.values()).map(
      ({ user, current, prev }) => {
        const currentStats = computeStats(current)
        const prevStats = computeStats(prev)
        return {
          user,
          ...currentStats,
          evolution: computeEvolution(
            getMetricValue(currentStats, metric),
            getMetricValue(prevStats, metric),
            metric,
          ),
        }
      },
    )

    // Sort by metric (pace asc = faster is better, others desc)
    entries.sort((a, b) => {
      if (metric === "distance") return b.totalDistanceKm - a.totalDistanceKm
      if (metric === "runs") return b.totalRuns - a.totalRuns
      // pace: null last, then ascending
      if (a.avgPaceSecPerKm === null) return 1
      if (b.avgPaceSecPerKm === null) return -1
      return a.avgPaceSecPerKm - b.avgPaceSecPerKm
    })

    return {
      entries: entries.map((entry, i) => ({ rank: i + 1, ...entry })),
      metric,
      period,
    }
  })
