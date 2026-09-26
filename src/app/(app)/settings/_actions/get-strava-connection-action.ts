"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const getStravaConnectionAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    const stravaAccount = await prisma.stravaAccount.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        stravaAthleteId: true,
        connectedAt: true,
      },
    })

    return { stravaAccount }
  },
)
