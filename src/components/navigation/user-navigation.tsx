"use client"

import { authClient } from "@/lib/auth/auth-client"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/shadcn-ui/avatar"
import { EllipsisVertical } from "lucide-react"

export function UserNavigation() {
    const { data: session, isPending } = authClient.useSession()

    if (isPending) {
        return (
            <Skeleton className="w-full h-full" />
        )
    }

    if (!session?.user) {
        return null
    }

    const initials = (session.user.displayUsername ?? "")
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="h-full flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
            <Avatar className="h-8 w-8 rounded-sm">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="rounded-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {session.user.displayUsername}
                </span>
                <span className="truncate text-muted-foreground text-xs">
                    {session.user.email}
                </span>
            </div>
            <EllipsisVertical className="ml-auto size-4" />
        </div>
    )
}