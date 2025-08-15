import {
    Card,
    CardContent
} from '@/components/shadcn-ui/card'
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/shadcn-ui/avatar"
import { prisma } from '@/lib/prisma'
import { Separator } from '@/components/shadcn-ui/separator'
import Link from 'next/link'

export default async function page() {
  const users = await prisma.user.findMany({

  })

  return (
    <div className="grid grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id}>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={user.image || '/default-avatar.png'} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{user.displayUsername}</h3>
                            <p className="text-sm text-muted-foreground">Niveau 2</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Distance totale: 10 km
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Temps de course: 1h 30min
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Nombre de courses: 5
                        </p>
                    </div>
                    <Link href={`/dashboard/friends/${user.displayUsername}`}>
                        Voir le profil
                    </Link>
                </CardContent>
          </Card>
        ))}
    </div>
  )
}
