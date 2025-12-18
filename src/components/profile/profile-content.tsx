"use client"

import { ProfileHeader, ProfileStats, ProfileCalendar, ProfilePersonalRecords } from "@/components/profile"
import { useUserProfile } from "@/lib/api/queries/use-user-profile"
import { useUserCalendar } from "@/lib/api/queries/use-user-calendar"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn-ui/alert"
import { AlertCircle } from "lucide-react"

type ProfileContentProps = {
  userId: string
  isCurrentUser?: boolean
}

export function ProfileContent({ userId, isCurrentUser = false }: ProfileContentProps) {
  const currentYear = new Date().getFullYear()
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile(userId)
  const { data: calendarData, isLoading: calendarLoading, error: calendarError } = useUserCalendar(userId, currentYear)

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (profileError || !profileData?.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger le profil utilisateur. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    )
  }

  const user = profileData.data

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={user.name}
        username={user.username || user.displayUsername}
        email={user.email}
        image={user.image}
        monthObjectif={user.monthObjectif}
        isCurrentUser={isCurrentUser}
      />

      <ProfileStats stats={user.stats} monthObjectif={user.monthObjectif} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {calendarLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : calendarError || !calendarData?.data ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Impossible de charger le calendrier d&apos;activité.
              </AlertDescription>
            </Alert>
          ) : (
            <ProfileCalendar
              calendar={calendarData.data.calendar}
              year={currentYear}
              totalRuns={calendarData.data.stats.totalRuns}
              userName={user.name}
            />
          )}
        </div>

        <div>
          <ProfilePersonalRecords stats={user.stats} />
        </div>
      </div>
    </div>
  )
}
