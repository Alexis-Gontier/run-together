import { prisma } from "@/lib/db/prisma"
import { displayName } from "@/lib/utils/display-name"
import type { MonthlyRankingData } from "./embeds/monthly-ranking"

/**
 * Mois écoulé : du 1er 00:00 **UTC** du mois précédent au 1er du mois courant (exclu).
 * Le cron tourne le 1er au matin, donc « le mois précédent ».
 */
export function previousMonth(now: Date): { start: Date; end: Date } {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1),
  )
  return { start, end }
}

/** Classement du groupe à la distance sur la fenêtre ; `null` si personne n'a couru. */
export async function getMonthlyRankingData(
  start: Date,
  end: Date,
): Promise<MonthlyRankingData | null> {
  const runs = await prisma.run.findMany({
    where: { date: { gte: start, lt: end } },
    select: {
      distance: true,
      userId: true,
      user: { select: { name: true, username: true, displayUsername: true } },
    },
  })
  if (runs.length === 0) return null

  const byUser = new Map<
    string,
    { name: string; distance: number; runs: number }
  >()
  for (const r of runs) {
    const u = byUser.get(r.userId) ?? {
      name: displayName(r.user),
      distance: 0,
      runs: 0,
    }
    u.distance += r.distance
    u.runs += 1
    byUser.set(r.userId, u)
  }

  return {
    monthStart: start,
    totalDistance: runs.reduce((s, r) => s + r.distance, 0),
    totalRuns: runs.length,
    ranking: [...byUser.values()].sort((a, b) => b.distance - a.distance),
  }
}
