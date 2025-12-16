import { DashboardTextHeading } from "@/components/ui/dashboard-text-heading"
import { SettingsNav } from "@/components/settings/settings-nav"

type SettingsLayoutProps = {
    children: React.ReactNode
}

const SETTINGS_NAV_ITEMS = [
    {
        title: "General",
        href: "/dashboard/settings",
    },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <>
            <DashboardTextHeading
                title="Paramètres"
                description="Gérez vos informations personnelles et les paramètres de votre compte."
            />
            <div className="flex gap-10">
                <aside className="w-[200px] shrink-0">
                    <SettingsNav items={SETTINGS_NAV_ITEMS} />
                </aside>
                <div className="flex-1 space-y-6">
                    {children}
                </div>
            </div>
        </>
    )
}
