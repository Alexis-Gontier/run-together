import { getRuns } from "@/actions/run/get-runs.action";

export default async function RunsPage() {

  const runs = await getRuns();

  return (
    <div>
        <h1>Mes courses</h1>
        <code>
          <pre>
            {JSON.stringify(runs, null, 2)}
          </pre>
        </code>
    </div>
  )
}
