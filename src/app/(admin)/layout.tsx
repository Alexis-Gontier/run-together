import Link from "next/link"
import { getRequiredAdmin } from "@/lib/auth/auth-session"
import { ROUTES } from "@/lib/constants/routes"
import { Button } from "@/components/shadcn-ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getRequiredAdmin()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight">
            Administration
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.name}</span>
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
