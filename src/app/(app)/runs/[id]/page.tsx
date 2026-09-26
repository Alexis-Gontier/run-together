import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/shadcn-ui/button"
import { FeedCard } from "@/components/ui/feed-card"
import {
  RunCardHeader,
  RunCardMap,
  RunCardSplits,
  RunCardStats,
} from "@/components/ui/run-card"
import { getUser } from "@/lib/auth/auth-session"
import { editRunRoute } from "@/lib/constants/routes"
import { getRunAction } from "./_actions/get-run-action"
import { DeleteRunButton } from "./_components/delete-run-button"
import { RunProfileChart } from "./_components/run-profile-chart"

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
        <RunCardHeader
          run={run}
          prs={run.personalRecords.map((pr) => pr.distance)}
        />
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
            <Button variant="ghost" size="sm" asChild>
              <Link href={editRunRoute(run.id)}>Modifier</Link>
            </Button>
            <DeleteRunButton id={run.id} />
          </div>
        </div>
      )}
    </div>
  )
}
