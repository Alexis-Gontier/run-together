"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/shadcn-ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { type bmi } from "@/generated/prisma/client"

const chartConfig = {
  weight: {
    label: "Poids (kg)",
    color: "oklch(79.5% 0.184 86.047)",
  },
} satisfies ChartConfig

type ChartData = {
  date: string
  fullDate: string
  weight: number | null
}

type WeightEvolutionChartClientProps = {
  metrics: bmi[]
}

export default function WeightEvolutionChartClient({ metrics }: WeightEvolutionChartClientProps) {
  // Inverser l'ordre pour afficher de la plus ancienne à la plus récente
  const sortedMetrics = [...metrics].reverse()

  // Transformer les données pour le graphique
  const chartData: ChartData[] = sortedMetrics.map((metric) => ({
    date: format(new Date(metric.date), "dd MMM", { locale: fr }),
    fullDate: format(new Date(metric.date), "dd MMMM yyyy", { locale: fr }),
    weight: metric.weight,
  }))

  // Calculer les stats
  const weights = chartData.map((d) => d.weight).filter((w): w is number => w !== null)
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 100
  const minWeight = weights.length > 0 ? Math.min(...weights) : 50

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution du poids</CardTitle>
        <CardDescription>Poids en kilogrammes au fil du temps</CardDescription>
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
              domain={[Math.floor(minWeight - 5), Math.ceil(maxWeight + 5)]}
            />
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
              dataKey="weight"
              stroke="var(--color-weight)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-weight)",
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
