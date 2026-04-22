import { Button } from "@/components/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"

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
            <p className="text-sm font-medium">Supprimer mon compte</p>
            <p className="text-xs text-muted-foreground">
              Supprime définitivement votre compte et toutes vos données.
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled>
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
