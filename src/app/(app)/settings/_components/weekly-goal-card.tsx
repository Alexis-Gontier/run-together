import { Badge } from "@/components/shadcn-ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"

export function WeeklyGoalCard() {
  return (
    <Card className="opacity-60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Objectif hebdomadaire</CardTitle>
            <CardDescription>
              Définissez un objectif de distance ou de courses par semaine.
            </CardDescription>
          </div>
          <Badge variant="secondary">Bientôt disponible</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Cette fonctionnalité sera disponible prochainement.
        </p>
      </CardContent>
    </Card>
  )
}
