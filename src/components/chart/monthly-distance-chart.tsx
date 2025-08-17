import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { TrendingUp } from "lucide-react"

export default function MonthlyDistanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={24} />
          Distance Parcourue par Mois
        </CardTitle>
        <CardDescription>
          Un graphique montrant la distance parcourue chaque mois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        
      </CardContent>
    </Card>
  )
}
