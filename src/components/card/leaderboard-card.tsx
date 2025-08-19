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
import { useEffect, useState } from "react"
import { Badge } from "../shadcn-ui/badge"
import { Skeleton } from "../shadcn-ui/skeleton"

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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        // await new Promise((resolve) => setTimeout(resolve, 2000))
        const res = await api("/users/leaderboard", { params: { days: selectedDays } })
        const payload = res as {
          success: boolean
          userId: string
          data: LeaderboardUser[]
        }
        setData(payload.data || [])
        setCurrentUserId(payload.userId)
      } catch (err) {
        console.error("Leaderboard fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
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
            <SelectItem value="90">90 J</SelectItem>
            <SelectItem value="365">365 J</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-17 w-full" />
            <Skeleton className="h-17 w-full" />
            <Skeleton className="h-17 w-full" />
            <Skeleton className="h-17 w-full" />
          </>
        ) : (
          data.map((user, index) => (
            <LeaderboardItem
              key={user.id}
              user={user}
              rank={index + 1}
              isCurrentUser={user.id === currentUserId}
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
          <div className="uppercase flex items-center justify-center size-8 rounded-full bg-background text-secondary-foreground font-semibold">
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
        <span className="text-muted-foreground font-bold">
          {user.totalDistance.toFixed(2)} km
        </span>
      </div>
    </div>
  )
}