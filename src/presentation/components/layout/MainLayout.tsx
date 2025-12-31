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
 * Layout Structure:
 * - Mobile: Column layout (header -> main content)
 * - Desktop: Row layout (sidebar + content)
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
    // CRITICAL FIX: Use flex-col for mobile, flex-row for desktop
    // Added 'bg-background' and 'text-foreground' explicitly
    <div className={cn('flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden font-sans', className)}>

      {/* Mobile Header - Visible only on mobile */}
      <header className="md:hidden flex items-center justify-between h-14 border-b-2 border-border px-4 bg-background z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMobileMenuToggle}
            className={cn(
              'flex items-center justify-center rounded-none hover:bg-accent text-muted-foreground transition-colors',
              'min-w-[44px] min-h-[44px] touch-manipulation'
            )}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/via-gent-logo.svg"
              alt="Via-gent"
              className="w-8 h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold font-pixel text-lg tracking-tight text-foreground">
              Via-gent
            </span>
          </div>
        </div>
      </header>

      {/* Main Sidebar - Handles its own responsive visibility (hidden on mobile, block on desktop) */}
      {/* Note: Mobile sidebar is an overlay rendered INSIDE MainSidebar component */}
      <MainSidebar className="z-30" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};
