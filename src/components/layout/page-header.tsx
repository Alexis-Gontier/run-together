"use client"

import { usePathname } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: "Accueil",
  [ROUTES.RUNS]: "Mes courses",
  [ROUTES.PROGRESS]: "Progression",
  [ROUTES.LEADERBOARD]: "Classement",
  [ROUTES.SETTINGS]: "Paramètres",
}

function getTitle(pathname: string): string {
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (
      pathname === route ||
      (route !== ROUTES.HOME && pathname.startsWith(route))
    ) {
      return title
    }
  }
  return ""
}

export function PageHeader() {
  const pathname = usePathname()
  const title = getTitle(pathname)

  if (!title) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  )
}
