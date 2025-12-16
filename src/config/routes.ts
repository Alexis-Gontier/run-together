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
        title: "Tableau de bord",
        href: "/dashboard",
        icon: Home,
      },
    ]
  },
  {
    title: "Activités",
    items: [
      {
        title: "Courses",
        href: "/dashboard/runs",
        icon: Route,
      },
      // {
      //   title: "Profile",
      //   href: "/dashboard/profile",
      //   icon: User,
      // },
      {
        title: "Comparaison",
        href: "/dashboard/comparison",
        icon: Users,
      },
      // {
      //   title: "Progress",
      //   href: "/dashboard/progress",
      //   icon: TrendingUp,
      // }
    ]
  },
  {
    title: "Santé",
    items: [
      {
        title: "IMC",
        href: "/dashboard/bmi",
        icon: Calendar,
      },
      // {
      //   title: "Caloric Needs",
      //   href: "/dashboard/caloric-needs",
      //   icon: Apple,
      // }
    ]
  },
  {
    title: "Autre",
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
    "/signup",
    "/forgot-password",
    "/reset-password"
  ],
  protected: [
    "/dashboard",
  ],
} as const;

export type RouteType = 'public' | 'auth' | 'protected';