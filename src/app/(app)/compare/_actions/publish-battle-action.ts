"use server"

import { format } from "date-fns"
import { prisma } from "@/lib/db/prisma"
import { buildBattleResultMessage } from "@/lib/discord/embeds/battle-result"
import { notify } from "@/lib/discord/notify"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { displayName } from "@/lib/utils/display-name"
import { publishBattleSchema } from "../_schemas/battle-schema"
import {
  BATTLE_PERIOD_PHRASES,
  type BattleLine,
  computeBattle,
  type Side,
} from "../_utils/battle"
import { getComparison } from "../_utils/comparison"

/** Recalcule la bataille côté serveur et publie le résultat (une fois par jour et par duel). */
export const publishBattleAction = authActionClient
  .inputSchema(publishBattleSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const other = await prisma.user.findFirst({
      where: { username: parsedInput.with.toLowerCase(), id: { not: user.id } },
      select: { id: true, name: true, username: true, displayUsername: true },
    })
    if (!other) return { error: "Membre introuvable." }

    const battle = computeBattle(
      await getComparison(user.id, other.id, parsedInput.period),
    )
    const wins = (side: Side) =>
      [...battle.stats, ...battle.records]
        .filter((l) => l.winner === side)
        .map(
          (l: BattleLine) =>
            `${l.label} — ${side === "me" ? l.meText : l.otherText}`,
        )

    const pair = [user.id, other.id].sort().join(":")
    const status = await notify({
      type: "battle.result",
      dedupeKey: `battle.result:${pair}:${parsedInput.period}:${format(new Date(), "yyyy-MM-dd")}`,
      message: buildBattleResultMessage({
        a: {
          name: displayName(user),
          points: battle.score.me,
          wins: wins("me"),
        },
        b: {
          name: displayName(other),
          points: battle.score.other,
          wins: wins("other"),
        },
        periodPhrase: BATTLE_PERIOD_PHRASES[parsedInput.period],
      }),
    })
    if (status === "skipped")
      return {
        error: "Ce duel a déjà été publié aujourd'hui sur cette période.",
      }
    if (status === "failed")
      return { error: "Discord est indisponible, réessaie plus tard." }
    return { ok: true }
  })
