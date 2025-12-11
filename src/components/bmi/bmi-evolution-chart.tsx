"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/shadcn-ui/empty"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/shadcn-ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { calculateBMI } from "@/lib/utils/bmi"
import { type bmi } from "@/generated/prisma/client"
import { ChartBar } from "lucide-react"

const chartConfig = {
  bmi: {
    label: "IMC",
    color: "oklch(62.3% 0.214 259.815)", // Orange/Ambre
  },
} satisfies ChartConfig

type ChartData = {
  date: string
  fullDate: string
  bmi: number
}

type BMIEvolutionChartProps = {
  metrics: bmi[]
}

export function BMIEvolutionChart({ metrics }: BMIEvolutionChartProps) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution de l&apos;IMC</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <ChartBar className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-muted-foreground">Aucune donnée</EmptyTitle>
              <EmptyDescription>
                Ajoutez des mesures pour voir l&apos;évolution de votre IMC
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  // Inverser l'ordre pour afficher de la plus ancienne à la plus récente
  const sortedMetrics = [...metrics].reverse()

  // Transformer les données pour le graphique
  const chartData: ChartData[] = sortedMetrics
    .map((metric) => {
      const bmi = calculateBMI(metric.weight, metric.height)
      if (bmi === null) return null

      return {
        date: format(new Date(metric.date), "dd MMM", { locale: fr }),
        fullDate: format(new Date(metric.date), "dd MMMM yyyy", { locale: fr }),
        bmi: parseFloat(bmi.toFixed(1)),
      }
    })
    .filter((data): data is ChartData => data !== null)

  // Calculer les stats
  const bmis = chartData.map((d) => d.bmi)
  const maxBMI = bmis.length > 0 ? Math.max(...bmis) : 30
  const minBMI = bmis.length > 0 ? Math.min(...bmis) : 15

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution de l&apos;IMC</CardTitle>
        <CardDescription>Indice de Masse Corporelle au fil du temps</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[Math.floor(minBMI - 2), Math.ceil(maxBMI + 2)]}
            />
            {/* Lignes de référence pour les catégories IMC */}
            <ReferenceLine y={18.5} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Sous-poids", position: "insideTopRight", fill: "#16a34a", fontSize: 10 }} />
            <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Poids Normal", position: "insideTopRight", fill: "#16a34a", fontSize: 10 }} />
            <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Surpoids", position: "insideTopRight", fill: "#d97706", fontSize: 10 }} />
            <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Obésité I", position: "insideTopRight", fill: "#dc2626", fontSize: 10 }} />
            <ReferenceLine y={40} stroke="#dc2626" strokeDasharray="3 3" label={{ value: "Obésité II", position: "insideTopRight", fill: "#b91c1c", fontSize: 10 }} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="fullDate"
                  indicator="line"
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="bmi"
              stroke="var(--color-bmi)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-bmi)",
                r: 5,
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
