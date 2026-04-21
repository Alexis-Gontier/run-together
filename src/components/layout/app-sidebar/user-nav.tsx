"use client"

import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import { authClient } from "@/lib/auth/auth-client"
import { AUTH_ROUTES, ROUTES, profileRoute } from "@/lib/constants/routes"
import { getInitials } from "@/lib/utils/get-initials"

type UserInfo = {
  name?: string | null
  username?: string | null
  email?: string | null
  image?: string | null
}

function UserAvatar({ name, image }: Pick<UserInfo, "name" | "image">) {
  const initials = name ? getInitials(name) : "?"
  return (
    <Avatar className="size-8 rounded-lg">
      <AvatarImage src={image ?? undefined} />
      <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
    </Avatar>
  )
}

function UserNavTrigger({
  name,
  username,
  email,
  image,
  ref,
  ...props
}: UserInfo & { ref?: React.Ref<HTMLButtonElement> }) {
  const displayName = name ?? "—"
  const displaySub = username ? `@${username}` : (email ?? null)

  return (
    <button
      ref={ref}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-colors outline-none hover:bg-accent lg:justify-start"
      {...props}
    >
      <UserAvatar name={name} image={image} />
      <div className="hidden min-w-0 flex-1 text-left text-sm leading-tight lg:grid">
        <span className="truncate font-medium">{displayName}</span>
        {displaySub && (
          <span className="truncate text-xs text-muted-foreground">
            {displaySub}
          </span>
        )}
      </div>
      <ChevronsUpDown className="ml-auto hidden size-4 shrink-0 text-muted-foreground lg:block" />
    </button>
  )
}

function UserNavLogout() {
  const router = useRouter()

  function handleLogout() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push(AUTH_ROUTES.LOGIN),
      },
    })
  }

  return (
    <DropdownMenuItem
      variant="destructive"
      className="cursor-pointer"
      onClick={handleLogout}
    >
      <LogOut />
      Se déconnecter
    </DropdownMenuItem>
  )
}

function UserNavMenu({ username }: Pick<UserInfo, "username">) {
  return (
    <DropdownMenuContent side="top" align="start" className="w-56">
      {username && (
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={profileRoute(username)}>
            <User />
            Profil
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem asChild className="cursor-pointer">
        <Link href={ROUTES.SETTINGS}>
          <Settings />
          Paramètres
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <UserNavLogout />
    </DropdownMenuContent>
  )
}

export function UserNav(props: UserInfo) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserNavTrigger {...props} />
      </DropdownMenuTrigger>
      <UserNavMenu username={props.username} />
    </DropdownMenu>
  )
}
