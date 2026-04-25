"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const getRunsCountAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    const count = await prisma.run.count({ where: { userId: user.id } })
    return { count }
  },
)
