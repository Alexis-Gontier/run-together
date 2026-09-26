import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { DeleteAccountDialog } from "./delete-account-dialog"

export function DangerZoneCard() {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base text-destructive">
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          Ces actions sont irréversibles. Procédez avec prudence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="space-y-0.5">
            <p className="font-medium text-sm">Supprimer mon compte</p>
            <p className="text-muted-foreground text-xs">
              Supprime définitivement votre compte et toutes vos données.
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </CardContent>
    </Card>
  )
}
