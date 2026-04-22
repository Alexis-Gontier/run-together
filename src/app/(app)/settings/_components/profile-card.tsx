import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { getInitials } from "@/lib/utils/get-initials"

type ProfileCardProps = {
  name: string
  email: string
  username: string | null | undefined
  image: string | null | undefined
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function ProfileCard({
  name,
  email,
  username,
  image,
}: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profil</CardTitle>
        <CardDescription>Informations de votre compte.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={image ?? undefined} alt={name} />
            <AvatarFallback className="text-base">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name}</p>
            {username && (
              <p className="text-sm text-muted-foreground">@{username}</p>
            )}
          </div>
        </div>
        <div className="divide-y divide-border rounded-lg border px-4">
          <ProfileRow label="Nom" value={name} />
          {username && (
            <ProfileRow label="Nom d'utilisateur" value={`@${username}`} />
          )}
          <ProfileRow label="Email" value={email} />
        </div>
      </CardContent>
    </Card>
  )
}
