"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"
import { useLeaderboardStore } from "@/stores/leaderboard.store"

export default function LeaderboardSelect() {
  const { selectedDays, setSelectedDays } = useLeaderboardStore()

  return (
    <Select value={selectedDays} onValueChange={setSelectedDays}>
      <SelectTrigger className="w-30">
        <SelectValue placeholder="Filtrer par activité récente" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">7 J</SelectItem>
        <SelectItem value="30">30 J</SelectItem>
        <SelectItem value="365">365 J</SelectItem>
      </SelectContent>
    </Select>
  )
}
