"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Route, Trophy, Settings, User } from "lucide-react"

import { Button } from "@/components/shadcn-ui/button"
import { cn } from "@/lib/utils/cn"
import { ROUTES } from "@/lib/constants/routes"

const NAV_ITEMS = [
  { label: "Accueil", Icon: Home, href: ROUTES.HOME, mobile: true },
  { label: "Mes courses", Icon: Route, href: ROUTES.RUNS, mobile: true },
  { label: "Classement", Icon: Trophy, href: ROUTES.LEADERBOARD, mobile: true },
  { label: "Paramètres", Icon: Settings, href: ROUTES.SETTINGS, mobile: true },
] as const

export function AppSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="w-full space-y-px">
      {NAV_ITEMS.map(({ label, Icon, href }) => {
        const isActive =
          pathname === href ||
          (href !== ROUTES.HOME && pathname.startsWith(href))
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
              <span className="hidden lg:inline">{label}</span>
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
      {NAV_ITEMS.filter((item) => item.mobile).map(({ Icon, href }) => {
        const isActive =
          pathname === href ||
          (href !== ROUTES.HOME && pathname.startsWith(href))
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
            <Icon size={24} />
          </Link>
        )
      })}
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
