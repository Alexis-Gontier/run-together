import { ROUTES, AUTH_ROUTES } from "@/lib/constants/routes"

type RouteType = "public" | "auth" | "onboarding" | "protected"

const publicRoutes: string[] = [ROUTES.LANDING]
const authRoutes: string[] = [AUTH_ROUTES.LOGIN, AUTH_ROUTES.REGISTER]
const onboardingRoutes: string[] = [ROUTES.ONBOARDING]

export function getRouteType(pathname: string): RouteType {
  if (publicRoutes.includes(pathname)) return "public"
  if (authRoutes.includes(pathname)) return "auth"
  if (onboardingRoutes.includes(pathname)) return "onboarding"
  return "protected"
}
