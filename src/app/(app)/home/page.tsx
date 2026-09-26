import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { getFeedAction } from "./_actions/get-feed-action"
import { FeedList } from "./_components/feed-list"

export default async function HomePage() {
  const [result, user] = await Promise.all([
    getFeedAction({ limit: 5 }),
    getRequiredUser(),
  ])
  const runs = result?.data?.runs ?? []
  const nextCursor = result?.data?.nextCursor ?? null

  return (
    <>
      {/* Le panneau droit est masqué sous lg : « Ma semaine » remonte en tête du fil. */}
      <div className="border-b p-4 lg:hidden">
        <WeekSummaryCard userId={user.id} />
      </div>
      <FeedList initialRuns={runs} initialNextCursor={nextCursor} />
    </>
  )
}
