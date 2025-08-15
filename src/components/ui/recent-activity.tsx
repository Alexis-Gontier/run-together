import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
 } from '@/components/shadcn-ui/card'
import { Button } from '../shadcn-ui/button'
import Link from 'next/link'
import RecentActivityItem from './recent-activity-item'
import { prisma } from '@/lib/prisma'
import { Run } from '@prisma/client'

export default async function RecentActivity() {

    const runsFromDb = await prisma.run.findMany({
        where: {
            user: {
                isNot: null
            }
        },
        orderBy: {
            date: 'desc'
        },
        take: 5, // Limite les résultats aux 6 plus récents
        include: {
            user: {
                select: {
                    id: true,
                    image: true,
                    displayUsername: true
                }
            }
        }
    })
    
    // Adapter les courses au format attendu par le composant RecentActivityItem
    const runs = runsFromDb.map(run => ({
        ...run,
        user: {
            id: run.user?.id || '',
            image: run.user?.image,
            displayUsername: run.user?.displayUsername || 'Utilisateur'
        }
    } as Run & { user: { id: string; image?: string | null; displayUsername: string } }))

  return (
    <Card>
        <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
                Les dernières activités de votre groupe
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            {runs.map(run => (
                <RecentActivityItem key={run.id} run={run} />
            ))}
        </CardContent>
        {/* <CardFooter className="flex justify-center">
            <Button variant="outline" asChild>
                <Link href="/dashboard/friends">
                    Voir toutes les activités
                </Link>
            </Button>
        </CardFooter> */}
    </Card>
  )
}