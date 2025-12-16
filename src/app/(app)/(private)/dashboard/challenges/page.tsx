import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { getChallengesAction } from '@/lib/actions/challenges'
import ChallengeCard from '@/components/challenges/challenge-card'

export default async function ChallengesPage() {

    const result = await getChallengesAction()
    const usersWithChallenges = result.data?.success && result.data.data ? result.data.data : []

    return (
        <>
            <DashboardTextHeading
                title="Défis et Gages"
                description="Suivez les défis de chaque participant et leurs gages en cas d'échec"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersWithChallenges.map((user) => (
                    <ChallengeCard key={user.id} user={user} />
                ))}
            </div>
        </>
    )
}
