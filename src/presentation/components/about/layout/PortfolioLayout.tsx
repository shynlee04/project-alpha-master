/**
 * PortfolioLayout Component
 * 
 * FIX-2026-01-28: Removed MainLayout wrapper.
 * ProjectAwareLayout (in __root.tsx) already provides MainSidebar for global routes.
 * Using MainLayout here caused DOUBLE MainSidebar rendering.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface PortfolioLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function PortfolioLayout({ children, className }: PortfolioLayoutProps) {
    return (
        // Content renders directly - MainSidebar is provided by ProjectAwareLayout
        <div className={cn("h-full w-full overflow-y-auto overflow-x-hidden bg-background font-sans text-foreground", className)}>
            <main className="relative flex flex-col min-h-full">
                {children}
            </main>
        </div>
    );
}
