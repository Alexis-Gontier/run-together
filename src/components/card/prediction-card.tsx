import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { Progress } from "@/components/shadcn-ui/progress"
import { Target } from "lucide-react"

export function PredictionCard() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
                <Target />
                Prediction
            </CardTitle>
            <CardDescription>
                Basée sur vos performances actuelles et votre progression
            </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
            <div className="bg-accent rounded p-4 text-center">
                <p>Temps prédit</p>
                <p className="text-2xl font-bold">53:30</p>
            </div>
            <div className="bg-accent rounded p-4 text-center">
                <p>Objectif</p>
                <p className="text-2xl font-bold">55:00</p>
            </div>
            <div className="bg-accent rounded p-4 text-center">
                <p>À améliorer</p>
                <p className="text-2xl font-bold">1:30</p>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
            <div className="w-full flex justify-between">
                <p>Confiance de la prédiction</p>
                <p>85%</p>
            </div>
            <div className="w-full">
                <Progress value={85} />
            </div>
        </CardFooter>
    </Card>
  )
}
