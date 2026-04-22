import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { env } from "@/env"
import { getUser } from "@/lib/auth/auth-session"
import { API_ROUTES, AUTH_ROUTES } from "@/lib/constants/routes"
import { STRAVA_AUTH_URL, STRAVA_SCOPE } from "@/lib/strava/constants"

export async function GET() {
  const user = await getUser()
  if (!user) {
    return redirect(AUTH_ROUTES.LOGIN)
  }

  const state = crypto.randomUUID()

  const cookieStore = await cookies()
  cookieStore.set("strava_oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  const params = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID,
    redirect_uri: `${env.NEXT_PUBLIC_APP_URL}${API_ROUTES.STRAVA_CALLBACK}`,
    response_type: "code",
    approval_prompt: "auto",
    scope: STRAVA_SCOPE,
    state,
  })

  return redirect(`${STRAVA_AUTH_URL}?${params.toString()}`)
}
