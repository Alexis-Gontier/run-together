"use client"

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
import { api } from "@/services/api"
import { useEffect, useState } from "react"

type ProgressData = {
  estimatedTime: string
  objective: string
  improve: string
  confidence: number
}

export function PredictionCard() {
  const [data, setData] = useState<ProgressData | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api("/prediction")
        setData(res as ProgressData)
      } catch (err) {
        console.error("Erreur fetch /prediction :", err)
      }
    }
    fetchData()
  }, [])

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
          <p className="text-2xl font-bold">
            {data ? data.estimatedTime : "--:--"}
          </p>
        </div>
        <div className="bg-accent rounded p-4 text-center">
          <p>Objectif</p>
          <p className="text-2xl font-bold">
            {data ? data.objective : "--:--"}
          </p>
        </div>
        <div className="bg-accent rounded p-4 text-center">
          <p>À améliorer</p>
          <p className="text-2xl font-bold">
            {data ? data.improve : "--:--"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <div className="w-full flex justify-between">
          <p>Confiance de la prédiction</p>
          <p>{data ? `${data.confidence}%` : "--"}</p>
        </div>
        <div className="w-full">
          <Progress value={data ? data.confidence : 0} />
        </div>
      </CardFooter>
    </Card>
  )
}
