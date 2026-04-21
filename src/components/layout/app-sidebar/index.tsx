import Link from "next/link"
import { Route } from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import { AppSidebarNav } from "./app-sidebar-nav"
import { UserNav } from "./user-nav"

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col justify-between p-2 md:flex lg:w-64 lg:p-4">
      <div className="space-y-4">
        <Link
          href={ROUTES.HOME}
          className="inline-flex w-full items-center space-x-2 px-3"
        >
          <Route className="shrink-0" />
          <span className="hidden text-xl font-bold tracking-tight lg:inline">
            RunTogether
          </span>
        </Link>
        <AppSidebarNav />
      </div>
      <div className="space-y-4">
        <UserNav />
      </div>
    </aside>
  )
}
