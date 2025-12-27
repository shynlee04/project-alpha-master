/**
 * Hub Layout Component
 * 
 * Layout wrapper component for hub pages.
 * Integrates HubSidebar and provides layout structure.
 * 
 * @file HubLayout.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React, { useState, useEffect } from 'react';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { useHubStore } from '@/lib/state/hub-store';
import { CommandPalette } from '@/components/ide/CommandPalette';
import { cn } from '@/lib/utils';

interface HubLayoutProps {
  children: React.ReactNode;
}

export const HubLayout: React.FC<HubLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useHubStore();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandPalette((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Header with LanguageSwitcher and ThemeToggle */}
      <Header />

      {/* Sidebar */}
      <HubSidebar />

      {/* Main content area */}
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-[200ms] ease-in-out",
          sidebarCollapsed ? "ml-[64px]" : "ml-[256px]"
        )}
      >
        {children}
      </main>

      {/* Global Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={[]} // To be populated with real commands later
      />
    </div>
  );
};
