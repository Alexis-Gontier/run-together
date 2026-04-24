import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { env } from "@/env"
import { getUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"
import { AUTH_ROUTES, ROUTES } from "@/lib/constants/routes"
import { stravaApiFetch, stravaOAuthFetch } from "@/lib/strava/client"
import { stravaEndpoints, stravaOAuthPaths } from "@/lib/strava/constants"
import { stravaTokenExchangeSchema } from "@/lib/strava/schemas"
import { z } from "zod"

function redirectTo(path: string) {
  return NextResponse.redirect(new URL(path, env.NEXT_PUBLIC_APP_URL))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // User denied access on Strava's side
  if (error === "access_denied") {
    return redirectTo(ROUTES.SETTINGS)
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    )
  }

  // Verify CSRF state
  const cookieStore = await cookies()
  const storedState = cookieStore.get("strava_oauth_state")?.value

  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 })
  }

  cookieStore.delete("strava_oauth_state")

  // Require authenticated user
  const user = await getUser()
  if (!user) {
    return redirectTo(AUTH_ROUTES.LOGIN)
  }

  // Exchange authorization code for tokens
  let tokenData
  try {
    tokenData = await stravaOAuthFetch(stravaOAuthPaths.token, {
      method: "POST",
      body: {
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      },
      schema: stravaTokenExchangeSchema,
    })
  } catch {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 502 },
    )
  }

  const stravaAthleteId = String(tokenData.athlete.id)

  // Upsert StravaAccount — handles reconnect without creating duplicates
  await prisma.stravaAccount.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stravaAthleteId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: new Date(tokenData.expires_at * 1000),
    },
    update: {
      stravaAthleteId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: new Date(tokenData.expires_at * 1000),
      connectedAt: new Date(),
    },
  })

  await ensureWebhookSubscription()

  return redirectTo(ROUTES.SETTINGS)
}

async function ensureWebhookSubscription() {
  try {
    const existing = await stravaApiFetch(stravaEndpoints.pushSubscriptions, {
      params: {
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
      },
      schema: z.array(z.object({ id: z.number() })),
    })

    if (existing.length > 0) return

    await stravaApiFetch(stravaEndpoints.pushSubscriptions, {
      method: "POST",
      body: {
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        callback_url: `${env.NEXT_PUBLIC_APP_URL}/api/strava/webhook`,
        verify_token: env.STRAVA_WEBHOOK_VERIFY_TOKEN,
      },
    })
  } catch (err) {
    console.error("[strava/callback] webhook subscription setup failed", err)
  }
}
