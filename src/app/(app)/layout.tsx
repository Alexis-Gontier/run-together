import { env } from "@/env"
import { CenteredLayout } from "@/components/layout/centered-layout"
import { Countdown } from "@/components/ui/countdown"
import { ImpersonationBanner } from "@/components/ui/impersonation-banner"
import { AppRightPanel } from "@/components/layout/app-right-panel"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileNav } from "@/components/layout/app-sidebar/app-sidebar-nav"
import { PageHeader } from "@/components/layout/page-header"
import { getSession } from "@/lib/auth/auth-session"

type AppLayoutProps = {
  children: React.ReactNode
  rightPanel: React.ReactNode
}

export default async function AppLayout({
  children,
  rightPanel,
}: AppLayoutProps) {
  const IS_PROD = env.NODE_ENV === "production" && !env.BYPASS_COUNTDOWN
  const session = await getSession()
  const isImpersonating = !!session?.session?.impersonatedBy

  if (IS_PROD) {
    return (
      <>
        {isImpersonating && (
          <ImpersonationBanner
            username={session!.user.username ?? session!.user.name}
          />
        )}
        <CenteredLayout>
          <Countdown target="2026-04-27T10:00:00Z" />
        </CenteredLayout>
      </>
    )
  }

  return (
    <>
      {isImpersonating && (
        <ImpersonationBanner
          username={session!.user.username ?? session!.user.name}
        />
      )}
      <div className="flex min-h-screen justify-center">
        <AppSidebar />
        <main className="min-w-0 flex-1 border-x border-border pb-16 md:max-w-2xl md:pb-0">
          <PageHeader />
          {children}
        </main>
        <AppRightPanel>{rightPanel}</AppRightPanel>
        <MobileNav />
      </div>
    </>
  )
}
