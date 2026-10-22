"use server"

import { format } from "date-fns"
import { env } from "@/env"
import { prisma } from "@/lib/db/prisma"
import { buildBattleResultMessage } from "@/lib/discord/embeds/battle-result"
import { notify } from "@/lib/discord/notify"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { publishBattleSchema } from "../_schemas/battle-schema"
import { computeBattle } from "../_utils/battle"
import { getComparison } from "../_utils/comparison"

/** Recalcule la bataille côté serveur et publie le résultat (une fois par jour et par duel). */
export const publishBattleAction = authActionClient
  .inputSchema(publishBattleSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const other = await prisma.user.findFirst({
      where: { username: parsedInput.with.toLowerCase(), id: { not: user.id } },
      select: { id: true },
    })
    if (!other) return { error: "Membre introuvable." }

    const now = new Date()
    const day = format(now, "yyyy-MM-dd")
    const battle = computeBattle(
      await getComparison(user.id, other.id, parsedInput.period, now),
    )

    const pair = [user.id, other.id].sort().join(":")
    const status = await notify({
      type: "battle.result",
      dedupeKey: `battle.result:${pair}:${parsedInput.period}:${day}`,
      message: buildBattleResultMessage(
        {
          a: { id: user.id, points: battle.score.me },
          b: { id: other.id, points: battle.score.other },
          period: parsedInput.period,
          day,
        },
        env.NEXT_PUBLIC_APP_URL,
      ),
    })
    if (status === "skipped")
      return {
        error: "Ce duel a déjà été publié aujourd'hui sur cette période.",
      }
    if (status === "failed")
      return { error: "Discord est indisponible, réessaie plus tard." }
    return { ok: true }
  })
