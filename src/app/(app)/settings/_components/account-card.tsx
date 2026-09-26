import { Download, KeyRound, LogOut } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { API_ROUTES } from "@/lib/constants/routes"
import { ChangePasswordDialog } from "./change-password-dialog"
import { SignOutButton } from "./sign-out-button"

function AccountRow({
  icon: Icon,
  label,
  description,
  action,
}: {
  icon: React.ElementType
  label: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon size={15} />
        </div>
        <div className="space-y-0.5">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

export function AccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Compte</CardTitle>
        <CardDescription>
          Gérez la sécurité et la session de votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <AccountRow
          icon={KeyRound}
          label="Mot de passe"
          description="Modifiez votre mot de passe de connexion."
          action={<ChangePasswordDialog />}
        />
        <AccountRow
          icon={Download}
          label="Exporter mes données"
          description="Téléchargez vos courses, splits et records (JSON)."
          action={
            <Button variant="outline" size="sm" asChild>
              <a href={API_ROUTES.EXPORT} download>
                Exporter
              </a>
            </Button>
          }
        />
        <AccountRow
          icon={LogOut}
          label="Se déconnecter"
          description="Mettre fin à votre session en cours."
          action={<SignOutButton />}
        />
      </CardContent>
    </Card>
  )
}
