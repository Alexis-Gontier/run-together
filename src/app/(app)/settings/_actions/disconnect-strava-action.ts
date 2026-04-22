"use server"

import { revalidatePath } from "next/cache"

import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { prisma } from "@/lib/db/prisma"
import { ROUTES } from "@/lib/constants/routes"
import { stravaOAuthFetch } from "@/lib/strava/client"
import { stravaOAuthPaths } from "@/lib/strava/constants"
import { getValidAccessToken } from "@/lib/strava/token"

export const disconnectStravaAction = authActionClient.action(
  async ({ ctx: { user } }) => {
    const account = await prisma.stravaAccount.findUnique({
      where: { userId: user.id },
    })

    if (account) {
      try {
        const accessToken = await getValidAccessToken(account)
        await stravaOAuthFetch(stravaOAuthPaths.deauthorize, {
          method: "POST",
          body: { access_token: accessToken },
        })
      } catch {
        // Best effort — still disconnect locally if Strava revocation fails
      }
    }

    await prisma.stravaAccount.deleteMany({ where: { userId: user.id } })
    revalidatePath(ROUTES.SETTINGS)
  },
)
