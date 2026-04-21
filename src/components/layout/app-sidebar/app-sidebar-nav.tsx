"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Route,
  TrendingUp,
  Trophy,
  Award,
  GitCompare,
  Settings,
} from "lucide-react"

import { Button } from "@/components/shadcn-ui/button"
import { cn } from "@/lib/utils/cn"
import { ROUTES } from "@/lib/constants/routes"

const NAV_ITEMS = [
  { label: "Accueil", Icon: Home, href: ROUTES.HOME, mobile: true },
  { label: "Mes courses", Icon: Route, href: ROUTES.RUNS, mobile: true },
  {
    label: "Progression",
    Icon: TrendingUp,
    href: ROUTES.PROGRESS,
    mobile: true,
  },
  { label: "Classement", Icon: Trophy, href: ROUTES.LEADERBOARD, mobile: true },
  { label: "Badges", Icon: Award, href: ROUTES.BADGES, mobile: true },
  { label: "Comparer", Icon: GitCompare, href: ROUTES.COMPARE, mobile: false },
  { label: "Paramètres", Icon: Settings, href: ROUTES.SETTINGS, mobile: false },
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

export function MobileNav() {
  const pathname = usePathname()

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
    </nav>
  )
}
