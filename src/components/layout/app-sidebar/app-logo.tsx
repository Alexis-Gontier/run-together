import Link from "next/link"
import { Route } from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"

export function AppLogo() {
  return (
    <Link
      href={ROUTES.HOME}
      className="inline-flex w-full items-center space-x-2 px-3"
    >
      <Route className="shrink-0" />
      <span className="hidden text-xl font-bold tracking-tight lg:inline">
        RunTogether
      </span>
    </Link>
  )
}
