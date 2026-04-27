import { notFound } from "next/navigation"
import { FeedCard } from "@/components/ui/feed-card"
import {
  RunCardHeader,
  RunCardMap,
  RunCardStats,
  RunCardSplits,
} from "@/components/ui/run-card"
import { DeleteRunButton } from "./_components/delete-run-button"
import { RunProfileChart } from "./_components/run-profile-chart"
import { getRunAction } from "./_actions/get-run-action"
import { getUser } from "@/lib/auth/auth-session"

type RunDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { id } = await params
  const [result, currentUser] = await Promise.all([
    getRunAction({ id }),
    getUser(),
  ])
  const run = result?.data

  if (!run) notFound()

  const isOwner = currentUser?.id === run.userId

  return (
    <div className="divide-y divide-border">
      <FeedCard>
        <RunCardHeader run={run} />
        {run.summaryPolyline && <RunCardMap polyline={run.summaryPolyline} />}
        <RunCardStats run={run} hasMap={!!run.summaryPolyline} />
      </FeedCard>
      {run.splits.length > 0 && (
        <div className="space-y-4 p-4">
          <RunProfileChart splits={run.splits} />
          <RunCardSplits splits={run.splits} />
        </div>
      )}
      {isOwner && (
        <div className="p-4">
          <div className="flex items-center justify-end gap-1 rounded-lg border px-4 py-2.5">
            <DeleteRunButton id={run.id} />
          </div>
        </div>
      )}
    </div>
  )
}
