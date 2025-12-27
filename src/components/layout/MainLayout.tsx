/**
 * @fileoverview Main Layout Component
 * @module components/layout
 * @governance LAYOUT-3
 * @ai-observable false
 * 
 * Main layout wrapper for the home page with responsive sidebar and content area.
 * Integrates MainSidebar, mobile header, and TanStack Router Outlet.
 * 
 * Story LAYOUT-3: Create MainLayout Component
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
    <div className={cn('flex h-screen bg-gray-900 overflow-hidden', className)}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center h-14 border-b border-gray-800 px-4 bg-gray-900">
        <button
          onClick={handleMobileMenuToggle}
          className="flex items-center justify-center h-8 w-8 rounded-none hover:bg-gray-800 text-gray-300 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-600 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
          <span className="font-bold font-pixel text-lg tracking-tight text-gray-100">
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
