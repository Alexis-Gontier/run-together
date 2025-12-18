import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { ProfileContent } from '@/components/profile'
import { getRequireUser } from '@/lib/auth/auth-session'

export default async function ProfilePage() {
    const user = await getRequireUser()

    return (
        <>
            <DashboardTextHeading
                title="Mon Profil"
                description="Consultez vos statistiques et vos performances"
            />
            <ProfileContent userId={user.id} isCurrentUser={true} />
        </>
    )
}
