import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import {
  type DiscordMessage,
  describeDiscordError,
  postToDiscord,
} from "./client"

type NotifyInput = {
  type: string
  dedupeKey: string
  message: DiscordMessage
}

// Erreur posée sur la ligne pendant l'envoi : un appel simultané la voit et n'envoie pas.
const IN_FLIGHT = "Envoi en cours"

/**
 * Réserve la clé avant d'envoyer. Une seule réservation réussit, même avec deux appels
 * simultanés (double clic) : clé neuve créée sans doublon, ou ancien échec repris.
 */
async function claim(
  { type, dedupeKey }: NotifyInput,
  payload: Prisma.InputJsonValue,
): Promise<boolean> {
  const created = await prisma.discordNotification.createMany({
    data: [
      {
        type,
        dedupeKey,
        payload,
        status: "FAILED",
        error: IN_FLIGHT,
        attempts: 0,
      },
    ],
    skipDuplicates: true,
  })
  if (created.count === 1) return true
  const retried = await prisma.discordNotification.updateMany({
    where: { dedupeKey, status: "FAILED", error: { not: IN_FLIGHT } },
    data: { payload, error: IN_FLIGHT },
  })
  return retried.count === 1
}

/**
 * Envoie un message et le journalise. Une clé déjà envoyée (ou en cours d'envoi) n'est
 * jamais renvoyée. Ne lève jamais : un échec Discord ne doit pas faire échouer l'action qui
 * l'a déclenché.
 */
export async function notify(
  input: NotifyInput,
): Promise<"sent" | "skipped" | "failed"> {
  const { dedupeKey, message } = input
  try {
    const payload = message as unknown as Prisma.InputJsonValue
    if (!(await claim(input, payload))) return "skipped"

    try {
      await postToDiscord(message)
      await prisma.discordNotification.update({
        where: { dedupeKey },
        data: {
          status: "SENT",
          sentAt: new Date(),
          error: null,
          attempts: { increment: 1 },
        },
      })
      return "sent"
    } catch (err) {
      const error = describeDiscordError(err)
      console.error("[discord] send failed", dedupeKey, error)
      await prisma.discordNotification.update({
        where: { dedupeKey },
        data: { status: "FAILED", error, attempts: { increment: 1 } },
      })
      return "failed"
    }
  } catch (err) {
    console.error("[discord] notify failed", dedupeKey, err)
    return "failed"
  }
}

/**
 * Journalise un message en échec sans l'envoyer, pour un renvoi manuel depuis l'admin
 * (ex. : records d'une course dont l'image n'est pas partie). Ne lève jamais.
 */
export async function holdNotification(
  { type, dedupeKey, message }: NotifyInput,
  reason: string,
): Promise<void> {
  const payload = message as unknown as Prisma.InputJsonValue
  try {
    await prisma.discordNotification.createMany({
      data: [
        {
          type,
          dedupeKey,
          payload,
          status: "FAILED",
          error: reason,
          attempts: 0,
        },
      ],
      skipDuplicates: true,
    })
  } catch (err) {
    console.error("[discord] hold failed", dedupeKey, err)
  }
}

/** Renvoie tel quel le corps journalisé d'une notification (renvoi manuel depuis l'admin). */
export async function resendNotification(
  id: string,
): Promise<"sent" | "failed"> {
  const row = await prisma.discordNotification.findUniqueOrThrow({
    where: { id },
  })
  try {
    await postToDiscord(row.payload as unknown as DiscordMessage)
    await prisma.discordNotification.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        error: null,
        attempts: { increment: 1 },
      },
    })
    return "sent"
  } catch (err) {
    await prisma.discordNotification.update({
      where: { id },
      data: {
        status: "FAILED",
        error: describeDiscordError(err),
        attempts: { increment: 1 },
      },
    })
    return "failed"
  }
}
