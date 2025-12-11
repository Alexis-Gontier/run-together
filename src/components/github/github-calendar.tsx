"use client"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/shadcn-ui/tooltip"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { cn } from "@/lib/utils/cn"
import { ReactNode } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const days = ["L", "M", "M", "J", "V", "S", "D"]
const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

// Helper pour formater une date en YYYY-MM-DD en heure locale
function formatDateLocal(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export type CalendarDayData = {
    date: Date
    dateString: string
    hasActivity: boolean
    tooltipContent?: ReactNode
}

function generateCalendarDays(year: number = new Date().getFullYear()): string[] {
    const today = new Date()
    const startOfYear = new Date(year, 0, 1)

    // Trouver le lundi précédent ou égal au 1er janvier
    const dayOfWeek = startOfYear.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startDate = new Date(startOfYear)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    const days: string[] = []
    const currentDate = new Date(startDate)
    const endOfYear = new Date(year, 11, 31)
    const maxDate = today < endOfYear ? today : endOfYear

    // Générer tous les jours jusqu'à aujourd'hui ou fin d'année
    while (currentDate <= maxDate) {
        days.push(formatDateLocal(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
    }

    // Compléter la dernière semaine jusqu'à dimanche
    const lastDayStr = days[days.length - 1]
    const [lastYear, lastMonth, lastDay] = lastDayStr.split('-').map(Number)
    const lastDayDate = new Date(lastYear, lastMonth - 1, lastDay)
    const lastDayOfWeek = lastDayDate.getDay()
    if (lastDayOfWeek !== 0) {
        const daysToAdd = 7 - lastDayOfWeek
        for (let i = 1; i <= daysToAdd; i++) {
            currentDate.setDate(currentDate.getDate())
            days.push(formatDateLocal(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }
    }

    return days
}

export type GithubCalendarProps = {
    data: Record<string, CalendarDayData>
    year?: number
    isLoading?: boolean
    error?: boolean
}

export function GithubCalendar({ data, year, isLoading = false, error = false }: GithubCalendarProps) {
    const currentYear = year || new Date().getFullYear()
    const today = new Date()

    const calendarDays = generateCalendarDays(currentYear)

    // Fusionner les données avec les jours du calendrier
    const daysWithData = calendarDays.map(dateString => {
        const dayData = data[dateString]
        // Parser la date correctement pour éviter les problèmes de timezone
        const [year, month, day] = dateString.split('-').map(Number)
        return {
            dateString,
            date: new Date(year, month - 1, day),
            hasActivity: dayData?.hasActivity || false,
            tooltipContent: dayData?.tooltipContent,
        }
    })

    const weeksWithData: typeof daysWithData[] = []
    for (let i = 0; i < daysWithData.length; i += 7) {
        weeksWithData.push(daysWithData.slice(i, i + 7))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <Skeleton className="h-34 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-destructive">Erreur lors du chargement des données</p>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-1">
                {/* Ligne des mois */}
                <div className="flex gap-1 mb-2">
                    <div className="w-6" /> {/* Espace pour les labels des jours */}
                    {weeksWithData.map((week, weekIndex) => {
                        const firstDayOfWeek = week[0].date
                        const isFirstWeekOfMonth = firstDayOfWeek.getDate() <= 7

                        return (
                            <div key={weekIndex} className="flex-1 text-[10px] text-muted-foreground text-center">
                                {isFirstWeekOfMonth && months[firstDayOfWeek.getMonth()].substring(0, 3)}
                            </div>
                        )
                    })}
                </div>

                {/* Grille du calendrier */}
                <div className="flex gap-1">
                    {/* Labels des jours */}
                    <div className="flex flex-col gap-1">
                        {days.map((day, index) => (
                            <div key={index} className="h-3 w-6 text-[10px] text-muted-foreground flex items-center">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Semaines */}
                    {weeksWithData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1 flex-1">
                            {week.map((day, dayIndex) => {
                                const isInFuture = day.date > today
                                const isCurrentYear = day.date.getFullYear() === currentYear

                                return (
                                    <Tooltip key={dayIndex}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "h-3 rounded-xs cursor-pointer hover:ring-1 hover:ring-foreground/20 transition-all",
                                                    isInFuture || !isCurrentYear
                                                        ? "bg-muted/30 opacity-50"
                                                        : day.hasActivity
                                                        ? "bg-primary"
                                                        : "bg-muted"
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {day.tooltipContent || (
                                                <div className="text-xs">
                                                    <p className="font-medium">
                                                        {format(day.date, 'd MMMM yyyy', { locale: fr })}
                                                    </p>
                                                    <p className="text-muted-foreground mt-1">Aucune activité</p>
                                                </div>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    )
}