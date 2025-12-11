import {
  Home,
  Calendar,
  Users,
  TrendingUp,
  User,
  Apple,
  Route,
  Target
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string | number
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const DASHBOARD_NAV_ITEMS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ]
  },
  {
    title: "Activities",
    items: [
      {
        title: "Runs",
        href: "/dashboard/runs",
        icon: Route,
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: User,
      },
      {
        title: "Comparison",
        href: "/dashboard/comparison",
        icon: Users,
      },
      {
        title: "Progress",
        href: "/dashboard/progress",
        icon: TrendingUp,
      }
    ]
  },
  {
    title: "Health",
    items: [
      {
        title: "BMI",
        href: "/dashboard/bmi",
        icon: Calendar,
      },
      {
        title: "Caloric Needs",
        href: "/dashboard/caloric-needs",
        icon: Apple,
      }
    ]
  },
  {
    title: "Other",
    items: [
      {
        title: "Challenges",
        href: "/dashboard/challenges",
        icon: Target,
      },
    ]
  },
]

export const ROUTES = {
  public: [
    "/"
  ],
  auth: [
    "/signin",
    "/signup"
  ],
  protected: [
    "/dashboard",
    "/dashboard/runs",
  ],
} as const;

export type RouteType = 'public' | 'auth' | 'protected';