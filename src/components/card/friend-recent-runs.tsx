import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { Activity } from "lucide-react"

export default function FriendRecentRuns() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Activity size={16} />
            Courses Récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="space-y-2">
            <FriendRecentRunsItem />
            <FriendRecentRunsItem />
            <FriendRecentRunsItem />
            <FriendRecentRunsItem />
            <FriendRecentRunsItem />
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export function FriendRecentRunsItem() {
    return (
        <div className="p-3 bg-accent/30 border border-border rounded-lg flex justify-between items-center gap-2">
            <div>
                <p>15/01/2024</p>
                <p>Parc de la Villette</p>
            </div>
            <div className="flex gap-4">
                <p>8.5 km</p>
                <p>5:12 min/km</p>
                <p>44:12</p>
            </div>
        </div>
    )
}