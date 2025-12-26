/**
 * Hub Layout Component
 * 
 * Layout wrapper component for hub pages.
 * Integrates HubSidebar and provides layout structure.
 * 
 * @file HubLayout.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React from 'react';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { useHubStore } from '@/lib/state/hub-store';

interface HubLayoutProps {
  children: React.ReactNode;
}

export const HubLayout: React.FC<HubLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useHubStore();

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Sidebar */}
      <HubSidebar />

      {/* Main content area */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-[var(--transition-duration-base,200ms)] ease-in-out ${
          sidebarCollapsed ? 'ml-[var(--sidebar-width-collapsed,64px)]' : 'ml-[var(--sidebar-width-expanded,256px)]'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
