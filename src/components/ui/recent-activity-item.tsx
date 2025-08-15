import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn-ui/avatar'
import { fr } from 'date-fns/locale'
import { formatDistanceToNow } from 'date-fns'
import { getUser } from '@/lib/auth-server'
import { Run } from '@prisma/client'
import { Badge } from '../shadcn-ui/badge'
import Link from 'next/link'
import { formatSecondsToHMS } from "@/utils/date"

interface RecentActivityItemProps {
  run: Run & {
    user: {
      id: string;
      image?: string | null;
      displayUsername: string;
    };
  };
}

export default async function RecentActivityItem({ run } : RecentActivityItemProps) {

    const currentUser = await getUser()

  return (
    <Link href={`/dashboard/runs/${run.id}`} className="">
      <div className={`bg-secondary p-3 rounded-md flex items-start gap-4 outline-offset-2 border-primary hover:outline-2 ${currentUser?.id === run.user.id ? 'border-2' : ''}`}>
          <Avatar>
              <AvatarImage src={run.user.image || ""} />
              <AvatarFallback>
                  {run.user.displayUsername.charAt(0).toUpperCase()}
              </AvatarFallback>
          </Avatar>
          <div className="w-full flex items-center justify-between">
              <div>
                  <h3 className="font-semibold flex items-center gap-2">
                      {run.user.displayUsername}
                      {currentUser?.id === run.user.id && <Badge variant="outline">Vous</Badge>}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                      {run.distance} km en {formatSecondsToHMS(run.duration)}
                  </p>
              </div>
              <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(run.date), { locale: fr }) === "moins d'une minute" ||
                  new Date(run.date).toDateString() === new Date().toDateString()
                    ? "aujourd'hui"
                    : `il y a ${formatDistanceToNow(new Date(run.date), { locale: fr })}`
                  }
              </p>
          </div>
      </div>
    </Link>
  )
}