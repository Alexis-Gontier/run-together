import FriendRecentRuns from '@/components/card/friend-recent-runs'
import { Button } from '@/components/shadcn-ui/button'
import StatCard from '@/components/ui/stat-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function page() {
  return (
    <>
      <Button
        variant="outline"
        asChild
      >
        <Link href={`/dashboard/friends`}>
          <ArrowLeft />
          Retour
        </Link>
      </Button>
      <div className="flex items-center gap-4">
        <div className="bg-primary uppercase font-bold size-12 rounded-full flex items-center justify-center">
          A
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-2xl">Algont</p>
          <p className="text-muted-foreground text-sm">Dernier activité : il y a 2 jours</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Nombre de courses"
          value="10"
          description="Nombre total de courses effectuées"
        />
        <StatCard
          title="Distance total"
          value="42 km"
          description="Distance totale parcourue"
        />
        <StatCard
          title="Allure moyenne"
          value="5:30 min/km"
          description="Allure moyenne en min/km"
        />
        <StatCard
          title="Temps Total"
          value="2h 30m"
          description="Temps total passé à courir"
        />
      </div>
      <FriendRecentRuns />
    </>
  )
}
