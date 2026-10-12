"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/shadcn-ui/chart"
import { cn } from "@/lib/utils/cn"

export type RadarSeries = {
  key: string
  name: string
  color: string
  /** Un score 0–1 par axe. */
  scores: number[]
  /** Valeur réelle affichée au survol, une par axe. */
  texts: string[]
}

/** Radar des stats d'un ou plusieurs coureurs (scores relatifs au meilleur du groupe). */
export function RunnerRadar({
  axes,
  series,
  legend = false,
  className,
}: {
  axes: { short: string; label: string }[]
  series: RadarSeries[]
  legend?: boolean
  className?: string
}) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.name, color: s.color }]),
  ) satisfies ChartConfig
  const data = axes.map((axis, i) => ({
    axis: axis.short,
    label: axis.label,
    ...Object.fromEntries(
      series.flatMap((s) => [
        [s.key, s.scores[i]],
        [`${s.key}Text`, s.texts[i]],
      ]),
    ),
  }))

  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-auto h-60 w-full", className)}
    >
      <RadarChart
        data={data}
        outerRadius="75%"
        margin={{ top: 4, right: 28, bottom: 4, left: 28 }}
      >
        <PolarGrid gridType="polygon" />
        {/* Scores 0–1 : échelle fixe, sinon recharts l'arrondit et écrase les polygones. */}
        <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as
              | Record<string, string>
              | undefined
            if (!active || !row) return null
            return (
              <div className="grid gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <span className="font-medium">{row.label}</span>
                {series.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-[2px]"
                      style={{ background: s.color }}
                    />
                    {series.length > 1 && (
                      <span className="text-muted-foreground">{s.name}</span>
                    )}
                    <span className="font-mono tabular-nums">
                      {row[`${s.key}Text`]}
                    </span>
                  </span>
                ))}
              </div>
            )
          }}
        />
        {series.map((s) => (
          <Radar
            key={s.key}
            dataKey={s.key}
            fill={`var(--color-${s.key})`}
            fillOpacity={0.35}
            stroke={`var(--color-${s.key})`}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        ))}
        {legend && <ChartLegend content={<ChartLegendContent />} />}
      </RadarChart>
    </ChartContainer>
  )
}
