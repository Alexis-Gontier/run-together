"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { FeedCard } from "@/components/ui/feed-card"
import {
  RunCardHeader,
  RunCardMap,
  RunCardStats,
} from "@/components/ui/run-card"
import { runRoute } from "@/lib/constants/routes"
import { getFeedAction } from "../_actions/get-feed-action"

type Run = NonNullable<
  Awaited<ReturnType<typeof getFeedAction>>["data"]
>["runs"][number]

interface FeedListProps {
  initialRuns: Run[]
  initialNextCursor: string | null
}

export function FeedList({ initialRuns, initialNextCursor }: FeedListProps) {
  const [runs, setRuns] = useState(initialRuns)
  const [cursor, setCursor] = useState(initialNextCursor)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { execute, isPending } = useAction(getFeedAction, {
    onSuccess: ({ data }) => {
      if (!data) return
      setRuns((prev) => [...prev, ...data.runs])
      setCursor(data.nextCursor)
    },
  })

  const loadMore = useCallback(() => {
    if (!cursor || isPending) return
    execute({ cursor, limit: 5 })
  }, [cursor, isPending, execute])

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

  return (
    <div className="divide-y divide-border">
      {runs.map((run) => (
        <FeedCard key={run.id} href={runRoute(run.id)}>
          <RunCardHeader run={run} />
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
