type DebugJsonProps = {
  data: unknown
}

export function DebugJson({ data }: DebugJsonProps) {
  return (
    <pre className="overflow-hidden p-4 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
