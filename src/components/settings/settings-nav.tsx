"use client"

import { Button } from "@/components/shadcn-ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"

type SettingsNavItem = {
    title: string
    href: string
}

type SettingsNavProps = {
    items: SettingsNavItem[]
}

export function SettingsNav({ items }: SettingsNavProps) {
    const pathname = usePathname()

    return (
        <nav className="sticky top-20 flex flex-col space-y-1">
            {items.map((item) => {
                const isActive = pathname === item.href

                return (
                    <Button
                        key={item.href}
                        variant={isActive ? "outline" : "ghost"}
                        size="lg"
                        className={cn(
                            "w-full justify-start cursor-pointer",
                            !isActive && "text-muted-foreground"
                        )}
                        asChild
                    >
                        <Link href={item.href}>
                            {item.title}
                        </Link>
                    </Button>
                )
            })}
        </nav>
    )
}
