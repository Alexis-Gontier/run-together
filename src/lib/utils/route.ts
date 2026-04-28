import { ROUTES, AUTH_ROUTES, ADMIN_ROUTES } from "@/lib/constants/routes"

export function isNavActive(pathname: string, href: string): boolean {
  return (
    pathname === href || (href !== ROUTES.HOME && pathname.startsWith(href))
  )
}

type RouteType = "public" | "auth" | "onboarding" | "admin" | "protected"

const publicRoutes: string[] = [ROUTES.LANDING]
const authRoutes: string[] = [AUTH_ROUTES.LOGIN, AUTH_ROUTES.REGISTER]
const onboardingRoutes: string[] = [ROUTES.ONBOARDING]
const adminRoutes: string[] = Object.values(ADMIN_ROUTES)

export function getRouteType(pathname: string): RouteType {
  if (publicRoutes.includes(pathname)) return "public"
  if (authRoutes.includes(pathname)) return "auth"
  if (onboardingRoutes.includes(pathname)) return "onboarding"
  if (
    adminRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  )
    return "admin"
  return "protected"
}
