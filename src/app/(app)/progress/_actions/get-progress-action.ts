"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { getProgressSchema } from "../_schemas/progress-schema"
import {
  avgPaceSec,
  computeBestStreak,
  computeCurrentStreak,
  getPeriodRange,
  getWeekStart,
  sumDistanceKm,
  sumElevationM,
  toDateStr,
} from "../_utils/progress-utils"

export const getProgressAction = authActionClient
  .inputSchema(getProgressSchema)
  .action(async ({ parsedInput: { period }, ctx: { user } }) => {
    const { currentStart, currentEnd, prevStart, prevEnd } =
      getPeriodRange(period)

    const [runs, allRunDates] = await Promise.all([
      prisma.run.findMany({
        where: {
          userId: user.id,
          date: { gte: prevStart ?? currentStart, lte: currentEnd },
        },
        orderBy: { date: "asc" },
        select: {
          date: true,
          distance: true,
          duration: true,
          pace: true,
          elevation: true,
        },
      }),
      prisma.run.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
        select: { date: true },
      }),
    ])

    const currentRuns = runs.filter(
      (r) => r.date >= currentStart && r.date <= currentEnd,
    )
    const prevRuns =
      prevStart && prevEnd
        ? runs.filter((r) => r.date >= prevStart && r.date <= prevEnd)
        : []

    // --- Summary stats ---
    const summary = {
      current: {
        totalDistanceKm: sumDistanceKm(currentRuns),
        totalRuns: currentRuns.length,
        avgPaceSecPerKm: avgPaceSec(currentRuns),
        totalElevationM: sumElevationM(currentRuns),
      },
      previous:
        prevStart !== null
          ? {
              totalDistanceKm: sumDistanceKm(prevRuns),
              totalRuns: prevRuns.length,
              avgPaceSecPerKm: avgPaceSec(prevRuns),
              totalElevationM: sumElevationM(prevRuns),
            }
          : null,
    }

    // --- Weekly volume with 4-week moving average ---
    const weekMap = new Map<string, number>()
    for (const run of currentRuns) {
      const week = getWeekStart(run.date)
      weekMap.set(week, (weekMap.get(week) ?? 0) + run.distance)
    }

    const firstWeek = getWeekStart(currentStart)
    const lastWeek = getWeekStart(currentEnd)
    const rawWeeks: { weekStart: string; distanceKm: number }[] = []
    const cursor = new Date(firstWeek + "T00:00:00Z")
    while (toDateStr(cursor) <= lastWeek) {
      const key = toDateStr(cursor)
      rawWeeks.push({
        weekStart: key,
        distanceKm: Math.round((weekMap.get(key) ?? 0) / 100) / 10,
      })
      cursor.setUTCDate(cursor.getUTCDate() + 7)
    }

    const weeklyVolume = rawWeeks.map((w, i, arr) => ({
      ...w,
      trendKm:
        i >= 3
          ? Math.round(
              (arr.slice(i - 3, i + 1).reduce((s, x) => s + x.distanceKm, 0) /
                4) *
                10,
            ) / 10
          : null,
    }))

    // --- Daily activity for heatmap ---
    const dailyMap = new Map<string, number>()
    for (const run of currentRuns) {
      const day = toDateStr(run.date)
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + run.distance)
    }
    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, distance]) => ({
        date,
        distanceKm: Math.round(distance / 100) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // --- Pace evolution (one point per run) ---
    const paceEvolution = currentRuns.map((r) => ({
      date: toDateStr(r.date),
      paceSecPerKm: r.pace,
      distanceKm: Math.round(r.distance / 100) / 10,
    }))

    // --- Weekly elevation ---
    const elevMap = new Map<string, number>()
    for (const run of currentRuns) {
      const week = getWeekStart(run.date)
      elevMap.set(week, (elevMap.get(week) ?? 0) + run.elevation)
    }
    const weeklyElevation = rawWeeks.map((w) => ({
      weekStart: w.weekStart,
      elevationM: elevMap.get(w.weekStart) ?? 0,
    }))

    // --- Streaks ---
    const activeDateSet = new Set(currentRuns.map((r) => toDateStr(r.date)))
    const allDateSet = new Set(allRunDates.map((r) => toDateStr(r.date)))

    const bestStreak = computeBestStreak(activeDateSet)
    const currentStreak = computeCurrentStreak(allDateSet)

    // Total days in period (for "all", start from first run)
    const actualStart =
      period === "all" && currentRuns.length > 0
        ? currentRuns[0].date
        : currentStart
    const totalDays =
      Math.ceil(
        (currentEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1

    return {
      summary,
      weeklyVolume,
      dailyActivity,
      paceEvolution,
      weeklyElevation,
      streaks: {
        currentStreak,
        bestStreak,
        activeDays: activeDateSet.size,
        totalDays,
      },
    }
  })
