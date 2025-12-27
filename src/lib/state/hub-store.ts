/**
 * Hub Navigation Store
 * 
 * Manages hub-based navigation state including:
 * - Active section (home, ide, agents, knowledge, settings)
 * - Sidebar collapsed state
 * - Navigation history
 * 
 * @file hub-store.ts
 * @created 2025-12-26T12:50:00Z
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Hub navigation sections
 */
export type HubSection = 'home' | 'ide' | 'agents' | 'knowledge' | 'settings';

/**
 * Hub state interface
 */
interface HubState {
  /** Currently active navigation section */
  activeSection: HubSection;
  /** Sidebar collapsed state */
  sidebarCollapsed: boolean;
  /** Navigation history for breadcrumbs */
  navigationHistory: string[];
  /** Set active section */
  setActiveSection: (section: HubSection) => void;
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  /** Add path to navigation history */
  addToHistory: (path: string) => void;
  /** Navigate back in history */
  navigateBack: () => void;
}

/**
 * Hub navigation store
 * 
 * Persists sidebar state and active section to localStorage
 */
export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      activeSection: 'home',
      sidebarCollapsed: false,
      navigationHistory: [],
      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      addToHistory: (path) => set((state) => ({ 
        navigationHistory: [...state.navigationHistory, path] 
      })),
      navigateBack: () => set((state) => {
        const newHistory = [...state.navigationHistory];
        newHistory.pop();
        return { navigationHistory: newHistory };
      }),
    }),
    { 
      name: 'via-gent-hub-storage',
      partialize: (state) => ({
        activeSection: state.activeSection,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
