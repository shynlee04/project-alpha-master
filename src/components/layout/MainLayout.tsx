/**
 * @fileoverview Main Layout Component
 * @module components/layout
 * @governance LAYOUT-3
 * @ai-observable false
 * 
 * Main layout wrapper for the home page with responsive sidebar and content area.
 * Integrates MainSidebar, mobile header, and TanStack Router Outlet.
 * 
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-9 Dashboard Responsive
 * 
 * @example
 * ```tsx
 * import { MainLayout } from '@/components/layout';
 * 
 * function App() {
 *   return <MainLayout />;
 * }
 * ```
 */

import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useLayoutStore } from '@/lib/state/layout-store';
import { MainSidebar } from './MainSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  className?: string;
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ className, children }) => {
  const { setMobileMenuOpen } = useLayoutStore();

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(true);
  };

  return (
    <div className={cn('flex h-screen bg-background overflow-hidden', className)}>
      {/* Mobile Header - MRT-9: Enhanced touch targets */}
      <header className="md:hidden flex items-center h-14 border-b border-border px-4 bg-background">
        <button
          onClick={handleMobileMenuToggle}
          className={cn(
            'flex items-center justify-center rounded-none hover:bg-accent text-muted-foreground transition-colors',
            // MRT-9: 44px minimum touch target for WCAG 2.5.5
            'min-w-[44px] min-h-[44px] touch-manipulation'
          )}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="ml-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
          <span className="font-bold font-pixel text-lg tracking-tight text-foreground">
            Via-gent
          </span>
        </div>
      </header>

      {/* Main Sidebar */}
      <MainSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};
