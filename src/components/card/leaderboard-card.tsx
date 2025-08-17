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
import { useEffect, useState, useTransition } from "react"

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
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    api("/users/leaderboard", { params: { days: selectedDays } })
      .then((res) => {
        startTransition(() => {
          setData((res as { data: LeaderboardUser[] }).data || [])
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
            <LeaderboardItem key={user.id} user={user} rank={index + 1} />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function LeaderboardItem({
  user,
  rank,
}: {
  user: LeaderboardUser
  rank: number
}) {
  return (
    <div className="p-4 bg-accent/30 border border-border rounded-lg flex justify-between items-center gap-2">
      <div className="flex items-center gap-4">
        <div className="text-primary-foreground font-semibold text-sm">
          #{rank}
        </div>
        <div className="uppercase flex items-center justify-center w-10 h-10 rounded-full bg-background text-secondary-foreground font-semibold">
          {user.displayUsername[0]}
        </div>
        <div className="flex flex-col">
          <span>{user.displayUsername}</span>
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
