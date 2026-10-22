import { prisma } from "@/lib/db/prisma"
import { displayName } from "@/lib/utils/display-name"
import { parisMidnight, parisParts } from "@/lib/utils/paris"
import type { MonthlyRankingData } from "./embeds/monthly-ranking"

/** Mois `yyyy-MM` (heure de Paris) : du 1er 00:00 au 1er du mois suivant (exclu). */
export function monthRange(yearMonth: string): { start: Date; end: Date } {
  const [year, month] = yearMonth.split("-").map(Number)
  return {
    start: parisMidnight(year, month, 1),
    end: parisMidnight(year, month + 1, 1),
  }
}

/**
 * Mois écoulé : du 1er 00:00 du mois précédent au 1er du mois courant (exclu), heure de
 * Paris. Le cron tourne le 1er au matin, donc « le mois précédent ».
 */
export function previousMonth(now: Date): { start: Date; end: Date } {
  const { year, month } = parisParts(now)
  return {
    start: parisMidnight(year, month - 1, 1),
    end: parisMidnight(year, month, 1),
  }
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
