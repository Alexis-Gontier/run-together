import { DashboardHeader } from "@/components/layout/dashboard-header-layout";
import { AppSidebar } from "@/components/layout/dashboard-sidebar-layout";
import { SidebarInset, SidebarProvider } from "@/components/shadcn-ui/sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader />
                <main className="flex flex-col w-full h-full p-4 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}