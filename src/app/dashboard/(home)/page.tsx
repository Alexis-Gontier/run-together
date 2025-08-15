import { Suspense } from 'react'
import Leaderboard from '@/components/ui/leaderboard'

import SignOutButton from '@/components/auth/sign-out-button'
import LeaderboardSkeleton from '@/components/skeleton/leaderboard-skeleton'
import RecentActivity from '@/components/ui/recent-activity'

export default function DashboardPage() {

  return (
    <>
      <SignOutButton />
      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<LeaderboardSkeleton />}>
          <Leaderboard />
        </Suspense>
        <Suspense fallback={<LeaderboardSkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </>
  )
}
