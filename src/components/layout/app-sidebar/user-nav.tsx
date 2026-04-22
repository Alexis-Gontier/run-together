"use client"

import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import { profileRoute } from "@/lib/constants/routes"
import { getInitials } from "@/lib/utils/get-initials"

type UserInfo = {
  name?: string | null
  username?: string | null
  email?: string | null
  image?: string | null
}

export function UserNav({ name, username, email, image }: UserInfo) {
  const initials = name ? getInitials(name) : "?"
  const displayName = name ?? "—"
  const displaySub = username ? `@${username}` : (email ?? null)
  const href = username ? profileRoute(username) : "#"

  return (
    <Link
      href={href}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-colors outline-none hover:bg-accent lg:justify-start"
    >
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="rounded-lg text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="hidden min-w-0 flex-1 text-left text-sm leading-tight lg:grid">
        <span className="truncate font-medium">{displayName}</span>
        {displaySub && (
          <span className="truncate text-xs text-muted-foreground">
            {displaySub}
          </span>
        )}
      </div>
    </Link>
  )
}
