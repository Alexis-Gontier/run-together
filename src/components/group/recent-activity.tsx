"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Badge } from "@/components/shadcn-ui/badge";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { useRecentRuns } from "@/lib/api/queries";
import { formatDistance, formatDuration } from "@/lib/utils/run";
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { authClient } from "@/lib/auth/auth-client";

export function RecentActivity() {

  const NB_RUNS = 6;
  const { data, isLoading, isError } = useRecentRuns(NB_RUNS);
  const { data: session } = authClient.useSession();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: false,
      locale: fr,
    });
  };

  if (isLoading) {
    return (
      <p>
        Loading...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p>
        Erreur
      </p>
    );
  }

  const recentRuns = data.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Activités Récentes
        </CardTitle>
        <CardDescription>
          Les {NB_RUNS} dernières courses du groupe
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentRuns.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Aucune activité récente
          </p>
        ) : (
          <div className="space-y-2">
            {recentRuns.map((run) => {
              const isCurrentUser = session?.user && run.user.id === session.user.id;
              return (
              <div
                key={run.id}
                className={`flex justify-between items-center gap-3 rounded-lg p-3 transition-colors ${
                  isCurrentUser
                    ? "border border-primary bg-primary/5"
                    : "border hover:bg-accent"
                }`}
              >
                <Avatar className="size-8">
                  <AvatarImage src={run.user.image || undefined} alt={run.user.displayUsername || run.user.name} />
                  <AvatarFallback>{getInitials(run.user.displayUsername || run.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium leading-none">
                      {run.user.displayUsername || run.user.name}
                    </p>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">Vous</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistance(run.distance)}
                    </span>
                    <span>en</span>
                    <span>{formatDuration(run.duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(run.createdAt)}</span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
