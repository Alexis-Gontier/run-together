"use client"

import { SlidersHorizontal } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/shadcn-ui/button"
import { Checkbox } from "@/components/shadcn-ui/checkbox"
import { Label } from "@/components/shadcn-ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover"
import {
  MIN_RADAR_STATS,
  RADAR_STAT_KEYS,
  RADAR_STATS,
  type RadarStatKey,
} from "@/lib/stats/radar"

/** Choix des axes du radar, dans l'URL (`?stats=`). */
export function StatsPicker({ value }: { value: RadarStatKey[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const toggle = (key: RadarStatKey, checked: boolean) => {
    const next = RADAR_STAT_KEYS.filter((k) =>
      k === key ? checked : value.includes(k),
    )
    const params = new URLSearchParams(searchParams)
    params.set("stats", next.join(","))
    startTransition(() => router.push(`${pathname}?${params}`))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <SlidersHorizontal />
          Stats
          <span className="text-muted-foreground text-xs">
            {value.length} choisies
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <PopoverHeader>
          <PopoverTitle>Axes du radar</PopoverTitle>
          <PopoverDescription>
            Au moins {MIN_RADAR_STATS}. Le classement suit l&apos;aire du radar.
          </PopoverDescription>
        </PopoverHeader>
        <ul className={isPending ? "space-y-2 opacity-60" : "space-y-2"}>
          {RADAR_STAT_KEYS.map((key) => {
            const checked = value.includes(key)
            const locked = checked && value.length <= MIN_RADAR_STATS
            return (
              <li key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`stat-${key}`}
                  checked={checked}
                  disabled={locked || isPending}
                  onCheckedChange={(c) => toggle(key, c === true)}
                />
                <Label htmlFor={`stat-${key}`} className="font-normal">
                  {RADAR_STATS[key].label}
                </Label>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
