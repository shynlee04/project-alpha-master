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
    <div className={cn('flex flex-col h-screen bg-background overflow-hidden', className)}>
      {/* Mobile Header - MRT-9: MUST be outside the row flex container */}
      <header className="md:hidden flex items-center h-14 border-b border-border px-4 bg-background shrink-0">
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
          <img
            src="/via-gent-logo.svg"
            alt="Via-gent"
            className="w-8 h-8"
            onError={(e) => {
              // Fallback for missing logo
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-bold font-pixel text-lg tracking-tight text-foreground">
            Via-gent
          </span>
        </div>
      </header>

      {/* Main content row - sidebar (desktop only) + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar - handles its own mobile/desktop visibility */}
        <MainSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
