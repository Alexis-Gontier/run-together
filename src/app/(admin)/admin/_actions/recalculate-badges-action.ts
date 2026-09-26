"use server"

import { evaluateBadges } from "@/lib/badges/evaluate"
import { prisma } from "@/lib/db/prisma"
import { adminActionClient } from "@/lib/safe-action/admin-action-client"

/** Rattrapage : réévalue les badges de tous les membres, sans notification Discord. */
export const recalculateBadgesAction = adminActionClient.action(async () => {
  const users = await prisma.user.findMany({ select: { id: true } })
  let unlocked = 0
  for (const { id } of users) unlocked += (await evaluateBadges(id)).length
  return { users: users.length, unlocked }
})
