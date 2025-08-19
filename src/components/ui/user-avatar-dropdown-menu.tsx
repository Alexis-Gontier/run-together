import { Avatar } from '@/components/shadcn-ui/avatar'
import { getUser } from '@/lib/auth-server'
import { AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import SignOutButton from '@/components/auth/sign-out-button'

export default async function UserAvatarMenu() {

    const user = await getUser()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className="cursor-pointer hover:outline-2 outline-offset-1 outline-primary">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>
                        {user?.username?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-46"
                align="end"
            >
                <DropdownMenuItem asChild>
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}