"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
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

function isRunDetailPage(pathname: string): boolean {
  return /^\/runs\/[^/]+$/.test(pathname)
}

export function PageHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getTitle(pathname)
  const showBack = isRunDetailPage(pathname)

  if (!title) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 size-8 shrink-0 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
    </header>
  )
}
