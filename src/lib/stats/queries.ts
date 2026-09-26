import { startOfWeek, subDays, subWeeks } from "date-fns"
import { prisma } from "@/lib/db/prisma"
import { computeCurrentStreak, toDateStr } from "./streaks"

const km = (meters: number) => Math.round(meters / 100) / 10

/** Semaine en cours (lundi → maintenant) comparée à la semaine précédente, et série en cours. */
export async function getWeekSummary(userId: string) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const prevWeekStart = subWeeks(weekStart, 1)

  const [runs, recentDates, user] = await Promise.all([
    prisma.run.findMany({
      where: { userId, date: { gte: prevWeekStart } },
      select: { date: true, distance: true, elevation: true },
    }),
    // Une série ne remonte jamais au-delà d'un an : inutile de charger tout l'historique.
    prisma.run.findMany({
      where: { userId, date: { gte: subDays(now, 366) } },
      select: { date: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyGoalKm: true },
    }),
  ])

  const current = runs.filter((r) => r.date >= weekStart)
  const previous = runs.filter((r) => r.date < weekStart)

  return {
    distanceKm: km(current.reduce((s, r) => s + r.distance, 0)),
    runs: current.length,
    elevation: current.reduce((s, r) => s + r.elevation, 0),
    previousDistanceKm: km(previous.reduce((s, r) => s + r.distance, 0)),
    goalKm: user?.weeklyGoalKm ?? null,
    currentStreak: computeCurrentStreak(
      new Set(recentDates.map((r) => toDateStr(r.date))),
    ),
  }
}

/** Faits marquants d'un coureur : totaux, plus longue sortie, meilleure allure (≥ 5 km). */
export async function getUserHighlights(userId: string) {
  const [totals, first, longest, fastest] = await Promise.all([
    prisma.run.aggregate({
      where: { userId },
      _count: true,
      _sum: { distance: true, elevation: true },
    }),
    prisma.run.findFirst({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true },
    }),
    prisma.run.findFirst({
      where: { userId },
      orderBy: { distance: "desc" },
      select: { id: true, distance: true, date: true },
    }),
    prisma.run.findFirst({
      where: { userId, distance: { gte: 5000 } },
      orderBy: { pace: "asc" },
      select: { id: true, pace: true, distance: true, date: true },
    }),
  ])

  return {
    runs: totals._count,
    distanceKm: km(totals._sum.distance ?? 0),
    elevation: totals._sum.elevation ?? 0,
    since: first?.date ?? null,
    longest,
    fastest,
  }
}

/** Contexte d'une course : records établis par elle, écart à l'allure moyenne de l'auteur. */
export async function getRunInsights(runId: string) {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    select: {
      pace: true,
      distance: true,
      userId: true,
      user: { select: { name: true, username: true } },
      personalRecords: { select: { distance: true, duration: true } },
    },
  })
  if (!run) return null

  const totals = await prisma.run.aggregate({
    where: { userId: run.userId },
    _count: true,
    _sum: { distance: true, duration: true },
  })
  const totalDistance = totals._sum.distance ?? 0
  const averagePace =
    totalDistance > 0
      ? Math.round(((totals._sum.duration ?? 0) / totalDistance) * 1000)
      : null

  return {
    user: run.user,
    pace: run.pace,
    averagePace,
    runsCount: totals._count,
    records: run.personalRecords,
  }
}
