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
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { type bmi } from "@/generated/prisma/client"
import { ChartBar } from "lucide-react"

const chartConfig = {
  height: {
    label: "Taille (cm)",
    color: "oklch(72.3% 0.219 149.579)",
  },
} satisfies ChartConfig

type ChartData = {
  date: string
  fullDate: string
  height: number | null
}

type HeightEvolutionChartProps = {
  metrics: bmi[]
}

export function HeightEvolutionChart({ metrics }: HeightEvolutionChartProps) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la taille</CardTitle>
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
                Ajoutez des mesures pour voir l&apos;évolution de votre taille
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
  const chartData: ChartData[] = sortedMetrics.map((metric) => ({
    date: format(new Date(metric.date), "dd MMM", { locale: fr }),
    fullDate: format(new Date(metric.date), "dd MMMM yyyy", { locale: fr }),
    height: metric.height,
  }))

  // Calculer les stats
  const heights = chartData.map((d) => d.height).filter((h): h is number => h !== null)
  const maxHeight = heights.length > 0 ? Math.max(...heights) : 200
  const minHeight = heights.length > 0 ? Math.min(...heights) : 150

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution de la taille</CardTitle>
        <CardDescription>Taille en centimètres au fil du temps</CardDescription>
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
              domain={[Math.floor(minHeight - 5), Math.ceil(maxHeight + 5)]}
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
              dataKey="height"
              stroke="var(--color-height)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-height)",
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
