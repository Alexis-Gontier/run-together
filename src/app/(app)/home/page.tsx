import { getFeedAction } from "./_actions/get-feed-action"
import { FeedList } from "./_components/feed-list"

export default async function HomePage() {
  const result = await getFeedAction({ limit: 5 })
  const runs = result?.data?.runs ?? []
  const nextCursor = result?.data?.nextCursor ?? null

  return <FeedList initialRuns={runs} initialNextCursor={nextCursor} />
}
