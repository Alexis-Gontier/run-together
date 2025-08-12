import { Button } from "@/components/shadcn-ui/button";
import {
    SidebarTrigger,
} from "@/components/shadcn-ui/sidebar"

export default function DashboardHeader() {
  return (
    <header className="sticky z-50 top-0 left-0 h-16 w-full bg-sidebar flex shrink-0 justify-between items-center gap-2 border-b px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer md:hidden"
          asChild
        >
          <SidebarTrigger />
        </Button>
      </div>
    </header>
  )
}