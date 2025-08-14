"use client"

import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
} from "@/components/shadcn-ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import {
    Footprints,
    HomeIcon,
} from "lucide-react"
import { Separator } from "@/components/shadcn-ui/separator"
import AppBranding from "../ui/app-branding"

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
            <SidebarHeader className="p-0">
                <Link href="/dashboard" className="p-4 pb-[15px]">
                    <h1 className="flex justify-center items-center gap-3">
                        <div className="bg-primary p-2 rounded-md">
                            <Footprints color="white" size="16" className="rotate-12" />
                        </div>
                        <span className="text-lg font-semibold text-foreground">RunTogether.</span>
                    </h1>
                </Link>
            </SidebarHeader>
            <Separator />
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