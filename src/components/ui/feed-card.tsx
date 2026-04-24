import Link from "next/link"
import { cn } from "@/lib/utils/cn"

interface FeedCardProps extends React.HTMLAttributes<HTMLElement> {
  href?: string
}

export function FeedCard({
  children,
  className,
  href,
  ...props
}: FeedCardProps) {
  return (
    <article className={cn("relative", className)} {...props}>
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-10"
          aria-label="Voir le détail"
        />
      )}
      {children}
    </article>
  )
}
