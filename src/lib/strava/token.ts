import type { StravaAccount } from "@/generated/prisma/client"
import { env } from "@/env"
import { prisma } from "@/lib/db/prisma"
import { stravaOAuthFetch } from "@/lib/strava/client"
import { stravaOAuthPaths } from "@/lib/strava/constants"
import { stravaTokenRefreshSchema } from "@/lib/strava/schemas"

// Refresh the token 60s before actual expiry to avoid race conditions
const TOKEN_GRACE_SECONDS = 60

function isTokenExpired(expiry: Date): boolean {
  return expiry.getTime() - TOKEN_GRACE_SECONDS * 1000 <= Date.now()
}

export async function getValidAccessToken(
  account: StravaAccount,
): Promise<string> {
  if (!isTokenExpired(account.tokenExpiry)) {
    return account.accessToken
  }

  // Re-read from DB: another instance may have already refreshed the token
  const fresh = await prisma.stravaAccount.findUnique({
    where: { id: account.id },
  })

  if (fresh && !isTokenExpired(fresh.tokenExpiry)) {
    return fresh.accessToken
  }

  const current = fresh ?? account

  const data = await stravaOAuthFetch(stravaOAuthPaths.token, {
    method: "POST",
    body: {
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: current.refreshToken,
    },
    schema: stravaTokenRefreshSchema,
  })

  await prisma.stravaAccount.update({
    where: { id: account.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiry: new Date(data.expires_at * 1000),
    },
  })

  return data.access_token
}
