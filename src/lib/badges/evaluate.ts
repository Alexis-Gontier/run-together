import { prisma } from "@/lib/db/prisma"
import {
  BADGES,
  BADGES_BY_KEY,
  type BadgeDef,
  badgeProgress,
  earnedBadges,
} from "./catalog"
import { type BadgeStats, computeBadgeStats } from "./stats"

async function loadStats(userId: string): Promise<BadgeStats> {
  const [runs, recordsByRun, group] = await Promise.all([
    prisma.run.findMany({
      where: { userId },
      select: { date: true, distance: true, duration: true, elevation: true },
    }),
    prisma.personalRecord.groupBy({
      by: ["runId"],
      where: { userId },
      _count: true,
    }),
    prisma.run.aggregate({ _sum: { distance: true, elevation: true } }),
  ])
  return computeBadgeStats(runs, {
    recordDistances: recordsByRun.reduce((s, r) => s + r._count, 0),
    maxRecordsOnOneRun: Math.max(
      0,
      ...recordsByRun.filter((r) => r.runId).map((r) => r._count),
    ),
    groupKm: (group._sum.distance ?? 0) / 1000,
    groupElevation: group._sum.elevation ?? 0,
  })
}

/**
 * Aligne la table `UserBadge` sur ce que le catalogue accorde : ajoute les badges gagnés,
 * retire ceux qui ne le sont plus (course supprimée). Renvoie les badges nouvellement débloqués.
 * `runId` : course qui déclenche l'évaluation, rattachée aux nouveaux badges.
 */
export async function evaluateBadges(
  userId: string,
  runId?: string,
): Promise<BadgeDef[]> {
  const [stats, existing] = await Promise.all([
    loadStats(userId),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true },
    }),
  ])

  const earned = new Set(earnedBadges(stats).map((b) => b.key))
  const owned = new Set(existing.map((b) => b.badgeKey))
  const added = [...earned].filter((k) => !owned.has(k))
  const removed = [...owned].filter((k) => !earned.has(k))

  if (added.length > 0)
    await prisma.userBadge.createMany({
      data: added.map((badgeKey) => ({ userId, badgeKey, runId })),
      skipDuplicates: true,
    })
  if (removed.length > 0)
    await prisma.userBadge.deleteMany({
      where: { userId, badgeKey: { in: removed } },
    })

  return added.flatMap((k) => BADGES_BY_KEY.get(k) ?? [])
}

export type BadgeStatus = BadgeDef & {
  unlockedAt: Date | null
  progress: number
  current: number
}

/** Catalogue complet avec, pour cet utilisateur, date de déblocage et avancement. */
export async function getBadgeStatuses(userId: string): Promise<BadgeStatus[]> {
  const [stats, owned] = await Promise.all([
    loadStats(userId),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true, unlockedAt: true },
    }),
  ])
  const unlockedAt = new Map(owned.map((b) => [b.badgeKey, b.unlockedAt]))
  return BADGES.map((b) => ({
    ...b,
    unlockedAt: unlockedAt.get(b.key) ?? null,
    progress: badgeProgress(b, stats),
    current: b.value(stats),
  }))
}

/** Badges débloqués, du plus récent au plus ancien. */
export async function getUnlockedBadges(userId: string, take?: number) {
  const rows = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
    take,
    select: { badgeKey: true, unlockedAt: true },
  })
  return rows.flatMap((r) => {
    const def = BADGES_BY_KEY.get(r.badgeKey)
    return def ? [{ ...def, unlockedAt: r.unlockedAt }] : []
  })
}
