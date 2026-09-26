import { ChartLine, Flame, Plus, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn-ui/empty"
import { StatCard } from "@/components/ui/stat-card"
import { ROUTES } from "@/lib/constants/routes"
import { getProgressAction } from "./_actions/get-progress-action"
import { ActivityHeatmap } from "./_components/activity-heatmap"
import { PeriodToggle } from "./_components/period-toggle"
import {
  PaceChart,
  WeeklyElevationChart,
  WeeklyVolumeChart,
} from "./_components/progress-charts"
import type { ProgressPeriod } from "./_schemas/progress-schema"
import { buildProgressStatCards } from "./_utils/stat-cards"

type Props = {
  searchParams: Promise<{ period?: string }>
}

const PERIODS: ProgressPeriod[] = ["3m", "6m", "1y", "all"]
// Semaines affichées dans le calendrier d'activité selon la période.
const HEATMAP_WEEKS: Record<ProgressPeriod, number> = {
  "3m": 13,
  "6m": 26,
  "1y": 53,
  all: 53,
}

export default async function ProgressPage({ searchParams }: Props) {
  const { period: raw } = await searchParams
  const period = PERIODS.find((p) => p === raw) ?? "3m"

  const result = await getProgressAction({ period })
  const data = result?.data
  if (!data) throw new Error("Progression indisponible")

  const { summary, streaks } = data
  const hasRuns = summary.current.totalRuns > 0

  return (
    <div className="space-y-4 p-4">
      <PeriodToggle value={period} />

      {!hasRuns ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartLine />
            </EmptyMedia>
            <EmptyTitle>Aucune course sur cette période</EmptyTitle>
            <EmptyDescription>
              Ajoute une course ou élargis la période pour voir ta progression.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={ROUTES.RUN_NEW}>
                <Plus />
                Ajouter une course
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {buildProgressStatCards(summary.current, summary.previous).map(
              (card) => (
                <StatCard key={card.label} {...card} />
              ),
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Volume hebdomadaire</CardTitle>
              <CardDescription>
                Kilomètres par semaine et moyenne sur 4 semaines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyVolumeChart data={data.weeklyVolume} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Régularité</CardTitle>
              <CardDescription>
                {streaks.activeDays} jour{streaks.activeDays > 1 ? "s" : ""} de
                course sur {streaks.totalDays}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityHeatmap
                data={data.dailyActivity}
                weeks={HEATMAP_WEEKS[period]}
              />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  <Flame className="size-4 text-orange-500" />
                  <div>
                    <p className="font-semibold tabular-nums">
                      {streaks.currentStreak} j
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Série en cours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  <Trophy className="size-4 text-amber-500" />
                  <div>
                    <p className="font-semibold tabular-nums">
                      {streaks.bestStreak} j
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Meilleure série
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Évolution de l'allure</CardTitle>
              <CardDescription>Une valeur par course</CardDescription>
            </CardHeader>
            <CardContent>
              <PaceChart data={data.paceEvolution} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dénivelé hebdomadaire</CardTitle>
              <CardDescription>Mètres de D+ par semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyElevationChart data={data.weeklyElevation} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
