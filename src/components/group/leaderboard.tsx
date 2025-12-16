"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn-ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { useLeaderboard } from "@/lib/api/queries";
import { useLeaderboardStore } from "@/lib/stores/leaderboard-store";
import { Trophy, Medal, Award } from "lucide-react";
import { Badge } from "../shadcn-ui/badge";

const PERIOD_OPTIONS = [
  { value: "7", label: "7j" },
  { value: "30", label: "30j" },
  { value: "90", label: "3m" },
  { value: "365", label: "1an" },
  { value: "all", label: "Tout" },
];

export function LeaderBoard() {
  const { period, setPeriod } = useLeaderboardStore();
  const { data, isLoading, isError } = useLeaderboard({ period, limit: 10 });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
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

  const { leaderboard, currentUser } = data.data;
  const currentUserInTop = leaderboard.find((u) => u.isCurrentUser);

  return (
    <Card>
      <CardHeader className="flex items-end justify-between">
        <div className="space-y-1">
          <CardTitle>
            Classement du groupe
          </CardTitle>
          <CardDescription>
            Basé sur la distance totale
          </CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger>
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2">

        {/* Leaderboard list */}
        <div className="space-y-2">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                user.isCurrentUser
                  ? "border border-primary bg-primary/5"
                  : "border border-transparent hover:bg-accent"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {getRankIcon(user.rank)}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} alt={user.displayUsername || user.name} />
                <AvatarFallback>{getInitials(user.displayUsername || user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-none truncate">
                  {user.displayUsername || user.name}
                  {user.isCurrentUser && (
                    <Badge variant="outline" className="text-xs">Vous</Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.totalRuns === 0 ? (
                    <span className="italic opacity-60">Aucune activité</span>
                  ) : (
                    <>
                      {user.totalDistance} km en {user.totalRuns} course{user.totalRuns > 1 ? "s" : ""}
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Current user position if not in top 10 */}
        {currentUser && !currentUserInTop && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">Votre position</p>
            <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
              <div className="flex h-8 w-8 items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  #{currentUser.rank}
                </span>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.image || undefined} alt={currentUser.displayUsername || currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.displayUsername || currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-none truncate">
                  {currentUser.displayUsername || currentUser.name}
                  <span className="ml-2 text-xs text-primary">(Vous)</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentUser.totalRuns === 0 ? (
                    <span className="italic opacity-60">Aucune activité</span>
                  ) : (
                    <>
                      {currentUser.totalDistance} km • {currentUser.totalRuns} course
                      {currentUser.totalRuns > 1 ? "s" : ""}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {leaderboard.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Aucune activité pour cette période
          </p>
        )}
      </CardContent>
    </Card>
  );
}
