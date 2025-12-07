import { cn } from "@/lib/utils/cn"

type CenterLayoutProps = {
    children: React.ReactNode
    className?: string
}

export function CenterLayout({ children, className }: CenterLayoutProps) {
    return (
        <div className={cn("min-h-screen flex flex-col justify-center items-center gap-4", className)}>
            {children}
        </div>
    )
}
