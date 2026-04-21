import { AppLogo } from "./app-logo"
import { AppSidebarNav } from "./app-sidebar-nav"
import { UserNav } from "./user-nav"

const MOCK_USER = {
  name: "Alexis Gontier",
  username: "algont",
  email: "alexis.gontier03@gmail.com",
  image: null,
}

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col justify-between p-2 md:flex lg:w-64 lg:p-4">
      <div className="space-y-4">
        <AppLogo />
        <AppSidebarNav />
      </div>
      <div className="space-y-4">
        <UserNav {...MOCK_USER} />
      </div>
    </aside>
  )
}
