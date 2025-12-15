"use client";

import { useRunsCompare } from "@/lib/api/queries";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn-ui/table";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils/run";
import { Check } from "lucide-react";
import { UserComparison } from "@/lib/api/schemas";

const COLORS = [
  { bg: "bg-amber-700", text: "text-amber-700", dot: "🟤" },
  { bg: "bg-red-500", text: "text-red-500", dot: "🔴" },
  { bg: "bg-blue-500", text: "text-blue-500", dot: "🔵" },
  { bg: "bg-green-500", text: "text-green-500", dot: "🟢" },
  { bg: "bg-purple-500", text: "text-purple-500", dot: "🟣" },
];

interface MetricRow {
  label: string;
  getValue: (comparison: UserComparison) => number;
  formatValue: (value: number) => string;
  isBestHigher: boolean; // true si la valeur la plus haute est la meilleure
}

const METRICS: MetricRow[] = [
  {
    label: "Distance totale",
    getValue: (c) => c.stats.totalDistance,
    formatValue: (v) => formatDistance(v),
    isBestHigher: true,
  },
  {
    label: "Nombre de courses",
    getValue: (c) => c.stats.totalRuns,
    formatValue: (v) => `${v}`,
    isBestHigher: true,
  },
  {
    label: "Allure moyenne",
    getValue: (c) => c.stats.averagePace,
    formatValue: (v) => formatPace(v),
    isBestHigher: false, // Plus bas = meilleur
  },
  {
    label: "Allure la + rapide",
    getValue: (c) => c.stats.bestPace || Infinity,
    formatValue: (v) => v === Infinity ? "-" : formatPace(v),
    isBestHigher: false,
  },
  {
    label: "Course la + longue",
    getValue: (c) => c.stats.longestRun || 0,
    formatValue: (v) => v === 0 ? "-" : formatDistance(v),
    isBestHigher: true,
  },
  {
    label: "Dénivelé total",
    getValue: (c) => c.stats.totalElevationGain,
    formatValue: (v) => `${v} m`,
    isBestHigher: true,
  },
  {
    label: "Dénivelé moyen",
    getValue: (c) => c.stats.totalRuns > 0 ? c.stats.totalElevationGain / c.stats.totalRuns : 0,
    formatValue: (v) => `${Math.round(v * 10) / 10} m`,
    isBestHigher: true,
  },
  {
    label: "Temps total",
    getValue: (c) => c.stats.totalDuration,
    formatValue: (v) => {
      const hours = Math.floor(v / 3600);
      const minutes = Math.floor((v % 3600) / 60);
      return `${hours}h ${minutes}min`;
    },
    isBestHigher: true,
  },
  {
    label: "Durée moyenne",
    getValue: (c) => c.stats.averageDuration,
    formatValue: (v) => `${Math.round(v / 60)}min`,
    isBestHigher: false, // Plus court peut être meilleur pour certains
  },
  {
    label: "Régularité",
    getValue: (c) => c.stats.runsPerMonth * 12 / 52, // Convertir courses/mois en courses/semaine
    formatValue: (v) => `${(Math.round(v * 10) / 10).toFixed(1)} /sem`,
    isBestHigher: true,
  },
];

export function ComparisonTable() {
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

  const findBestIndex = (values: number[], isBestHigher: boolean) => {
    if (values.length === 0) return -1;
    const validValues = values.filter(v => v !== Infinity && v !== 0);
    if (validValues.length === 0) return -1;

    const bestValue = isBestHigher
      ? Math.max(...validValues)
      : Math.min(...validValues);

    return values.findIndex(v => v === bestValue);
  };

  if (selectedUserIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tableau Comparatif</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Sélectionnez des utilisateurs pour voir le tableau comparatif
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tableau Comparatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tableau Comparatif</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive text-center py-8">
            Erreur lors du chargement du tableau
          </p>
        </CardContent>
      </Card>
    );
  }

  const comparisons = data.data.comparisons;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tableau Comparatif</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] font-semibold">Métrique</TableHead>
                {comparisons.map((comparison, index) => (
                  <TableHead key={comparison.user.id} className="text-center font-semibold">
                    {comparison.user.isCurrentUser && "Vous "}
                    {!comparison.user.isCurrentUser && comparison.user.name}{" "}
                    {COLORS[index % COLORS.length].dot}
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold">Meilleur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {METRICS.map((metric) => {
                const values = comparisons.map((c) => metric.getValue(c));
                const bestIndex = findBestIndex(values, metric.isBestHigher);

                return (
                  <TableRow key={metric.label}>
                    <TableCell className="font-medium">{metric.label}</TableCell>
                    {comparisons.map((comparison, index) => {
                      const value = metric.getValue(comparison);
                      const isBest = index === bestIndex;

                      return (
                        <TableCell key={comparison.user.id} className="text-center">
                          {metric.formatValue(value)}
                          {isBest && value !== 0 && value !== Infinity && (
                            <Check className="inline-block ml-1 h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-medium">
                      {bestIndex !== -1 && comparisons[bestIndex] ? (
                        comparisons[bestIndex].user.isCurrentUser
                          ? "Vous"
                          : comparisons[bestIndex].user.name
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
