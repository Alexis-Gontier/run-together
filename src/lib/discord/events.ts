import { env } from "@/env"
import { prisma } from "@/lib/db/prisma"
import type { NewPR } from "@/lib/runs/personal-records"
import { displayName } from "@/lib/utils/display-name"
import { buildBadgeUnlockedMessage } from "./embeds/badge-unlocked"
import { buildRecordSetMessage } from "./embeds/record-set"
import { buildRunCreatedMessage } from "./embeds/run-created"
import { buildMemberJoinedMessage, buildTestMessage } from "./embeds/simple"
import { holdNotification, notify } from "./notify"

/**
 * Nouvelle course (formulaire, fichier ou Strava). Appelé par `recordRun`. L'image de la
 * course d'abord, puis, si elle bat des records, un message texte qui les annonce.
 */
export async function notifyRunCreated(runId: string, newPRs: NewPR[]) {
  try {
    const runStatus = await notify({
      type: "run.created",
      dedupeKey: `run.created:${runId}`,
      message: buildRunCreatedMessage(
        { runId, hasRecords: newPRs.length > 0 },
        env.NEXT_PUBLIC_APP_URL,
      ),
    })
    if (newPRs.length === 0) return

    const run = await prisma.run.findUniqueOrThrow({
      where: { id: runId },
      select: {
        user: { select: { name: true, username: true, displayUsername: true } },
      },
    })
    const records = {
      type: "record.set",
      dedupeKey: `record.set:${runId}`,
      message: buildRecordSetMessage(displayName(run.user), newPRs),
    }
    // Sans l'image de la course, le texte des records arriverait seul : il attend un renvoi.
    if (runStatus === "failed")
      await holdNotification(
        records,
        "Non envoyé : la course a échoué. Renvoyer la course, puis ce message.",
      )
    else await notify(records)
  } catch (err) {
    console.error("[discord] run.created failed", runId, err)
  }
}

/** Fin d'onboarding d'un nouveau membre. */
export async function notifyMemberJoined(userId: string) {
  try {
    await notify({
      type: "member.joined",
      dedupeKey: `member.joined:${userId}`,
      message: buildMemberJoinedMessage(userId, env.NEXT_PUBLIC_APP_URL),
    })
  } catch (err) {
    console.error("[discord] member.joined failed", userId, err)
  }
}

/** Bouton « Tester le webhook » de l'admin : clé unique à chaque clic. */
export function sendTestNotification() {
  return notify({
    type: "test",
    dedupeKey: `test:${Date.now()}`,
    message: buildTestMessage(env.NEXT_PUBLIC_APP_URL),
  })
}

/** Badges débloqués par une course : un seul message, dédoublonné par course. */
export async function notifyBadgesUnlocked(
  runId: string,
  badges: { emoji: string; name: string; description: string }[],
) {
  if (badges.length === 0) return
  try {
    await notify({
      type: "badge.unlocked",
      dedupeKey: `badge.unlocked:${runId}`,
      message: buildBadgeUnlockedMessage(runId, env.NEXT_PUBLIC_APP_URL),
    })
  } catch (err) {
    console.error("[discord] badge.unlocked failed", runId, err)
  }
}
