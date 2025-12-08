import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuButton,
} from "@/components/shadcn-ui/sidebar"
import Link from "next/link"
import { LogoutButton } from "@/components/auth/logout-button"


export async function AppSidebar() {


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-sidebar-border border-b p-0 flex items-center justify-center">
        <Link href="/" className="w-full h-full px-6 flex items-center justify-start gap-2 font-semibold text-xl">
          RunTogether
        </Link>
      </SidebarHeader>
      <SidebarContent>

      </SidebarContent>
      <SidebarFooter className="min-h-16 border-sidebar-border border-t p-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  )
}