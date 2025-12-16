"use client";

import { RunToolbar } from "@/components/run/run-toolbar";
import { RunTable } from "@/components/run/run-table";
import { RunPagination } from "@/components/run/run-pagination";
import { useRuns } from "@/lib/api/queries";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Skeleton } from "@/components/shadcn-ui/skeleton";

export function RunsPageContent() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));
  const [sortBy] = useQueryState("sortBy", parseAsString.withDefault("date"));
  const [sortOrder] = useQueryState("sortOrder", parseAsString.withDefault("desc"));

  const offset = (page - 1) * pageSize;

  const { data, isLoading, isError } = useRuns({
    limit: pageSize,
    offset,
    sortBy,
    sortOrder,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <RunToolbar />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <RunToolbar />
        <div className="rounded-lg border border-destructive/50 p-8 text-center">
          <p className="text-sm text-destructive">
            Erreur lors du chargement des courses
          </p>
        </div>
      </div>
    );
  }

  const runs = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <RunToolbar />
      <RunTable runs={runs} />
      {total > 0 && <RunPagination totalItems={total} />}
    </div>
  );
}
