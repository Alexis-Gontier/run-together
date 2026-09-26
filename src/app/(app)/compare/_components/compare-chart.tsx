"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shadcn-ui/chart"

const weekLabel = (iso: string) =>
  format(parseISO(iso), "d MMM", { locale: fr })

export function CompareChart({
  data,
  meName,
  otherName,
}: {
  data: { week: string; me: number; other: number }[]
  meName: string
  otherName: string
}) {
  const config = {
    me: { label: meName, color: "#10b981" },
    other: { label: otherName, color: "#f59e0b" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className="h-60 w-full">
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="week"
          tickFormatter={weekLabel}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tick={{ fontSize: 11 }}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) => `Semaine du ${weekLabel(String(v))}`}
              formatter={(value, name) => (
                <span className="tabular-nums">
                  {config[name as keyof typeof config]?.label} :{" "}
                  {String(value).replace(".", ",")} km
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="me" fill="var(--color-me)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="other" fill="var(--color-other)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
