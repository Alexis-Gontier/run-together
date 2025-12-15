"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn-ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { useLeaderboard } from "@/lib/api/queries";
import { useLeaderboardStore } from "@/lib/stores/leaderboard-store";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "7", label: "7 jours" },
  { value: "30", label: "30 jours" },
  { value: "90", label: "3 mois" },
  { value: "365", label: "1 an" },
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Classement du Groupe
          </CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Classement du Groupe
          </CardTitle>
          <CardDescription className="text-destructive">
            Erreur lors du chargement du classement
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { leaderboard, currentUser, totalUsers } = data.data;
  const currentUserInTop = leaderboard.find((u) => u.isCurrentUser);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Classement du Groupe
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {totalUsers} membre{totalUsers > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period selector */}
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

        {/* Leaderboard list */}
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                user.isCurrentUser
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-transparent hover:bg-accent"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {getRankIcon(user.rank)}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-none truncate">
                  {user.name}
                  {user.isCurrentUser && (
                    <span className="ml-2 text-xs text-primary">(Vous)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.totalRuns === 0 ? (
                    <span className="italic opacity-60">Aucune activité</span>
                  ) : (
                    <>
                      {user.totalDistance} km • {user.totalRuns} course{user.totalRuns > 1 ? "s" : ""}
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
                <AvatarImage src={currentUser.image || undefined} alt={currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-none truncate">
                  {currentUser.name}
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
