"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const deleteRunsAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    await prisma.run.deleteMany({ where: { userId: user.id } })
  },
)
