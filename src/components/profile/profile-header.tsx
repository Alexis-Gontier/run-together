"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar"
import { Card, CardContent } from "@/components/shadcn-ui/card"
import { Badge } from "@/components/shadcn-ui/badge"
import { Mail } from "lucide-react"

type ProfileHeaderProps = {
  name: string
  username?: string | null
  email: string
  image?: string | null
  monthObjectif?: number | null
  isCurrentUser?: boolean
}

export function ProfileHeader({
  name,
  username,
  email,
  image,
  monthObjectif,
  isCurrentUser = false,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  Votre profil
                </Badge>
              )}
            </div>

            {username && (
              <p className="text-sm text-muted-foreground">@{username}</p>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>

            {monthObjectif && (
              <div className="pt-2">
                <Badge variant="secondary">
                  Objectif mensuel : {monthObjectif} km
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
