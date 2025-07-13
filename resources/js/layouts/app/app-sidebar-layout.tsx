import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import ScrollToTop, { ScrollIndicator } from '@/components/scroll-to-top';
import { Toaster } from '@/components/ui/toaster';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    useFlashToast();

    return (
        <AppShell variant="sidebar">
            <ScrollIndicator />
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden scroll-container">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <ScrollToTop />
            <Toaster richColors />
        </AppShell>
    );
}
