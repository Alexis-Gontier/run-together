"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shadcn-ui/toggle-group"
import { ROUTES } from "@/lib/constants/routes"
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
  PrDist,
} from "../_schemas/leaderboard-schema"

const METRICS: { value: LeaderboardMetric; label: string }[] = [
  { value: "distance", label: "Distance" },
  { value: "runs", label: "Courses" },
  { value: "pace", label: "Allure" },
  { value: "pr", label: "Records" },
]

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "week", label: "7 j" },
  { value: "month", label: "30 j" },
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "all", label: "Tout" },
]

const PR_DISTANCES: { value: PrDist; label: string }[] = [
  { value: "KM_1", label: "1 km" },
  { value: "KM_5", label: "5 km" },
  { value: "KM_10", label: "10 km" },
  { value: "HALF_MARATHON", label: "Semi" },
  { value: "MARATHON", label: "Marathon" },
]

interface Props {
  metric: LeaderboardMetric
  period: LeaderboardPeriod
  prDist: PrDist
}

/** Métrique en onglets (navigation principale), période / distance en ToggleGroup. */
export function LeaderboardFilters({ metric, period, prDist }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const go = (query: string) =>
    startTransition(() => router.push(`${ROUTES.LEADERBOARD}?${query}`))

  const options = metric === "pr" ? PR_DISTANCES : PERIODS
  const value = metric === "pr" ? prDist : period

  return (
    <div className="space-y-3 px-4 pt-4">
      <Tabs
        value={metric}
        onValueChange={(m) =>
          go(
            m === "pr"
              ? `metric=pr&dist=${prDist}`
              : `metric=${m}&period=${period}`,
          )
        }
      >
        <TabsList variant="line" className="w-full">
          {METRICS.map((m) => (
            <TabsTrigger
              key={m.value}
              value={m.value}
              className="flex-1 cursor-pointer"
            >
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={value}
        onValueChange={(v) => {
          if (!v) return
          go(
            metric === "pr"
              ? `metric=pr&dist=${v}`
              : `metric=${metric}&period=${v}`,
          )
        }}
        aria-label={metric === "pr" ? "Distance" : "Période"}
        className={isPending ? "flex-wrap opacity-60" : "flex-wrap"}
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            className="cursor-pointer px-3"
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
