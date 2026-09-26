import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import { getRequiredAdmin } from "@/lib/auth/auth-session"
import { ADMIN_ROUTES, ROUTES } from "@/lib/constants/routes"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getRequiredAdmin()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-sm tracking-tight">
              Administration
            </span>
            <nav className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href={ADMIN_ROUTES.USERS}>Utilisateurs</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href={ADMIN_ROUTES.DISCORD}>Discord</Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{user.name}</span>
            <Button asChild variant="ghost" size="sm">
              <Link href={ROUTES.HOME}>← App</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
