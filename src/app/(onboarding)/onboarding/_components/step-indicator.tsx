import { Check } from "lucide-react"

import { cn } from "@/lib/utils/cn"

type StepIndicatorProps = {
  current: number
  total: number
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1
        const isDone = stepNum < current
        const isActive = stepNum === current

        return (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-semibold ring-2 transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground ring-primary"
                  : isDone
                    ? "bg-primary/15 text-primary ring-primary/30"
                    : "bg-muted text-muted-foreground ring-border",
              )}
            >
              {isDone ? <Check className="size-4" /> : stepNum}
            </div>
            {i < total - 1 && (
              <div
                className={cn(
                  "h-0.5 w-14 transition-all duration-500",
                  isDone ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
