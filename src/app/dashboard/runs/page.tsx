import TextHeading from "@/components/ui/text-heading";
import { getRuns } from "@/actions/run/get-runs.action";
import RunTable from "@/components/table/run-table";
import { Button } from "@/components/shadcn-ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import ExportButtons from "@/components/ui/export-button";
import PaginationFilter from "@/components/ui/pagination-filter";

export default async function RunsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {

  const searchParams = await props.searchParams;

  const {
    page,
    pageSize,
  } = searchParams;

  const pageSizeNumber = parseInt(pageSize as string) || 10;
  const pageNumber = parseInt(page as string) || 1;

  const { runs, totalRuns } = await getRuns({
    page: pageNumber,
    pageSize: pageSizeNumber,
  });

  return (
    <>
      <TextHeading
        title="Mes courses"
        description="Voici la liste de mes courses."
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="default"
          className="cursor-pointer"
          asChild
        >
          <Link href="/dashboard/runs/create">
            <Plus />
            Nouvelle course
          </Link>
        </Button>
        <ExportButtons data={runs} />
      </div>
      <RunTable
        runs={runs}
      />
      <PaginationFilter
        total={totalRuns}
        initialPage={pageNumber}
      />
      {/* <code>
        <pre>
          {JSON.stringify({ runs, totalRuns, totalPages }, null, 2)}
        </pre>
      </code> */}
    </>
  );
}