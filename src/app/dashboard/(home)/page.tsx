import TextHeading from '@/components/ui/text-heading'
import LeaderboardCard from '@/components/card/leaderboard-card'
import RecentActivityCard from '@/components/card/recent-activity-card'

export default function DashboardPage() {

  return (
    <>
      <TextHeading
        title="Tableau de bord"
        description="Bienvenue sur votre tableau de bord."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeaderboardCard />
        <RecentActivityCard />
      </div>
      {/* <SignOutButton /> */}
      {/* <div className="grid grid-cols-2 gap-4"> */}
        {/* <Suspense fallback={<LeaderboardSkeleton />}>
          <Leaderboard />
        </Suspense> */}
        {/* <Suspense fallback={<LeaderboardSkeleton />}>
          <RecentActivity />
        </Suspense> */}
      {/* </div> */}
    </>
  )
}
