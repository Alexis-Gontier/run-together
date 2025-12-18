"use client"

import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar"
import { useRunDetail } from "@/lib/api/queries/use-run-detail"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcn-ui/alert"
import { AlertCircle, Calendar, Route, Timer, TrendingUp, Mountain, FileText, User } from "lucide-react"
import { formatDistance, formatDuration, formatPace } from "@/lib/utils/run"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/shadcn-ui/badge"
import { authClient } from "@/lib/auth/auth-client"
import Link from "next/link"

type RunDetailContentProps = {
  runId: string
}

export function RunDetailContent({ runId }: RunDetailContentProps) {
  const { data, isLoading, error } = useRunDetail(runId)
  const { data: session } = authClient.useSession()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les détails de la course. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    )
  }

  const run = data.data
  const runDate = new Date(run.date)
  const isCurrentUser = session?.user?.id === run.userId

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate additional metrics
  const averageSpeed = (run.distance / (run.duration / 3600)).toFixed(2) // km/h
  const calories = Math.round(run.distance * 60) // Rough estimate: 60 cal/km

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">
                Course du {format(runDate, "d MMMM yyyy", { locale: fr })}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(runDate, "EEEE 'à' HH:mm", { locale: fr })}
              </p>

              {/* User Info */}
              {!isCurrentUser && (
                <Link
                  href={`/dashboard/profile/${run.userId}`}
                  className="flex items-center gap-2 mt-3 hover:opacity-80 transition-opacity w-fit"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={run.user.image || undefined} alt={run.user.name} />
                    <AvatarFallback className="text-xs">{getInitials(run.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{run.user.name}</p>
                    {run.user.username && (
                      <p className="text-xs text-muted-foreground">@{run.user.username}</p>
                    )}
                  </div>
                </Link>
              )}
            </div>
            {run.stravaId && (
              <Badge variant="outline" className="gap-1">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Strava
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Distance"
          value={formatDistance(run.distance)}
          description="Distance totale parcourue"
          icon={<Route className="h-4 w-4" />}
        />

        <StatCard
          title="Durée"
          value={formatDuration(run.duration)}
          description="Temps total de la course"
          icon={<Timer className="h-4 w-4" />}
        />

        <StatCard
          title="Allure"
          value={formatPace(run.pace)}
          description="Allure moyenne"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <StatCard
          title="Dénivelé"
          value={`${run.elevationGain.toFixed(0)} m`}
          description="Dénivelé positif"
          icon={<Mountain className="h-4 w-4" />}
        />

        <StatCard
          title="Vitesse Moyenne"
          value={`${averageSpeed} km/h`}
          description="Vitesse moyenne"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <StatCard
          title="Calories Estimées"
          value={`${calories} kcal`}
          description="Estimation basée sur la distance"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Notes */}
      {run.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{run.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date de la course</span>
              <span className="font-medium">
                {format(runDate, "d MMMM yyyy à HH:mm", { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ajouté le</span>
              <span className="font-medium">
                {format(new Date(run.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
              </span>
            </div>
            {run.updatedAt !== run.createdAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernière modification</span>
                <span className="font-medium">
                  {format(new Date(run.updatedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
