"use server"

import { evaluateBadges } from "@/lib/badges/evaluate"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

/** Fin d'un import en masse : aligne les badges sur l'historique, une seule fois, sans notification. */
export const evaluateMyBadgesAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    const unlocked = await evaluateBadges(user.id)
    return { unlocked: unlocked.length }
  },
)
