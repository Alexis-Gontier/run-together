import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { ProfileContent } from '@/components/profile'
import { getRequireUser } from '@/lib/auth/auth-session'
import { notFound } from 'next/navigation'

type ProfileUserPageProps = {
    params: Promise<{
        userId: string
    }>
}

export default async function ProfileUserPage({ params }: ProfileUserPageProps) {
    const { userId } = await params
    const currentUser = await getRequireUser()

    if (!userId) {
        notFound()
    }

    const isCurrentUser = currentUser.id === userId

    return (
        <>
            <DashboardTextHeading
                title={isCurrentUser ? "Mon Profil" : "Profil Utilisateur"}
                description={isCurrentUser ? "Consultez vos statistiques et vos performances" : "Consultez les statistiques et les performances de cet utilisateur"}
            />
            <ProfileContent userId={userId} isCurrentUser={isCurrentUser} />
        </>
    )
}
