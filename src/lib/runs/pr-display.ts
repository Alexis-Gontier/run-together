import { PRDistance } from "@/generated/prisma/enums"

export const PR_DISTANCE_LABELS: Record<PRDistance, string> = {
  KM_1: "1 km",
  KM_5: "5 km",
  KM_10: "10 km",
  HALF_MARATHON: "Semi",
  MARATHON: "Marathon",
}

export const PR_DISTANCE_ORDER: PRDistance[] = [
  PRDistance.KM_1,
  PRDistance.KM_5,
  PRDistance.KM_10,
  PRDistance.HALF_MARATHON,
  PRDistance.MARATHON,
]
