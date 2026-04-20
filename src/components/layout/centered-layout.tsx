import { cn } from "@/lib/utils/cn"

type CenteredLayoutProps = {
  children: React.ReactNode
  className?: string
}

export function CenteredLayout({ children, className }: CenteredLayoutProps) {
  return (
    <div className={cn("grid min-h-screen place-items-center", className)}>
      {children}
    </div>
  )
}
