import React from 'react';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/presentation/components/layout/MainLayout';

interface PortfolioLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function PortfolioLayout({ children, className }: PortfolioLayoutProps) {
    return (
        <MainLayout className="h-screen w-screen overflow-hidden">
            {/* Scrollable Container for Portfolio Content */}
            <div className={cn("h-full w-full overflow-y-auto overflow-x-hidden bg-background font-sans text-foreground", className)}>
                <main className="relative flex flex-col min-h-full">
                    {children}
                </main>
            </div>
        </MainLayout>
    );
}
