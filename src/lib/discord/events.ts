import { env } from "@/env"
import { prisma } from "@/lib/db/prisma"
import type { NewPR } from "@/lib/runs/personal-records"
import { buildBadgeUnlockedMessage } from "./embeds/badge-unlocked"
import { buildRunCreatedMessage } from "./embeds/run-created"
import { buildMemberJoinedMessage, buildTestMessage } from "./embeds/simple"
import { notify } from "./notify"

/** Nouvelle course (formulaire, fichier ou Strava). Appelé par `recordRun`. */
export async function notifyRunCreated(runId: string, newPRs: NewPR[]) {
  try {
    const run = await prisma.run.findUniqueOrThrow({
      where: { id: runId },
      include: {
        user: { select: { name: true, username: true, image: true } },
      },
    })
    await notify({
      type: "run.created",
      dedupeKey: `run.created:${runId}`,
      message: buildRunCreatedMessage(
        {
          runId,
          runName: run.name || "Course sans nom",
          userName: run.user.name,
          username: run.user.username,
          userImage: run.user.image,
          distance: run.distance,
          duration: run.duration,
          pace: run.pace,
          elevation: run.elevation,
          heartRateAvg: run.heartRateAvg,
          date: run.date,
          sportType: run.sportType,
          newPRs,
        },
        env.NEXT_PUBLIC_APP_URL,
      ),
    })
  } catch (err) {
    console.error("[discord] run.created failed", runId, err)
  }
}

/** Fin d'onboarding d'un nouveau membre. */
export async function notifyMemberJoined(userId: string) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, username: true },
    })
    await notify({
      type: "member.joined",
      dedupeKey: `member.joined:${userId}`,
      message: buildMemberJoinedMessage(user, env.NEXT_PUBLIC_APP_URL),
    })
  } catch (err) {
    console.error("[discord] member.joined failed", userId, err)
  }
}

/** Bouton « Tester le webhook » de l'admin : clé unique à chaque clic. */
export function sendTestNotification(adminName: string) {
  return notify({
    type: "test",
    dedupeKey: `test:${Date.now()}`,
    message: buildTestMessage(adminName),
  })
}

/** Badges débloqués par une course : un seul message, dédoublonné par course. */
export async function notifyBadgesUnlocked(
  userId: string,
  runId: string,
  badges: { emoji: string; name: string; description: string }[],
) {
  if (badges.length === 0) return
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, username: true },
    })
    await notify({
      type: "badge.unlocked",
      dedupeKey: `badge.unlocked:${runId}`,
      message: buildBadgeUnlockedMessage(
        user,
        badges,
        runId,
        env.NEXT_PUBLIC_APP_URL,
      ),
    })
  } catch (err) {
    console.error("[discord] badge.unlocked failed", runId, err)
  }
}
