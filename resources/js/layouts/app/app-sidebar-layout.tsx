import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
// import ScrollToTop, { ScrollIndicator } from '@/components/scroll-to-top'; // Temporarily removed
import { Toaster } from '@/components/ui/toaster';
// import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useRealTimeNotifications } from '@/hooks/use-real-time-notifications';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    useFlashToast();
    
    // Initialize real-time notifications at the app level to ensure WebSocket subscription
    // is active throughout the entire application lifecycle
    useRealTimeNotifications();

    return (
        // <TooltipProvider delayDuration={0}>
            <AppShell variant="sidebar">
                {/* <ScrollIndicator /> */}
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden scroll-container">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
                {/* <ScrollToTop /> */}
                <Toaster richColors />
            </AppShell>
        // </TooltipProvider>
    );
}
