import TextHeading from "@/components/ui/text-heading";
import { getRuns } from "@/actions/run/get-runs.action";
import RunTable from "@/components/ui/run-table";
import { Button } from "@/components/shadcn-ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import ExportButtons from "@/components/ui/export-button";

export default async function RunsPage() {

  const runs = await getRuns();

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
      <code>
        <pre>
          {JSON.stringify(runs, null, 2)}
        </pre>
      </code>
    </>
  )
}
