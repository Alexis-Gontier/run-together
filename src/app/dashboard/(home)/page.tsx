import TextHeading from '@/components/ui/text-heading'
import LeaderboardCard from '@/components/card/leaderboard-card'
import RecentActivityCard from '@/components/card/recent-activity-card'
import GithubCalendarCard from '@/components/card/github-calendar-card'
import { Button } from '@/components/shadcn-ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function DashboardPage() {

  return (
    <>
      <div className="flex justify-between items-end">
        <TextHeading
          title="Tableau de bord"
          description="Bienvenue sur votre tableau de bord."
        />
        <Button asChild>
          <Link href="/dashboard/runs/create">
            <Plus />
            Ajouter une course
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <GithubCalendarCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardCard />
        <RecentActivityCard />
      </div>
    </>
  )
}
