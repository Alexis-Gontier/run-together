"use client"

import { authClient } from "@/lib/auth/auth-client"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/shadcn-ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import { EllipsisVertical, LogOut, Settings } from "lucide-react"
import { SidebarMenuButton } from "@/components/shadcn-ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function UserNavigation() {

    const router = useRouter()
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

    const hanfleSignOut = () => {
        const toastId = toast.loading("Signing out...")
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Signed out successfully.", { id: toastId })
                    router.replace("/")
                },
                onError: () => {
                    toast.error("There was an error signing out. Please try again.", { id: toastId })
                }
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                >
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
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                // side="right"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuItem
                    className="cursor-pointer"
                    asChild
                >
                    <Link href="/dashboard/settings">
                        <Settings />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onSelect={hanfleSignOut}
                >
                    <LogOut />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}