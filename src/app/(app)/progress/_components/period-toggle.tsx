"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/shadcn-ui/toggle-group"
import type { ProgressPeriod } from "../_schemas/progress-schema"

const PERIODS: { value: ProgressPeriod; label: string }[] = [
  { value: "3m", label: "3 mois" },
  { value: "6m", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "all", label: "Tout" },
]

export function PeriodToggle({ value }: { value: ProgressPeriod }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => {
        if (!next) return
        const params = new URLSearchParams(searchParams)
        params.set("period", next)
        startTransition(() => router.push(`${pathname}?${params}`))
      }}
      aria-label="Période"
      className={isPending ? "opacity-60" : undefined}
    >
      {PERIODS.map((p) => (
        <ToggleGroupItem
          key={p.value}
          value={p.value}
          className="cursor-pointer px-3"
        >
          {p.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
