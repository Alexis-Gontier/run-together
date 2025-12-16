"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { useRecentRuns } from "@/lib/api/queries";
import { formatDistance, formatDuration } from "@/lib/utils/run";
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function RecentActivity() {

  const NB_RUNS = 6;
  const { data, isLoading, isError } = useRecentRuns(NB_RUNS);

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
      addSuffix: true,
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
            {recentRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={run.user.image || undefined} alt={run.user.name} />
                  <AvatarFallback>{getInitials(run.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium leading-none">
                    {run.user.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatDistance(run.distance)}
                    </span>
                    <span>•</span>
                    <span>{formatDuration(run.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatRelativeTime(run.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
