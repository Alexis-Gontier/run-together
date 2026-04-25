"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcn-ui/chart"
import type { Split } from "@/generated/prisma/client"
import { formatRunPace } from "@/lib/utils/run"

const chartConfig = {
  altitude: {
    label: "Altitude",
    color: "#f59e0b",
  },
  pace: {
    label: "Allure",
    color: "#ec4899",
  },
} satisfies ChartConfig

export function RunProfileChart({ splits }: { splits: Split[] }) {
  const hasElevation = splits.some((s) => s.elevation != null)

  const data = splits.reduce<
    { km: string; altitude: number; pace: number | null }[]
  >((acc, s) => {
    const prev = acc[acc.length - 1]?.altitude ?? 0
    acc.push({
      km: `${s.kilometer}km`,
      altitude: Math.round(prev + (s.elevation ?? 0)),
      pace: s.pace,
    })
    return acc
  }, [])

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-start justify-between px-4 py-3">
        <div>
          <p className="font-semibold">Profil de la course</p>
          <p className="text-xs text-muted-foreground">
            Dénivelé et allure par km
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {hasElevation && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
              Altitude
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full bg-pink-500" />
            Allure
          </span>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-52 w-full">
        <ComposedChart
          data={data}
          accessibilityLayer
          margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="km"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11 }}
          />
          {hasElevation && (
            <YAxis
              yAxisId="altitude"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v} m`}
              width={48}
              domain={["dataMin", "dataMax"]}
            />
          )}
          <YAxis
            yAxisId="pace"
            orientation={hasElevation ? "right" : "left"}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => formatRunPace(v)}
            reversed
            width={44}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (name === "pace")
                    return [formatRunPace(value as number), "Allure"]
                  return [`${value}m`, "Altitude"]
                }}
              />
            }
          />
          {hasElevation && (
            <Area
              yAxisId="altitude"
              dataKey="altitude"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#altitudeGradient)"
              dot={false}
              type="monotone"
              baseValue="dataMin"
            />
          )}
          <Line
            yAxisId="pace"
            dataKey="pace"
            stroke="#ec4899"
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
