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

/**
 * Envoie un message et le journalise. Une clé déjà envoyée n'est jamais renvoyée. Ne lève
 * jamais : un échec Discord ne doit pas faire échouer l'action qui l'a déclenché.
 */
export async function notify({
  type,
  dedupeKey,
  message,
}: NotifyInput): Promise<"sent" | "skipped" | "failed"> {
  try {
    const existing = await prisma.discordNotification.findUnique({
      where: { dedupeKey },
      select: { status: true },
    })
    if (existing?.status === "SENT") return "skipped"

    const payload = message as unknown as Prisma.InputJsonValue
    try {
      await postToDiscord(message)
      await prisma.discordNotification.upsert({
        where: { dedupeKey },
        create: {
          type,
          dedupeKey,
          payload,
          status: "SENT",
          sentAt: new Date(),
        },
        update: {
          payload,
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
      await prisma.discordNotification.upsert({
        where: { dedupeKey },
        create: { type, dedupeKey, payload, status: "FAILED", error },
        update: {
          payload,
          status: "FAILED",
          error,
          attempts: { increment: 1 },
        },
      })
      return "failed"
    }
  } catch (err) {
    console.error("[discord] notify failed", dedupeKey, err)
    return "failed"
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
