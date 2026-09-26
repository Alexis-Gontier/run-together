"use client"

import { LogOut, Settings, Shield, User } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import { signOutAction } from "@/lib/actions/auth/sign-out-action"
import { ADMIN_ROUTES, profileRoute, ROUTES } from "@/lib/constants/routes"
import { displayName } from "@/lib/utils/display-name"
import { getInitials } from "@/lib/utils/get-initials"

type UserInfo = {
  name?: string | null
  username?: string | null
  email?: string | null
  image?: string | null
  isAdmin?: boolean
}

export function UserNav({ name, username, email, image, isAdmin }: UserInfo) {
  const [isPending, startTransition] = useTransition()
  const shown = displayName({ username, name })
  const initials = getInitials(shown)
  const displaySub = email ?? null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring lg:justify-start"
        aria-label="Menu du compte"
      >
        <Avatar className="size-8 rounded-lg">
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback className="rounded-lg text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 flex-1 text-left text-sm leading-tight lg:grid">
          <span className="truncate font-medium">{shown}</span>
          {displaySub && (
            <span className="truncate text-muted-foreground text-xs">
              {displaySub}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="truncate">{shown}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {username && (
          <DropdownMenuItem asChild>
            <Link href={profileRoute(username)}>
              <User />
              Mon profil
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={ROUTES.SETTINGS}>
            <Settings />
            Paramètres
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href={ADMIN_ROUTES.USERS}>
              <Shield />
              Administration
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onSelect={() => startTransition(() => signOutAction())}
        >
          <LogOut />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
