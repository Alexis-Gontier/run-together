import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/shadcn-ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { ROUTES } from "@/lib/constants/routes"
import { getInitials } from "@/lib/utils/get-initials"

type ProfileHeaderProps = {
  name: string
  username: string
  displayUsername: string | null
  image: string | null
  createdAt: Date
  isOwnProfile: boolean
}

export function ProfileHeader({
  name,
  username,
  displayUsername,
  image,
  createdAt,
  isOwnProfile,
}: ProfileHeaderProps) {
  const joinedAt = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(createdAt)

  const handle = displayUsername ?? username

  return (
    <div>
      {/* Cover */}
      <Skeleton className="h-44 w-full rounded-none" />

      {/* Avatar row */}
      <div className="flex items-end justify-between px-5 pb-3">
        <Avatar className="-mt-15 size-30 border-4 border-background shadow-md">
          <AvatarImage src={image ?? undefined} alt={name} />
          <AvatarFallback className="text-2xl font-bold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer"
          >
            <Link href={ROUTES.SETTINGS}>Modifier le profil</Link>
          </Button>
        )}
      </div>

      {/* Identity */}
      <div className="px-5">
        <h1 className="text-xl font-black tracking-tight">{name}</h1>
        <p className="text-sm text-muted-foreground">@{handle}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            Inscrit en {joinedAt}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-5 pb-4 text-sm">
          <span>
            <strong className="font-bold text-foreground">0</strong>{" "}
            <span className="text-muted-foreground">courses</span>
          </span>
          <span>
            <strong className="font-bold text-foreground">0 km</strong>{" "}
            <span className="text-muted-foreground">parcourus</span>
          </span>
        </div>
      </div>
    </div>
  )
}
