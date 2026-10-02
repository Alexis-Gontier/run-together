import { AppRightPanel } from "@/components/layout/app-right-panel"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileNav } from "@/components/layout/app-sidebar/app-sidebar-nav"
import { PageHeader } from "@/components/layout/page-header"
import { AnnouncementDialog } from "@/components/ui/announcement-dialog"
import { ImpersonationBanner } from "@/components/ui/impersonation-banner"
import { getSession } from "@/lib/auth/auth-session"
import { profileRoute } from "@/lib/constants/routes"
import { profileImagesEnabled } from "@/lib/profile-images/store"

type AppLayoutProps = {
  children: React.ReactNode
  rightPanel: React.ReactNode
}

export default async function AppLayout({
  children,
  rightPanel,
}: AppLayoutProps) {
  const session = await getSession()
  const isImpersonating = !!session?.session?.impersonatedBy
  const user = session?.user
  // Nouveauté : seulement pour ceux qui n'ont encore ni photo ni bannière.
  const announceProfileImages =
    !!user?.username &&
    !isImpersonating &&
    profileImagesEnabled() &&
    !user.image &&
    !user.bannerImage

  return (
    <>
      {isImpersonating && (
        <ImpersonationBanner
          username={session!.user.username ?? session!.user.name}
        />
      )}
      <div className="flex min-h-screen justify-center">
        <AppSidebar />
        <main className="min-w-0 flex-1 border-border border-x pb-16 md:max-w-2xl md:pb-0">
          <PageHeader />
          {children}
        </main>
        <AppRightPanel>{rightPanel}</AppRightPanel>
        <MobileNav username={session?.user.username} />
      </div>
      {announceProfileImages && user?.username && (
        <AnnouncementDialog
          id="profile-images-v1"
          title="Nouveau : photo de profil et bannière"
          description="Tu peux maintenant ajouter une photo de profil et une bannière, visibles par tout le groupe. Rendez-vous sur ton profil, bouton appareil photo."
          actionLabel="Personnaliser mon profil"
          actionHref={profileRoute(user.username)}
        />
      )}
    </>
  )
}
