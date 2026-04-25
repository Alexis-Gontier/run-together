type StepIndicatorProps = {
  current: number
  total: number
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i + 1 === current
              ? "w-8 bg-primary"
              : i + 1 < current
                ? "w-2 bg-primary"
                : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  )
}
