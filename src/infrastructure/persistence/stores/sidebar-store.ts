/**
 * @fileoverview Sidebar Store - State management for ProjectSidebar
 * @module infrastructure/persistence/stores/sidebar-store
 *
 * **ARCH-03-01**: Create ProjectSidebar Component
 *
 * Manages sidebar state including:
 * - Open/collapsed state
 * - Active section (projects/chat/agents)
 * - Sidebar width
 * - Search query for filtering
 *
 * Persisted to localStorage for user preference retention.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-01
 * @team Team A
 * @created 2026-01-22
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// ============================================================================
// Types
// ============================================================================

export type SidebarSection = 'projects' | 'chat' | 'agents';

export interface SidebarState {
  // ==========================================================================
  // State
  // ==========================================================================

  /** Sidebar is expanded or collapsed */
  isOpen: boolean;

  /** Currently active section in sidebar */
  activeSection: SidebarSection;

  /** Sidebar width in pixels (resizable) */
  width: number;

  /** Search query for filtering projects */
  searchQuery: string;

  // ==========================================================================
  // Actions
  // ==========================================================================

  /** Toggle sidebar open/closed */
  toggle: () => void;

  /** Set sidebar open state */
  setIsOpen: (open: boolean) => void;

  /** Set active section */
  setActiveSection: (section: SidebarSection) => void;

  /** Set sidebar width */
  setWidth: (width: number) => void;

  /** Set search query */
  setSearchQuery: (query: string) => void;
}

// ============================================================================
// Default State
// ============================================================================

const defaultState: Omit<SidebarState, 'toggle' | 'setIsOpen' | 'setActiveSection' | 'setWidth' | 'setSearchQuery'> = {
  isOpen: true,
  activeSection: 'projects',
  width: 280,
  searchQuery: '',
};

// ============================================================================
// Store
// ============================================================================

/**
 * Sidebar State Store
 *
 * Zustand store with localStorage persistence.
 * Manages ProjectSidebar state across navigation and sessions.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultState,

      // ============================================================
      // Actions
      // ============================================================

      toggle: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen });
      },

      setIsOpen: (open) => {
        set({ isOpen: open });
      },

      setActiveSection: (section) => {
        set({ activeSection: section });
      },

      setWidth: (width) => {
        set({ width });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
    }),
    {
      name: 'via-gent-sidebar-storage',

      // Persist all state except ephemeral search query
      partialize: (state) => ({
        isOpen: state.isOpen,
        activeSection: state.activeSection,
        width: state.width,
        // Don't persist searchQuery - reset on each session
      }),
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get sidebar open state and toggle action
 */
export function useSidebarOpen() {
  return useSidebarStore(useShallow((state) => ({
    isOpen: state.isOpen,
    toggle: state.toggle,
    setIsOpen: state.setIsOpen,
  })));
}

/**
 * Hook to get sidebar active section and setter
 */
export function useActiveSection() {
  return useSidebarStore(useShallow((state) => ({
    activeSection: state.activeSection,
    setActiveSection: state.setActiveSection,
  })));
}

/**
 * Hook to get sidebar width and setter
 */
export function useSidebarWidth() {
  return useSidebarStore(useShallow((state) => ({
    width: state.width,
    setWidth: state.setWidth,
  })));
}

/**
 * Hook to get search query and setter
 */
export function useSearchQuery() {
  return useSidebarStore(useShallow((state) => ({
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
  })));
}
