import { addDays, format, startOfWeek, subWeeks } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip"
import { cn } from "@/lib/utils/cn"

// Intensité selon les km du jour : 0 / < 5 / < 10 / < 15 / ≥ 15.
function level(km: number): string {
  if (km <= 0) return "bg-muted"
  if (km < 5) return "bg-emerald-500/30"
  if (km < 10) return "bg-emerald-500/55"
  if (km < 15) return "bg-emerald-500/80"
  return "bg-emerald-500"
}

// Libellé affiché une ligne sur deux, comme GitHub.
const DAYS = [
  { key: "lun", label: "L" },
  { key: "mar", label: "" },
  { key: "mer", label: "M" },
  { key: "jeu", label: "" },
  { key: "ven", label: "V" },
  { key: "sam", label: "" },
  { key: "dim", label: "D" },
]

/** Calendrier d'activité façon GitHub : une colonne par semaine (lundi en haut). */
export function ActivityHeatmap({
  data,
  weeks,
}: {
  data: { date: string; distanceKm: number }[]
  weeks: number
}) {
  const byDay = new Map(data.map((d) => [d.date, d.distanceKm]))
  const today = new Date()
  const firstMonday = startOfWeek(subWeeks(today, weeks - 1), {
    weekStartsOn: 1,
  })

  const columns = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(firstMonday, w * 7 + d)),
  )

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <div className="grid grid-rows-7 gap-1 pt-5 text-[10px] text-muted-foreground">
          {DAYS.map((d) => (
            <span key={d.key} className="flex h-3 items-center leading-none">
              {d.label}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex w-max gap-1">
            {columns.map((days) => {
              const first = days[0]
              const showMonth = first.getDate() <= 7
              return (
                <div key={first.toISOString()} className="flex flex-col gap-1">
                  <span className="h-4 w-3 overflow-visible whitespace-nowrap text-[10px] text-muted-foreground leading-none">
                    {showMonth ? format(first, "MMM", { locale: fr }) : ""}
                  </span>
                  {days.map((day) => {
                    const key = format(day, "yyyy-MM-dd")
                    const km = byDay.get(key) ?? 0
                    const future = day > today
                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "block size-3 rounded-[3px]",
                              future ? "bg-transparent" : level(km),
                            )}
                          />
                        </TooltipTrigger>
                        {!future && (
                          <TooltipContent>
                            {format(day, "EEEE d MMMM", { locale: fr })} —{" "}
                            {km > 0
                              ? `${String(km).replace(".", ",")} km`
                              : "repos"}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
