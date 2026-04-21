import { ROUTES, AUTH_ROUTES } from "@/lib/constants/routes"

type RouteType = "public" | "auth" | "protected"

const publicRoutes: string[] = [ROUTES.LANDING]
const authRoutes: string[] = [AUTH_ROUTES.LOGIN, AUTH_ROUTES.REGISTER]

export function getRouteType(pathname: string): RouteType {
  if (publicRoutes.includes(pathname)) return "public"
  if (authRoutes.includes(pathname)) return "auth"
  return "protected"
}
