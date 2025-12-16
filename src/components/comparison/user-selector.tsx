"use client";

import { useUsers } from "@/lib/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { Label } from "@/components/shadcn-ui/label";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { User } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

export function UserSelector() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [selectedUserIds, setSelectedUserIds] = useQueryState(
    "userIds",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const { data, isLoading, isError } = useUsers();

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
      <p>
        Loading...
      </p>
    );
  }

  if (isError) {
    return (
      <p>
        Erreur
      </p>
    );
  }

  const users = data?.data || [];
  const selectedCount = selectedUserIds.length;

  // Trier pour mettre le current user en premier
  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

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
        {/* Users list */}
        <div className="max-h-[400px] overflow-y-auto pr-2 grid grid-cols-3 gap-4">
          {sortedUsers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8 col-span-4">
              Aucun utilisateur trouvé
            </p>
          ) : (
            sortedUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              const isMaxReached = selectedUserIds.length >= 10 && !isSelected;
              const isCurrentUser = user.id === currentUserId;

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
                    <Avatar className={`h-10 w-10 ${isCurrentUser ? "ring-2 ring-primary/20" : ""}`}>
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback className={isCurrentUser ? "bg-primary/10" : ""}>
                        {isCurrentUser ? <User className="h-5 w-5" /> : getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium leading-none">
                        {user.name} {isCurrentUser && <span className="text-primary">(Moi)</span>}
                      </p>
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
