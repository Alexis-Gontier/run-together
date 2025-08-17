"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"
import { api } from "@/services/api"
import { useLeaderboardStore } from "@/stores/leaderboard.store"
import Image from "next/image"
import { useEffect, useState, useTransition } from "react"
import { Badge } from "../shadcn-ui/badge"

type LeaderboardUser = {
  id: string
  image: string | null
  displayUsername: string
  totalDistance: number
  numberOfRuns: number
}

export default function LeaderboardCard() {
  const { selectedDays, setSelectedDays } = useLeaderboardStore()
  const [data, setData] = useState<LeaderboardUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    api("/users/leaderboard", { params: { days: selectedDays } })
      .then((res) => {
        startTransition(() => {
          const payload = res as {
            success: boolean
            userId: string
            data: LeaderboardUser[]
          }
          setData(payload.data || [])
          setCurrentUserId(payload.userId) // ✅ on stocke le user courant
        })
      })
      .catch((err) => console.error("Leaderboard fetch error:", err))
  }, [selectedDays])

  return (
    <Card>
      <CardHeader className="flex justify-between items-end">
        <div className="space-y-2">
          <CardTitle>Classement du Groupe</CardTitle>
          <CardDescription>
            Distance totale parcourue par chaque membre du groupe
          </CardDescription>
        </div>
        <Select value={selectedDays} onValueChange={setSelectedDays}>
          <SelectTrigger className="w-30 cursor-pointer">
            <SelectValue placeholder="Filtrer par activité récente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 J</SelectItem>
            <SelectItem value="30">30 J</SelectItem>
            <SelectItem value="365">365 J</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2">
        {isPending ? (
          <p>Loading...</p>
        ) : (
          data.map((user, index) => (
            <LeaderboardItem
              key={user.id}
              user={user}
              rank={index + 1}
              isCurrentUser={user.id === currentUserId} // ✅ check correct
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function LeaderboardItem({
  user,
  rank,
  isCurrentUser,
}: {
  user: LeaderboardUser
  rank: number
  isCurrentUser: boolean
}) {
  return (
    <div className="p-3 bg-accent/30 border border-border rounded-lg flex justify-between items-center gap-2">
      <div className="flex items-center gap-4">
        <div className="text-primary-foreground font-semibold text-sm">
          #{rank}
        </div>
        {user.image ? (
          <Image
            src={user.image}
            alt={user.displayUsername}
            width={40}
            height={40}
            className="rounded-full object-cover size-8"
          />
        ) : (
          <div className="uppercase flex items-center justify-center size-10 rounded-full bg-background text-secondary-foreground font-semibold">
            {user.displayUsername[0]}
          </div>
        )}
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            {user.displayUsername}
            {isCurrentUser && <Badge variant="outline">Vous</Badge>}
          </span>
          <span className="text-muted-foreground text-xs">
            {user.numberOfRuns} course{user.numberOfRuns > 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div>
        <span className="text-primary font-bold">
          {user.totalDistance.toFixed(2)} km
        </span>
      </div>
    </div>
  )
}
