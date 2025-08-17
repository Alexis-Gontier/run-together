import TextHeading from '@/components/ui/text-heading'
import LeaderboardCard from '@/components/card/leaderboard-card'
import RecentActivityCard from '@/components/card/recent-activity-card'
import SignOutButton from '@/components/auth/sign-out-button'

export default function DashboardPage() {

  return (
    <>
      <SignOutButton />
      <TextHeading
        title="Tableau de bord"
        description="Bienvenue sur votre tableau de bord."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardCard />
        <RecentActivityCard />
      </div>
    </>
  )
}
