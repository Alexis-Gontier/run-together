import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUser } from "@/lib/auth/auth-session"
import { getRouteType } from "@/lib/utils/route"
import { ROUTES, AUTH_ROUTES } from "@/lib/constants/routes"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const user = await getUser()

  const routeType = getRouteType(pathname)

  if (routeType === "public") {
    return NextResponse.next()
  }

  if (routeType === "auth") {
    if (user) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }
    return NextResponse.next()
  }

  if (routeType === "onboarding") {
    if (!user) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url))
    }
    if (user.onboardingCompleted) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }
    return NextResponse.next()
  }

  if (routeType === "protected") {
    if (!user) {
      const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!user.onboardingCompleted) {
      return NextResponse.redirect(new URL(ROUTES.ONBOARDING, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
