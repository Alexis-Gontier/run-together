import { getRunById } from '@/actions/run/get-run-by-id.action';
import React from 'react'

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RunByIdPage({ params }: PageProps) {

  const run = await getRunById(params.id);


  return (
    <div>
      Run Details for {params.id}
      <pre>{JSON.stringify(run, null, 2)}</pre>
    </div>
  )
}
