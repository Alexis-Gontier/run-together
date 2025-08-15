import { getUser } from "@/lib/auth-server";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn-ui/avatar";
import { Badge } from "../shadcn-ui/badge";
import Link from "next/link";

type LeaderboardItemProps = {
    user: {
        id: string;
        image?: string;
        username?: string;
        displayUsername: string;
        runs: { distance: number }[];
        totalDistance: number;
        userRank: number;
    };
}

export async function LeaderboardItem({ user } : LeaderboardItemProps) {

    const currentUser = await getUser()

    return (
        <Link href={`/dashboard/friends/${user.id}`} className="">
            <div className={`bg-secondary p-3 rounded-md flex justify-between items-center border-primary gap-4 outline-offset-2 hover:outline-2 ${currentUser?.id === user.id ? 'border-2' : ''}`}>
                <div className="flex items-center gap-4">
                    <div>
                    # {user.userRank}
                    </div>
                    <Avatar>
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback>
                            {user.username ? user.username.charAt(0).toUpperCase() : null}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.displayUsername}</p>
                            {currentUser?.id === user.id && <Badge variant="outline">Vous</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.runs.length} courses</p>
                    </div>
                </div>
                <div>
                    <p className="text-lg font-semibold">
                        {(user.totalDistance || 0).toFixed(2)} km
                    </p>
                </div>
            </div>
        </Link>
    )
}