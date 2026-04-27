"use client"

import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion"
import {
  formatPace,
  formatRunDistance,
  formatRunPace,
  formatRunDurationDisplay,
} from "@/lib/utils/run"
import { cn } from "@/lib/utils/cn"
import { TrendingUp, TrendingDown } from "lucide-react"
import { runRoute } from "@/lib/constants/routes"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

interface RunRow {
  id: string
  name: string
  date: Date
  distance: number
  duration: number
  pace: number
  elevation: number
}

interface MonthData {
  year: number
  month: number
  runs: RunRow[]
  stats: {
    count: number
    distanceKm: number
    avgPaceSecPerKm: number
    elevationM: number
    trendPercent: number | null
  }
}

interface MonthAccordionListProps {
  months: MonthData[]
}

export function MonthAccordionList({ months }: MonthAccordionListProps) {
  if (months.length === 0) return null

  return (
    <Accordion type="single" collapsible className="flex flex-col gap-2">
      {months.map(({ year, month, runs, stats }) => {
        const key = `${year}-${month}`
        const monthName = MONTHS_FR[month - 1]
        const trend = stats.trendPercent

        return (
          <AccordionItem
            key={key}
            value={key}
            className="overflow-hidden rounded-xl border"
          >
            <AccordionTrigger
              iconPosition="start"
              className="gap-3 rounded-none px-4 transition-colors hover:bg-muted/40 hover:no-underline"
            >
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <span className="shrink-0 text-sm font-semibold">
                  {monthName}{" "}
                  <span className="font-normal text-muted-foreground">
                    {year}
                  </span>
                </span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    <span className="font-semibold text-foreground">
                      {stats.count}
                    </span>{" "}
                    courses
                  </span>
                  <span>
                    <span className="font-semibold text-foreground">
                      {stats.distanceKm.toLocaleString("fr-FR")}
                    </span>{" "}
                    km
                  </span>
                  <span>
                    allure{" "}
                    <span className="font-semibold text-foreground">
                      {formatPace(stats.avgPaceSecPerKm)}
                    </span>
                  </span>
                  {trend !== null && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs font-semibold",
                        trend > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400",
                      )}
                    >
                      {trend > 0 ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      {trend > 0 ? "+" : ""}
                      {trend}%
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 [&_a]:no-underline">
              <div className="divide-y divide-border border-t">
                {runs.map((run) => (
                  <Link
                    key={run.id}
                    href={runRoute(run.id)}
                    className="flex items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/40"
                  >
                    <span className="w-16 shrink-0 text-xs text-muted-foreground capitalize">
                      {format(new Date(run.date), "EEE d", { locale: fr })}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {run.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-4 text-muted-foreground">
                      <span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatRunDistance(run.distance)}
                        </span>{" "}
                        km
                      </span>
                      <span className="tabular-nums">
                        {formatRunPace(run.pace)}
                        <span className="text-xs">/km</span>
                      </span>
                      <span className="w-14 text-right tabular-nums">
                        {formatRunDurationDisplay(run.duration)}
                      </span>
                      <span className="w-14 text-right tabular-nums">
                        +{Math.round(run.elevation)}m
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
