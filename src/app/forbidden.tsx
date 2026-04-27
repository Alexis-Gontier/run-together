import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import { CenteredLayout } from "@/components/layout/centered-layout"
import { ROUTES } from "@/lib/constants/routes"

export default function Forbidden() {
  return (
    <CenteredLayout>
      <div className="space-y-4 text-center">
        <p className="text-6xl font-bold text-muted-foreground">403</p>
        <p className="text-xl font-semibold">Accès interdit</p>
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette
          page.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.HOME}>Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </CenteredLayout>
  )
}
