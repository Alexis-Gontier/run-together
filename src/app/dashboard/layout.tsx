import {
    SidebarProvider,
    // SidebarTrigger,
    SidebarInset,
} from "@/components/shadcn-ui/sidebar"
import { AppSidebar } from "@/components/layout/dashboard-sidebar"
import DashboardHeader from "@/components/layout/dashboard-header";
import PageLayout from "@/components/layout/page-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader />
                <main className="flex flex-col w-full h-full p-4 md:p-8 space-y-4 md:space-y-6">
                    <PageLayout>
                        {children}
                    </PageLayout>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}