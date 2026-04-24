import { getUser } from "@/lib/auth/auth-session"

import { AppLogo } from "./app-logo"
import { AppSidebarNav } from "./app-sidebar-nav"
import { UserNav } from "./user-nav"

export async function AppSidebar() {
  const user = await getUser()

  return (
    <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col justify-between p-2 md:flex lg:w-64 lg:p-4">
      <div className="space-y-4">
        <AppLogo />
        <AppSidebarNav />
      </div>
      <div className="space-y-4">
        <UserNav
          name={user?.name}
          username={user?.username}
          email={user?.email}
          image={user?.image}
        />
      </div>
    </aside>
  )
}
