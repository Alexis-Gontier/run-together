"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion"
import { formatPace } from "@/lib/utils/run"
import type { getRunsStatsAction } from "../_actions/get-runs-stats-action"

type Month = NonNullable<
  Awaited<ReturnType<typeof getRunsStatsAction>>["data"]
>["months"][number]

interface MonthAccordionListProps {
  months: Month[]
}

export function MonthAccordionList({ months }: MonthAccordionListProps) {
  return (
    <Accordion type="multiple" className="overflow-hidden rounded-xl border">
      {months.map(({ year, month, runs, stats }) => {
        const key = `${year}-${month}`
        const rawMonth = format(new Date(year, month - 1), "MMMM", {
          locale: fr,
        })
        const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1)

        const TrendIcon =
          stats.trendPercent === null
            ? Minus
            : stats.trendPercent > 0
              ? TrendingUp
              : TrendingDown

        const trendColor =
          stats.trendPercent === null
            ? "text-muted-foreground"
            : stats.trendPercent > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"

        return (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="px-4 hover:[text-decoration:none]">
              <div className="flex min-w-0 items-center gap-6">
                <span className="w-28 shrink-0 text-sm">
                  <span className="font-bold">{monthLabel}</span>{" "}
                  <span className="font-normal text-muted-foreground">
                    {year}
                  </span>
                </span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="font-semibold text-foreground">
                      {stats.count}
                    </span>{" "}
                    course{stats.count > 1 ? "s" : ""}
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
                  {stats.trendPercent !== null && (
                    <span
                      className={`flex items-center gap-0.5 font-semibold ${trendColor}`}
                    >
                      <TrendIcon className="size-3" />
                      {stats.trendPercent > 0 ? "+" : ""}
                      {stats.trendPercent}%
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <pre className="overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                {JSON.stringify(runs, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
