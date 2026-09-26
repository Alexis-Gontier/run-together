import { NextResponse } from "next/server"

import { env } from "@/env"
import { getUser } from "@/lib/auth/auth-session"
import { AUTH_ROUTES } from "@/lib/constants/routes"
import { prisma } from "@/lib/db/prisma"
import { stravaOAuthFetch } from "@/lib/strava/client"
import { stravaOAuthPaths } from "@/lib/strava/constants"
import { getValidAccessToken } from "@/lib/strava/token"

export async function POST() {
  if (!env.STRAVA_ENABLED) return new NextResponse(null, { status: 404 })
  const user = await getUser()
  if (!user) {
    return NextResponse.redirect(
      new URL(AUTH_ROUTES.LOGIN, env.NEXT_PUBLIC_APP_URL),
    )
  }

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

  return NextResponse.json({ success: true })
}
