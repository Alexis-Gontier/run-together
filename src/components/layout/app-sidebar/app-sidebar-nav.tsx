"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Route, Trophy, Settings, User } from "lucide-react"

import { Badge } from "@/components/shadcn-ui/badge"
import { Button } from "@/components/shadcn-ui/button"
import { cn } from "@/lib/utils/cn"
import { ROUTE_LABELS, ROUTES } from "@/lib/constants/routes"
import { isNavActive } from "@/lib/utils/route"
import { isNavItemNew } from "@/lib/utils/date"

type NavItem = {
  label: string
  Icon: React.ComponentType<{ size?: number }>
  href: string
  mobile: boolean
  newUntil?: Date
}

const NAV_ITEMS: NavItem[] = [
  {
    label: ROUTE_LABELS[ROUTES.HOME],
    Icon: Home,
    href: ROUTES.HOME,
    mobile: true,
  },
  {
    label: ROUTE_LABELS[ROUTES.RUNS],
    Icon: Route,
    href: ROUTES.RUNS,
    mobile: true,
  },
  {
    label: ROUTE_LABELS[ROUTES.LEADERBOARD],
    Icon: Trophy,
    href: ROUTES.LEADERBOARD,
    mobile: true,
  },
  {
    label: ROUTE_LABELS[ROUTES.SETTINGS],
    Icon: Settings,
    href: ROUTES.SETTINGS,
    mobile: true,
  },
]

export function AppSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="w-full space-y-px">
      {NAV_ITEMS.map(({ label, Icon, href, newUntil }) => {
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
            <Link href={href}>
              <Icon size={20} />
              <span className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
                {label}
                {showNew && <Badge className="text-xs">Nouveau</Badge>}
              </span>
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

export function MobileNav({ username }: { username?: string | null }) {
  const pathname = usePathname()
  const profileHref = username ? `/profile/${username}` : null

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex border-t border-border bg-background md:hidden">
      {NAV_ITEMS.filter((item) => item.mobile).map(
        ({ Icon, href, newUntil }) => {
          const isActive = isNavActive(pathname, href)
          const showNew = isNavItemNew(newUntil)
          return (
            <Link
              key={href}
              href={href}
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
        },
      )}
      {profileHref && (
        <Link
          href={profileHref}
          className={cn(
            "flex flex-1 items-center justify-center py-5 transition-colors",
            pathname.startsWith("/profile/")
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <User size={24} />
        </Link>
      )}
    </nav>
  )
}
