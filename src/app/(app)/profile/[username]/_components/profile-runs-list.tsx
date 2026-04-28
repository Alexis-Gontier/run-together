"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { Footprints } from "lucide-react"
import { FeedCard } from "@/components/ui/feed-card"
import {
  RunCardHeader,
  RunCardMap,
  RunCardStats,
} from "@/components/ui/run-card"
import type { RunWithUser } from "@/components/ui/run-card"
import { runRoute } from "@/lib/constants/routes"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/shadcn-ui/empty"
import { getProfileRunsAction } from "../_actions/get-profile-runs-action"

type Run = NonNullable<
  Awaited<ReturnType<typeof getProfileRunsAction>>["data"]
>["runs"][number]

interface ProfileRunsListProps {
  username: string
  initialRuns: Run[]
  initialNextCursor: string | null
}

export function ProfileRunsList({
  username,
  initialRuns,
  initialNextCursor,
}: ProfileRunsListProps) {
  const [runs, setRuns] = useState(initialRuns)
  const [cursor, setCursor] = useState(initialNextCursor)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { execute, isPending } = useAction(getProfileRunsAction, {
    onSuccess: ({ data }) => {
      if (!data) return
      setRuns((prev) => [...prev, ...data.runs])
      setCursor(data.nextCursor)
    },
  })

  const loadMore = useCallback(() => {
    if (!cursor || isPending) return
    execute({ username, cursor, limit: 5 })
  }, [cursor, isPending, execute, username])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (runs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Footprints />
          </EmptyMedia>
          <EmptyDescription>Aucune course pour le moment.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="divide-y divide-border">
      {runs.map((run) => (
        <FeedCard key={run.id} href={runRoute(run.id)}>
          <RunCardHeader run={run as RunWithUser} />
          {run.summaryPolyline && <RunCardMap polyline={run.summaryPolyline} />}
          <RunCardStats run={run} hasMap={!!run.summaryPolyline} />
        </FeedCard>
      ))}
      {cursor && (
        <div
          ref={sentinelRef}
          className="py-4 text-center text-sm text-muted-foreground"
        >
          {isPending ? "Chargement..." : null}
        </div>
      )}
    </div>
  )
}
