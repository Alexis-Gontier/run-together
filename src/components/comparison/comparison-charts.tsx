"use client";

import { useRunsCompare } from "@/lib/api/queries";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import {
  TotalDistanceChart,
  TotalDurationChart,
  AveragePaceChart,
  ActivityFrequencyChart,
} from "@/components/comparison/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";

export function ComparisonCharts() {
  const [selectedUserIds] = useQueryState(
    "userIds",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [startDate] = useQueryState("startDate", parseAsString);
  const [endDate] = useQueryState("endDate", parseAsString);

  const { data, isLoading, isError } = useRunsCompare(selectedUserIds, {
    startDate,
    endDate,
    enabled: selectedUserIds.length > 0,
  });

  if (selectedUserIds.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distance Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Sélectionnez des utilisateurs pour voir les graphiques
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Durée Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Sélectionnez des utilisateurs pour voir les graphiques
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allure Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Sélectionnez des utilisateurs pour voir les graphiques
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fréquence d&apos;Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Sélectionnez des utilisateurs pour voir les graphiques
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || isError || !data?.data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distance Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {isLoading ? "Chargement..." : "Erreur lors du chargement"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Durée Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {isLoading ? "Chargement..." : "Erreur lors du chargement"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allure Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {isLoading ? "Chargement..." : "Erreur lors du chargement"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fréquence d&apos;Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {isLoading ? "Chargement..." : "Erreur lors du chargement"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const comparisons = data.data.comparisons;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TotalDistanceChart data={comparisons} />
      <TotalDurationChart data={comparisons} />
      <AveragePaceChart data={comparisons} />
      <ActivityFrequencyChart data={comparisons} />
    </div>
  );
}
