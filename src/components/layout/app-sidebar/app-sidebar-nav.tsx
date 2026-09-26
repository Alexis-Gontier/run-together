"use client"

import { ChartLine, Home, Plus, Route, Trophy, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/shadcn-ui/badge"
import { Button } from "@/components/shadcn-ui/button"
import { profileRoute, ROUTE_LABELS, ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import { isNavItemNew } from "@/lib/utils/date"
import { isNavActive } from "@/lib/utils/route"

type NavItem = {
  label: string
  Icon: React.ComponentType<{ size?: number }>
  href: string
  newUntil?: Date
}

// « Progression » est mise en avant jusqu'à fin octobre : la page était invisible jusqu'ici.
const PROGRESS_NEW_UNTIL = new Date("2026-10-31")

/** Entrées de navigation, identiques en desktop et en mobile. Paramètres : menu utilisateur. */
function navItems(username?: string | null): NavItem[] {
  const items: NavItem[] = [
    { label: ROUTE_LABELS[ROUTES.HOME], Icon: Home, href: ROUTES.HOME },
    { label: ROUTE_LABELS[ROUTES.RUNS], Icon: Route, href: ROUTES.RUNS },
    {
      label: ROUTE_LABELS[ROUTES.PROGRESS],
      Icon: ChartLine,
      href: ROUTES.PROGRESS,
      newUntil: PROGRESS_NEW_UNTIL,
    },
    {
      label: ROUTE_LABELS[ROUTES.LEADERBOARD],
      Icon: Trophy,
      href: ROUTES.LEADERBOARD,
    },
  ]
  if (username)
    items.push({ label: "Profil", Icon: User, href: profileRoute(username) })
  return items
}

export function AppSidebarNav({ username }: { username?: string | null }) {
  const pathname = usePathname()

  return (
    <nav className="w-full space-y-px">
      {navItems(username).map(({ label, Icon, href, newUntil }) => {
        const isActive = isNavActive(pathname, href)
        const showNew = isNavItemNew(newUntil)
        return (
          <Button
            key={href}
            variant={isActive ? "secondary" : "ghost"}
            size="lg"
            className={cn(
              "w-full cursor-pointer justify-center lg:justify-start",
              !isActive && "text-muted-foreground",
            )}
            asChild
          >
            <Link href={href} aria-label={label}>
              <Icon size={20} />
              <span className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
                {label}
                {showNew && <Badge className="text-xs">Nouveau</Badge>}
              </span>
            </Link>
          </Button>
        )
      })}
      <Button
        size="lg"
        className="mt-3 w-full cursor-pointer justify-center lg:justify-start"
        asChild
      >
        <Link href={ROUTES.RUN_NEW} aria-label="Ajouter une course">
          <Plus size={20} />
          <span className="hidden lg:inline">Ajouter une course</span>
        </Link>
      </Button>
    </nav>
  )
}

// Pas de bouton flottant sur les écrans de saisie eux-mêmes.
function isRunFormPage(pathname: string) {
  return pathname === ROUTES.RUN_NEW || /^\/runs\/[^/]+\/edit$/.test(pathname)
}

export function MobileNav({ username }: { username?: string | null }) {
  const pathname = usePathname()

  return (
    <>
      {!isRunFormPage(pathname) && (
        <Link
          href={ROUTES.RUN_NEW}
          aria-label="Ajouter une course"
          className="fixed right-4 bottom-24 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
        >
          <Plus size={26} />
        </Link>
      )}
      <nav className="fixed right-0 bottom-0 left-0 z-50 flex border-border border-t bg-background md:hidden">
        {navItems(username).map(({ label, Icon, href, newUntil }) => {
          const isActive = isNavActive(pathname, href)
          const showNew = isNavItemNew(newUntil)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex flex-1 items-center justify-center py-5 transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <div className="relative">
                <Icon size={24} />
                {showNew && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
