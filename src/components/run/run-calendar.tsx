"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/shadcn-ui/card"
import { GithubCalendar, type CalendarDayData } from "@/components/github/github-calendar"
import { useRunsCalendar } from "@/lib/api"
import { useMemo } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
}

// Calculer le niveau d'activité basé sur le nombre de courses
function getActivityLevel(activityCount: number): number {
    if (activityCount === 0) return 0
    if (activityCount === 1) return 1
    if (activityCount === 2) return 2
    if (activityCount <= 3) return 3
    return 4 // 4+ courses
}

export function RunCalendar() {
    const currentYear = new Date().getFullYear()
    const { data, isLoading, isError } = useRunsCalendar(currentYear)

    // Transform API data to GithubCalendar format
    const calendarData = useMemo(() => {
        if (!data?.data.calendar) return {}

        const transformedData: Record<string, CalendarDayData> = {}

        Object.entries(data.data.calendar).forEach(([dateString, dayData]) => {
            const [year, month, day] = dateString.split("-").map(Number)
            const date = new Date(year, month - 1, day)

            // Calculer le niveau d'activité basé sur le nombre de courses
            const activityLevel = getActivityLevel(dayData.runs.length)

            transformedData[dateString] = {
                date,
                dateString,
                hasActivity: dayData.hasActivity,
                activityLevel,
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
    }, [data?.data.calendar])

    const stats = data?.data.stats || { totalRuns: 0, totalDistance: 0, totalHours: 0 }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Calendrier d&apos;Activité
                </CardTitle>
                <CardDescription>
                    Heatmap de vos courses sur l&apos;année {currentYear}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <GithubCalendar
                    data={calendarData}
                    year={currentYear}
                    isLoading={isLoading}
                    error={isError}
                />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
                {!isLoading && !isError && (
                    <CardDescription>
                        <span>{stats.totalRuns}</span> course{stats.totalRuns > 1 ? "s" : ""} enregistrée{stats.totalRuns > 1 ? "s" : ""} en {currentYear}
                    </CardDescription>
                )}
            </CardFooter>
        </Card>
    )
}
