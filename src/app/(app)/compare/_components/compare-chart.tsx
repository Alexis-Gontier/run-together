"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shadcn-ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs"

const weekLabel = (iso: string) =>
  format(parseISO(iso), "d MMM", { locale: fr })

type Mode = "weekly" | "cumulative"

/** Kilomètres par semaine, ou cumulés depuis le début de la période (la course au volume). */
export function CompareChart({
  data,
  meName,
  otherName,
}: {
  data: { week: string; me: number; other: number }[]
  meName: string
  otherName: string
}) {
  const [mode, setMode] = useState<Mode>("weekly")
  const config = {
    me: { label: meName, color: "#10b981" },
    other: { label: otherName, color: "#f59e0b" },
  } satisfies ChartConfig

  let me = 0
  let other = 0
  const cumulative = data.map((w) => {
    me += w.me
    other += w.other
    return {
      week: w.week,
      me: Math.round(me * 10) / 10,
      other: Math.round(other * 10) / 10,
    }
  })

  const axes = (
    <>
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
    </>
  )

  return (
    <div className="space-y-3">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList>
          <TabsTrigger value="weekly" className="cursor-pointer">
            Par semaine
          </TabsTrigger>
          <TabsTrigger value="cumulative" className="cursor-pointer">
            Cumul
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <ChartContainer config={config} className="h-60 w-full">
        {mode === "weekly" ? (
          <BarChart data={data} margin={{ left: -16, right: 8 }}>
            {axes}
            <Bar dataKey="me" fill="var(--color-me)" radius={[3, 3, 0, 0]} />
            <Bar
              dataKey="other"
              fill="var(--color-other)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart data={cumulative} margin={{ left: -16, right: 8 }}>
            {axes}
            <Line
              dataKey="me"
              stroke="var(--color-me)"
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
            <Line
              dataKey="other"
              stroke="var(--color-other)"
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          </LineChart>
        )}
      </ChartContainer>
    </div>
  )
}
