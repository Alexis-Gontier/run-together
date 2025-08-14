import { getRunById } from '@/actions/run/get-run-by-id.action';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RunByIdPage({ params }: PageProps) {

  const { id } = await params;
  const run = await getRunById(id);

  return (
    <div>
      Run Details for {id}
      <pre>{JSON.stringify(run, null, 2)}</pre>
    </div>
  )
}
