"use client"

import { useQueryState, parseAsInteger } from "nuqs"
import { Button } from "@/components/shadcn-ui/button"

interface YearSelectorProps {
  years: number[]
}

export function YearSelector({ years }: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useQueryState(
    "year",
    parseAsInteger.withOptions({ shallow: false }),
  )

  // null (no param) = first load, treat as current year selected
  const activeYear = year ?? currentYear
  const allYearsActive = year === 0

  return (
    <div className="flex items-center gap-1">
      {years.map((y) => (
        <Button
          key={y}
          size="sm"
          variant={!allYearsActive && activeYear === y ? "default" : "ghost"}
          onClick={() => setYear(y)}
          className="cursor-pointer"
        >
          {y}
        </Button>
      ))}
      <Button
        size="sm"
        variant={allYearsActive ? "default" : "ghost"}
        onClick={() => setYear(0)}
        className="cursor-pointer"
      >
        Toutes
      </Button>
    </div>
  )
}
