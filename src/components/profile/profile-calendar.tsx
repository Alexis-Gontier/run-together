"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { GithubCalendar, type CalendarDayData } from "@/components/github/github-calendar"
import { useMemo } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type Run = {
  id: string
  distance: number
  duration: number
}

type CalendarDay = {
  hasActivity: boolean
  runs: Run[]
}

type ProfileCalendarProps = {
  calendar: Record<string, CalendarDay>
  year?: number
  totalRuns: number
  userName: string
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}

export function ProfileCalendar({ calendar, year, totalRuns, userName }: ProfileCalendarProps) {
  const currentYear = year || new Date().getFullYear()

  const calendarData = useMemo(() => {
    if (!calendar) return {}

    const transformedData: Record<string, CalendarDayData> = {}

    Object.entries(calendar).forEach(([dateString, dayData]) => {
      const [yearNum, month, day] = dateString.split("-").map(Number)
      const date = new Date(yearNum, month - 1, day)

      transformedData[dateString] = {
        date,
        dateString,
        hasActivity: dayData.hasActivity,
        tooltipContent: (
          <div className="text-xs">
            <p className="font-medium">
              {format(date, "d MMMM yyyy", { locale: fr })}
            </p>
            {dayData.runs.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-primary">
                  {dayData.runs.length} course{dayData.runs.length > 1 ? "s" : ""}
                </p>
                {dayData.runs.map((run) => (
                  <div key={run.id} className="text-muted-foreground text-[10px]">
                    • {run.distance.toFixed(2)} km - {formatDuration(run.duration)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      }
    })

    return transformedData
  }, [calendar])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier d&apos;Activité</CardTitle>
        <CardDescription>
          Heatmap des courses de {userName} sur l&apos;année {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GithubCalendar data={calendarData} year={currentYear} isLoading={false} error={false} />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <CardDescription>
          <span>{totalRuns}</span> course{totalRuns > 1 ? "s" : ""} enregistrée
          {totalRuns > 1 ? "s" : ""} en {currentYear}
        </CardDescription>
      </CardFooter>
    </Card>
  )
}
