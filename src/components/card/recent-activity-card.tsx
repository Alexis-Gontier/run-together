"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { Badge } from "../shadcn-ui/badge"
import { api } from "@/services/api"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"

type Activity = {
  id: string
  distance: number
  duration: number // en secondes
  createdAt: string
  user: {
    id: string
    displayUsername: string
    image: string | null
  }
}

export default function RecentActivityCard() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    api("/recent-activity")
      .then((res) => {
        const payload = res as { userId: string; activities: Activity[] }
        setActivities(payload.activities || [])
        setCurrentUserId(payload.userId)
      })
      .catch((err) => console.error("Recent activity fetch error:", err))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>
          Les dernières activités de votre groupe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune activité récente
          </p>
        ) : (
          activities.map((a) => (
            <RecentActivityItem
              key={a.id}
              activity={a}
              isCurrentUser={a.user.id === currentUserId}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m:${s.toString().padStart(2, "0")}s`
}

function RecentActivityItem({
  activity,
  isCurrentUser,
}: {
  activity: Activity
  isCurrentUser: boolean
}) {
  return (
    <div className="p-3 bg-accent/30 border border-border rounded-lg flex justify-between items-center gap-2">
      <div className="flex items-center gap-4">
        {activity.user.image ? (
          <Image
            src={activity.user.image}
            alt={activity.user.displayUsername}
            width={40}
            height={40}
            className="rounded-full object-cover size-8"
          />
        ) : (
          <div className="uppercase flex items-center justify-center size-8 rounded-full bg-background text-secondary-foreground font-semibold">
            {activity.user.displayUsername?.[0] ?? "?"}
          </div>
        )}
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            {activity.user.displayUsername}
            {isCurrentUser && <Badge variant="outline">Vous</Badge>}
          </span>
          <span className="text-muted-foreground text-xs">
            {activity.distance} km en {formatDuration(activity.duration)}
          </span>
        </div>
      </div>
      <div>
        <span className="font-semibold text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </span>
      </div>
    </div>
  )
}
