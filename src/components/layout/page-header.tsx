"use client"

import { ArrowLeft } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/shadcn-ui/button"
import { ROUTE_LABELS, ROUTES } from "@/lib/constants/routes"

function getTitle(pathname: string): string {
  if (pathname === ROUTES.RUN_NEW) return "Ajouter une course"
  if (/^\/runs\/[^/]+\/edit$/.test(pathname)) return "Modifier la course"
  if (/^\/runs\/[^/]+$/.test(pathname)) return "Course"
  for (const [route, title] of Object.entries(ROUTE_LABELS)) {
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
  // Détail, création (/runs/new) et édition d'une course : flèche retour
  return /^\/runs\/[^/]+(\/edit)?$/.test(pathname)
}

export function PageHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getTitle(pathname)
  const showBack = isRunDetailPage(pathname)

  if (!title) return null

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
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
        <h1 className="font-semibold text-base">{title}</h1>
      </div>
    </header>
  )
}
