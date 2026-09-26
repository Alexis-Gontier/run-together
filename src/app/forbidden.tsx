import Link from "next/link"
import { CenteredLayout } from "@/components/layout/centered-layout"
import { Button } from "@/components/shadcn-ui/button"
import { ROUTES } from "@/lib/constants/routes"

export default function Forbidden() {
  return (
    <CenteredLayout>
      <div className="space-y-4 text-center">
        <p className="font-bold text-6xl text-muted-foreground">403</p>
        <p className="font-semibold text-xl">Accès interdit</p>
        <p className="text-muted-foreground text-sm">
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
