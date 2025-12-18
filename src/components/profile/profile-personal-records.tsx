"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { Trophy, TrendingUp, Zap, Mountain, Timer } from "lucide-react"
import { formatDistance, formatPace, formatDuration } from "@/lib/utils/run"
import type { UserStats } from "@/lib/api/schemas/user-profile.schema"

type ProfilePersonalRecordsProps = {
  stats: UserStats
}

export function ProfilePersonalRecords({ stats }: ProfilePersonalRecordsProps) {
  const records = [
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      label: "Course la plus longue",
      value: formatDistance(stats.longestRun),
    },
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      label: "Meilleure allure",
      value: formatPace(stats.fastestPace),
    },
    {
      icon: <Mountain className="h-5 w-5 text-primary" />,
      label: "Dénivelé total",
      value: `${stats.totalElevation.toFixed(0)} m`,
    },
    {
      icon: <Timer className="h-5 w-5 text-primary" />,
      label: "Temps total d'entraînement",
      value: formatDuration(stats.totalDuration),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Records Personnels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {record.icon}
                <span className="text-sm font-medium">{record.label}</span>
              </div>
              <span className="text-sm font-bold">{record.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
