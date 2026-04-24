import { Download, KeyRound, LogOut, Mail } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import { ChangePasswordDialog } from "./change-password-dialog"
import { SignOutButton } from "./sign-out-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"

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
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
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
          icon={Mail}
          label="Adresse e-mail"
          description="Modifiez votre adresse e-mail."
          action={
            <Button variant="outline" size="sm" disabled>
              Modifier
            </Button>
          }
        />
        <AccountRow
          icon={KeyRound}
          label="Mot de passe"
          description="Modifiez votre mot de passe de connexion."
          action={<ChangePasswordDialog />}
        />
        <AccountRow
          icon={Download}
          label="Exporter mes données"
          description="Téléchargez une copie de toutes vos données."
          action={
            <Button variant="outline" size="sm" disabled>
              Exporter
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
