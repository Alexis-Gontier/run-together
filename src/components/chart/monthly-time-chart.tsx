import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { Timer } from "lucide-react"

export default function MonthlyTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Timer size={24} />
          Temps Passé par Mois
        </CardTitle>
        <CardDescription>
          Un graphique montrant le temps passé chaque mois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        
      </CardContent>
    </Card>
  )
}
