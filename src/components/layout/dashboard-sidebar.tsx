"use client"

import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
} from "@/components/shadcn-ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import {
    Footprints,
    HomeIcon,
} from "lucide-react"

const LINKITEMS = [
    {
        href: "/",
        label: "Home",
        icon: HomeIcon,
    },
    {
        href: "/runs",
        label: "Runs",
        icon: Footprints,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup className="p-4">
                    {LINKITEMS.map((item) => (
                        <Button
                            key={item.href}
                            className="w-full"
                            variant={pathname === item.href ? "outline" : "ghost"}
                            size="lg"
                            asChild
                        >
                            <Link href={`/dashboard${item.href}`} className="flex justify-start">
                                <item.icon className="size-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}