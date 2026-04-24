import { runRoute } from "@/lib/constants/routes"
import { FeedCard } from "@/components/ui/feed-card"
import { getFeedAction } from "./_actions/get-feed-action"
import { DebugJson } from "@/components/ui/debug-json"

export default async function HomePage() {
  const result = await getFeedAction({ limit: 5 })
  const runs = result?.data?.runs ?? []

  return (
    <div className="divide-y divide-border">
      {runs.map((run) => (
        <FeedCard key={run.id} href={runRoute(run.id)}>
          <DebugJson data={run} />
        </FeedCard>
      ))}
    </div>
  )
}
