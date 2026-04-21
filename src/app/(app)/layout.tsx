import { env } from "@/env"
import { CenteredLayout } from "@/components/layout/centered-layout"
import { Countdown } from "@/components/ui/countdown"

import { AppRightPanel } from "@/components/layout/app-right-panel"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileNav } from "@/components/layout/app-sidebar/app-sidebar-nav"

type AppLayoutProps = {
  children: React.ReactNode
  rightPanel: React.ReactNode
}

export default function AppLayout({ children, rightPanel }: AppLayoutProps) {
  const IS_PROD = process.env.NODE_ENV === "production"

  if (IS_PROD) {
    return (
      <CenteredLayout>
        <Countdown target="2026-04-26T10:00:00Z" />
      </CenteredLayout>
    )
  }

  return (
    <div className="flex min-h-screen justify-center">
      <AppSidebar />
      <main className="min-w-0 flex-1 border-x border-border pb-16 md:max-w-xl md:pb-0">
        {children}
      </main>
      <AppRightPanel>{rightPanel}</AppRightPanel>
      <MobileNav />
    </div>
  )
}
