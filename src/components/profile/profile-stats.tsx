"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Activity, TrendingUp, Mountain, Timer, Target, Zap } from "lucide-react"
import { formatDistance, formatDuration, formatPace } from "@/lib/utils/run"
import type { UserStats } from "@/lib/api/schemas/user-profile.schema"

type ProfileStatsProps = {
  stats: UserStats
  monthObjectif?: number | null
}

export function ProfileStats({ stats, monthObjectif }: ProfileStatsProps) {
  // Calculate improvement vs last month
  const distanceDiff = stats.currentMonthDistance - stats.lastMonthDistance
  const hasImprovement = distanceDiff !== 0
  const improvementPercentage = stats.lastMonthDistance > 0
    ? Math.round((distanceDiff / stats.lastMonthDistance) * 100)
    : null

  const getImprovementText = () => {
    if (!hasImprovement) return null
    if (distanceDiff > 0) {
      return improvementPercentage !== null ? `+${improvementPercentage}%` : null
    }
    return improvementPercentage !== null ? `${improvementPercentage}%` : null
  }

  const getImprovementColor = () => {
    if (!hasImprovement) return ""
    return distanceDiff > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Courses"
        value={stats.totalRuns.toString()}
        description="Nombre total de courses enregistrées"
        icon={<Activity className="h-4 w-4" />}
      />

      <StatCard
        title="Distance Totale"
        value={formatDistance(stats.totalDistance)}
        description="Kilomètres parcourus au total"
        icon={<TrendingUp className="h-4 w-4" />}
      />

      <StatCard
        title="Temps Total"
        value={formatDuration(stats.totalDuration)}
        description="Durée totale d'entraînement"
        icon={<Timer className="h-4 w-4" />}
      />

      <StatCard
        title="Allure Moyenne"
        value={formatPace(stats.averagePace)}
        description="Allure moyenne sur toutes les courses"
        icon={<Zap className="h-4 w-4" />}
      />

      <StatCard
        title="Dénivelé Total"
        value={`${stats.totalElevation.toFixed(0)} m`}
        description="Dénivelé positif cumulé"
        icon={<Mountain className="h-4 w-4" />}
      />

      <StatCard
        title="Course la Plus Longue"
        value={formatDistance(stats.longestRun)}
        description="Distance maximale sur une course"
        icon={<TrendingUp className="h-4 w-4" />}
      />

      <StatCard
        title="Meilleure Allure"
        value={formatPace(stats.fastestPace)}
        description="Allure la plus rapide enregistrée"
        icon={<Zap className="h-4 w-4" />}
      />

      <StatCard
        title="Ce Mois-ci"
        value={`${stats.currentMonthRuns} courses`}
        description={
          <div className="flex items-center gap-1">
            <span>{formatDistance(stats.currentMonthDistance)}</span>
            {getImprovementText() && (
              <span className={getImprovementColor()}>
                ({getImprovementText()})
              </span>
            )}
          </div>
        }
        icon={<Target className="h-4 w-4" />}
      />
    </div>
  )
}
