"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shadcn-ui/chart"
import { formatRunPace } from "@/lib/utils/run"

const weekLabel = (iso: string) =>
  format(parseISO(iso), "d MMM", { locale: fr })

const volumeConfig = {
  distanceKm: { label: "Distance", color: "var(--chart-1)" },
  trendKm: { label: "Moyenne 4 sem.", color: "var(--chart-2)" },
} satisfies ChartConfig

export function WeeklyVolumeChart({
  data,
}: {
  data: { weekStart: string; distanceKm: number; trendKm: number | null }[]
}) {
  return (
    <ChartContainer config={volumeConfig} className="h-56 w-full">
      <ComposedChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="weekStart"
          tickFormatter={weekLabel}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) => `Semaine du ${weekLabel(String(v))}`}
              formatter={(value, name) => (
                <span className="tabular-nums">
                  {volumeConfig[name as keyof typeof volumeConfig]?.label} :{" "}
                  {String(value).replace(".", ",")} km
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="distanceKm"
          fill="var(--color-distanceKm)"
          radius={[4, 4, 0, 0]}
        />
        <Line
          dataKey="trendKm"
          stroke="var(--color-trendKm)"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </ComposedChart>
    </ChartContainer>
  )
}

const paceConfig = {
  paceSecPerKm: { label: "Allure", color: "var(--chart-1)" },
} satisfies ChartConfig

export function PaceChart({
  data,
}: {
  data: { date: string; paceSecPerKm: number; distanceKm: number }[]
}) {
  const paces = data.map((d) => d.paceSecPerKm)
  // Axe resserré sur les données (± 15 s) : sinon la courbe est écrasée.
  const domain = [Math.min(...paces) - 15, Math.max(...paces) + 15]

  return (
    <ChartContainer config={paceConfig} className="h-56 w-full">
      <LineChart data={data} margin={{ left: -4, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={weekLabel}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          reversed
          domain={domain}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatRunPace(Math.round(v))}
          width={48}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) =>
                format(parseISO(String(v)), "EEEE d MMMM", { locale: fr })
              }
              formatter={(value, _name, item) => (
                <span className="tabular-nums">
                  {formatRunPace(Number(value))} /km ·{" "}
                  {String(item.payload.distanceKm).replace(".", ",")} km
                </span>
              )}
            />
          }
        />
        <Line
          dataKey="paceSecPerKm"
          stroke="var(--color-paceSecPerKm)"
          strokeWidth={2}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

const elevationConfig = {
  elevationM: { label: "Dénivelé", color: "var(--chart-3)" },
} satisfies ChartConfig

export function WeeklyElevationChart({
  data,
}: {
  data: { weekStart: string; elevationM: number }[]
}) {
  return (
    <ChartContainer config={elevationConfig} className="h-44 w-full">
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="weekStart"
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
              formatter={(value) => (
                <span className="tabular-nums">+{String(value)} m</span>
              )}
            />
          }
        />
        <Bar
          dataKey="elevationM"
          fill="var(--color-elevationM)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
