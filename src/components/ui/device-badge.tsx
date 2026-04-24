import { Badge } from "@/components/shadcn-ui/badge"
import type { RunSource } from "@/generated/prisma/enums"

type DeviceBadgeProps = {
  deviceName: string | null
  source?: RunSource
}

export function DeviceBadge({ deviceName, source }: DeviceBadgeProps) {
  if (deviceName) return <Badge variant="outline">{deviceName}</Badge>
  if (source === "STRAVA")
    return (
      <Badge
        variant="outline"
        className="border-orange-500/30 text-orange-600 dark:text-orange-400"
      >
        Strava
      </Badge>
    )
  if (source === "MANUAL") return <Badge variant="outline">Manuel</Badge>
  return null
}
