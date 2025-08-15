import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
 } from '@/components/shadcn-ui/card'
import { LeaderboardItem } from './leaderboard-item'
import { prisma } from '@/lib/prisma'
import LeaderboardSelect from './leaderboard-select'

export default async function Leaderboard() {

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const usersFromDb = await prisma.user.findMany({
        include: {
            runs: {
                where: {
                    date: {
                        gte: thirtyDaysAgo
                    }
                }
            }
        }
    })

    // Map users to include totalDistance property
    const usersWithDistance = usersFromDb.map(user => ({
        ...user,
        image: user.image ?? undefined, // Ensure image is string | undefined
        username: user.username ?? undefined, // Ensure username is string | undefined
        displayUsername: user.username ?? 'Utilisateur', // Provide displayUsername
        totalDistance: user.runs.reduce((acc, run) => acc + run.distance, 0),
        runs: user.runs.map(run => ({
            distance: run.distance
        }))
    }))
    // Sort users by totalDistance descending and assign rank
    const users = usersWithDistance
        .sort((a, b) => b.totalDistance - a.totalDistance)
        .map((user, index) => ({
            ...user,
            userRank: index + 1
        }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Classement du Groupe</CardTitle>
                <CardDescription className="flex items-center justify-between gap-2">
                    <span>Distance totale parcourue par chaque membre du groupe</span>
                    <LeaderboardSelect />
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {users
                    .sort((a, b) => b.totalDistance - a.totalDistance)
                    .map((user) => (
                        <LeaderboardItem key={user.id} user={user} />
                    ))}
            </CardContent>
        </Card>
    )
}

