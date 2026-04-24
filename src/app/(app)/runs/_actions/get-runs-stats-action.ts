"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { z } from "zod"

const schema = z.object({
  year: z.number().optional(),
})

export const getRunsStatsAction = authActionClient
  .inputSchema(schema)
  .action(async ({ parsedInput: { year }, ctx: { user } }) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const allRuns = await prisma.run.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
        distance: true,
        duration: true,
        pace: true,
        elevation: true,
        sportType: true,
      },
    })

    // --- Global stats ---
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const thisMonthRuns = allRuns.filter((r) => {
      const d = new Date(r.date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })

    const lastMonthRuns = allRuns.filter((r) => {
      const d = new Date(r.date)
      return d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth
    })

    const avgPace = (runs: typeof allRuns) =>
      runs.length > 0
        ? Math.round(runs.reduce((s, r) => s + r.pace, 0) / runs.length)
        : 0

    const sumDistance = (runs: typeof allRuns) =>
      Math.round(runs.reduce((s, r) => s + r.distance, 0) / 100) / 10

    const sumElevation = (runs: typeof allRuns) =>
      runs.reduce((s, r) => s + r.elevation, 0)

    const avgPaceLastMonth = avgPace(lastMonthRuns)
    const avgPaceThisMonth = avgPace(thisMonthRuns)

    const globalStats = {
      totalRuns: allRuns.length,
      totalRunsMonthDelta: thisMonthRuns.length,
      totalDistanceKm: sumDistance(allRuns),
      totalDistanceMonthDeltaKm: sumDistance(thisMonthRuns),
      avgPaceSecPerKm: avgPace(allRuns),
      avgPaceMonthDeltaSec:
        lastMonthRuns.length > 0 && thisMonthRuns.length > 0
          ? avgPaceThisMonth - avgPaceLastMonth
          : null,
      totalElevationM: sumElevation(allRuns),
      totalElevationMonthDeltaM: sumElevation(thisMonthRuns),
    }

    // --- Monthly breakdown ---
    const filteredRuns = year
      ? allRuns.filter((r) => new Date(r.date).getFullYear() === year)
      : allRuns

    const monthMap = new Map<string, typeof allRuns>()
    for (const run of filteredRuns) {
      const d = new Date(run.date)
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`
      if (!monthMap.has(key)) monthMap.set(key, [])
      monthMap.get(key)!.push(run)
    }

    const months = Array.from(monthMap.entries()).map(
      ([key, runs], index, arr) => {
        const [y, m] = key.split("-").map(Number)
        const distanceKm = sumDistance(runs)
        const prev = arr[index + 1]
        const prevDistanceKm = prev ? sumDistance(prev[1]) : null
        const trendPercent =
          prevDistanceKm != null && prevDistanceKm > 0
            ? Math.round(((distanceKm - prevDistanceKm) / prevDistanceKm) * 100)
            : null

        return {
          year: y,
          month: m,
          runs,
          stats: {
            count: runs.length,
            distanceKm,
            avgPaceSecPerKm: avgPace(runs),
            elevationM: sumElevation(runs),
            trendPercent,
          },
        }
      },
    )

    const years = [
      ...new Set(allRuns.map((r) => new Date(r.date).getFullYear())),
    ].sort((a, b) => b - a)

    return {
      globalStats,
      months,
      years,
    }
  })
