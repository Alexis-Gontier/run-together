"use client";

import { useUsers } from "@/lib/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { Label } from "@/components/shadcn-ui/label";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Input } from "@/components/shadcn-ui/input";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { Search, User } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

export function UserSelector() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [selectedUserIds, setSelectedUserIds] = useQueryState(
    "userIds",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useUsers({
    search: searchQuery || undefined,
  });

  const currentUserId = session?.user?.id;

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      if (selectedUserIds.length >= 10) {
        return;
      }
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || isSessionLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner des membres à comparer</CardTitle>
          <CardDescription>Chargement des utilisateurs...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
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

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner des membres à comparer</CardTitle>
          <CardDescription className="text-destructive">
            Erreur lors du chargement des utilisateurs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const users = data?.data || [];
  const selectedCount = selectedUserIds.length;
  const currentUser = users.find((u) => u.id === currentUserId);
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const isCurrentUserSelected = currentUserId ? selectedUserIds.includes(currentUserId) : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sélectionner des membres à comparer</CardTitle>
        <CardDescription>
          {selectedCount === 0
            ? `Liste des utilisateurs (${users.length} membres)`
            : `${selectedCount} utilisateur${selectedCount > 1 ? "s" : ""} sélectionné${selectedCount > 1 ? "s" : ""} (max 10)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current user card */}
        {currentUser && (
          <div
            className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
              isCurrentUserSelected
                ? "border-primary bg-primary/10"
                : "border-dashed hover:bg-accent"
            }`}
          >
            <Checkbox
              id={`user-${currentUser.id}`}
              checked={isCurrentUserSelected}
              onCheckedChange={() => handleToggleUser(currentUser.id)}
              disabled={selectedUserIds.length >= 10 && !isCurrentUserSelected}
            />
            <Label
              htmlFor={`user-${currentUser.id}`}
              className="flex flex-1 cursor-pointer items-center gap-3"
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={currentUser.image || undefined} alt={currentUser.name} />
                <AvatarFallback className="bg-primary/10">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium leading-none">
                  {currentUser.name} <span className="text-primary">(Moi)</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentUser.username && `@${currentUser.username} • `}
                  {currentUser.totalRuns} course{currentUser.totalRuns !== 1 ? "s" : ""}
                </p>
              </div>
            </Label>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Other users list */}
        <div className="max-h-[400px] overflow-y-auto pr-2 grid grid-cols-4 gap-4">
          {otherUsers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8 col-span-4">
              Aucun autre utilisateur trouvé
            </p>
          ) : (
            otherUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              const isMaxReached = selectedUserIds.length >= 10 && !isSelected;

              return (
                <div
                  key={user.id}
                  className={`h-full flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  } ${isMaxReached ? "opacity-50" : ""}`}
                >
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggleUser(user.id)}
                    disabled={isMaxReached}
                  />
                  <Label
                    htmlFor={`user-${user.id}`}
                    className="flex flex-1 cursor-pointer items-center gap-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.username && `@${user.username} • `}
                        {user.totalRuns} course{user.totalRuns !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Label>
                </div>
              );
            })
          )}
        </div>

        {selectedCount >= 10 && (
          <p className="text-sm text-muted-foreground text-center">
            Vous avez atteint la limite de 10 utilisateurs
          </p>
        )}
      </CardContent>
    </Card>
  );
}
