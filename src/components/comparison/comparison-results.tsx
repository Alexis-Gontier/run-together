"use client";

import { useRunsCompare } from "@/lib/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { AlertCircle } from "lucide-react";

export function ComparisonResults() {
  const [selectedUserIds] = useQueryState(
    "userIds",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [startDate] = useQueryState("startDate", parseAsString);
  const [endDate] = useQueryState("endDate", parseAsString);

  const { data, isLoading, isError, error } = useRunsCompare(selectedUserIds, {
    startDate,
    endDate,
    enabled: selectedUserIds.length > 0,
  });

  if (selectedUserIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Résultats de la comparaison</CardTitle>
          <CardDescription>
            Sélectionnez au moins un utilisateur pour voir les statistiques de comparaison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>Aucun utilisateur sélectionné</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Résultats de la comparaison</CardTitle>
          <CardDescription>
            Chargement des statistiques pour {selectedUserIds.length} utilisateur
            {selectedUserIds.length > 1 ? "s" : ""}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Résultats de la comparaison</CardTitle>
          <CardDescription className="text-destructive">
            Erreur lors du chargement des statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              {error instanceof Error ? error.message : "Une erreur est survenue"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats de la comparaison</CardTitle>
        <CardDescription>
          Comparaison de {selectedUserIds.length} utilisateur
          {selectedUserIds.length > 1 ? "s" : ""} (Données JSON)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/50 p-4">
          <pre className="overflow-x-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
