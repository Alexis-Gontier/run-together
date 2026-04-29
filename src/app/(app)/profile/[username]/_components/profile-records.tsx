"use client"

import Link from "next/link"
import type { PRDistance } from "@/generated/prisma/enums"
import { Trophy } from "lucide-react"
import { PR_DISTANCE_LABELS, PR_DISTANCE_ORDER } from "@/lib/strava/pr-display"
import { runRoute } from "@/lib/constants/routes"
import {
  formatRunPace,
  formatRunDurationDisplay,
  formatRunDateShort,
} from "@/lib/utils/run"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/shadcn-ui/empty"

type RecordEntry = {
  distance: PRDistance
  duration: number
  pace: number
  run: { id: string; name: string | null; date: Date } | null
}

interface ProfileRecordsProps {
  records: RecordEntry[]
}

export function ProfileRecords({ records }: ProfileRecordsProps) {
  const recordMap = new Map(records.map((r) => [r.distance, r]))

  if (records.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trophy />
          </EmptyMedia>
          <EmptyDescription>
            Aucun record personnel pour le moment.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[6rem_1fr_5rem_5rem] border-b px-4 py-2.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <span>Distance</span>
        <span>Course</span>
        <span className="text-right">Temps</span>
        <span className="text-right">Allure</span>
      </div>

      {PR_DISTANCE_ORDER.map((dist) => {
        const record = recordMap.get(dist)

        return (
          <div
            key={dist}
            className="grid grid-cols-[6rem_1fr_5rem_5rem] items-center border-t px-4 py-3"
          >
            <span className="text-sm font-semibold">
              {PR_DISTANCE_LABELS[dist]}
            </span>

            {record ? (
              <>
                <div className="min-w-0 pr-2">
                  {record.run ? (
                    <Link
                      href={runRoute(record.run.id)}
                      className="block truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {record.run.name || "Course sans nom"} ·{" "}
                      {formatRunDateShort(record.run.date)}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <span className="text-right text-sm font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                  {formatRunDurationDisplay(record.duration)}
                </span>
                <span className="text-right text-xs text-muted-foreground tabular-nums">
                  {formatRunPace(record.pace)}/km
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-right text-sm text-muted-foreground">
                  —
                </span>
                <span className="text-right text-xs text-muted-foreground">
                  —
                </span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
