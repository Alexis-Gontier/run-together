"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/shadcn-ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs"
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
  { value: "pr", label: "Records PR" },
]

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "week", label: "7 jours" },
  { value: "month", label: "30 jours" },
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

export function LeaderboardFilters({ metric, period, prDist }: Props) {
  const router = useRouter()

  function setMetric(newMetric: LeaderboardMetric) {
    if (newMetric === "pr") {
      router.push(`${ROUTES.LEADERBOARD}?metric=pr&dist=${prDist}`)
    } else {
      router.push(`${ROUTES.LEADERBOARD}?metric=${newMetric}&period=${period}`)
    }
  }

  function setPeriod(newPeriod: string) {
    router.push(`${ROUTES.LEADERBOARD}?metric=${metric}&period=${newPeriod}`)
  }

  function setPrDist(newDist: string) {
    router.push(`${ROUTES.LEADERBOARD}?metric=pr&dist=${newDist}`)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Métrique :</p>
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <Button
              key={m.value}
              variant={metric === m.value ? "default" : "outline"}
              size="sm"
              className="cursor-pointer"
              onClick={() => setMetric(m.value)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {metric === "pr" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Distance :
          </p>
          <Tabs value={prDist} onValueChange={setPrDist}>
            <TabsList>
              {PR_DISTANCES.map((d) => (
                <TabsTrigger
                  key={d.value}
                  value={d.value}
                  className="flex-1 cursor-pointer"
                >
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Période :</p>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              {PERIODS.map((p) => (
                <TabsTrigger
                  key={p.value}
                  value={p.value}
                  className="flex-1 cursor-pointer"
                >
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
    </div>
  )
}
