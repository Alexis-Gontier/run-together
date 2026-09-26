import { Camera, Settings, Swords } from "lucide-react"
import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { Button } from "@/components/shadcn-ui/button"
import { ProfileImageDialog } from "@/components/ui/profile-image-dialog"
import { compareRoute, ROUTES } from "@/lib/constants/routes"
import { getInitials } from "@/lib/utils/get-initials"
import { formatRunDistance } from "@/lib/utils/run"

type ProfileHeaderProps = {
  username: string
  displayUsername: string | null
  image: string | null
  bannerImage: string | null
  isOwnProfile: boolean
  canEditImages: boolean
  runsCount: number
  totalDistance: number
}

export function ProfileHeader({
  username,
  displayUsername,
  image,
  bannerImage,
  isOwnProfile,
  canEditImages,
  runsCount,
  totalDistance,
}: ProfileHeaderProps) {
  const handle = displayUsername ?? username

  return (
    <div>
      {/* Bannière (3:1), dégradé par défaut */}
      <div className="relative aspect-3/1 max-h-56 w-full overflow-hidden bg-linear-to-br from-emerald-500/30 via-muted to-muted">
        {bannerImage && (
          // biome-ignore lint/performance/noImgElement: URL Vercel Blob déjà redimensionnée
          <img src={bannerImage} alt="" className="size-full object-cover" />
        )}
        {canEditImages && (
          <ProfileImageDialog kind="banner" currentUrl={bannerImage}>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 cursor-pointer bg-background/70 backdrop-blur"
            >
              <Camera />
              Bannière
            </Button>
          </ProfileImageDialog>
        )}
      </div>

      {/* Avatar row */}
      <div className="flex items-end justify-between px-5 pb-3">
        <div className="relative -mt-15">
          <Avatar className="size-30 border-4 border-background shadow-md">
            <AvatarImage src={image ?? undefined} alt={handle} />
            <AvatarFallback className="font-bold text-2xl">
              {getInitials(handle)}
            </AvatarFallback>
          </Avatar>
          {canEditImages && (
            <ProfileImageDialog kind="avatar" currentUrl={image}>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-1 bottom-1 size-8 cursor-pointer rounded-full border-2 border-background"
                aria-label="Changer la photo de profil"
              >
                <Camera />
              </Button>
            </ProfileImageDialog>
          )}
        </div>
        {!isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer"
          >
            <Link href={compareRoute(username)}>
              <Swords />
              Me comparer
            </Link>
          </Button>
        )}
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer"
          >
            <Link href={ROUTES.SETTINGS}>
              <Settings />
              Paramètres
            </Link>
          </Button>
        )}
      </div>

      {/* Identity */}
      <div className="px-5">
        <h1 className="font-black text-xl tracking-tight">{handle}</h1>

        {/* Stats */}
        <div className="mt-4 flex gap-5 pb-4 text-sm">
          <span>
            <strong className="font-bold text-foreground">{runsCount}</strong>{" "}
            <span className="text-muted-foreground">courses</span>
          </span>
          <span>
            <strong className="font-bold text-foreground">
              {formatRunDistance(totalDistance)} km
            </strong>{" "}
            <span className="text-muted-foreground">parcourus</span>
          </span>
        </div>
      </div>
    </div>
  )
}
