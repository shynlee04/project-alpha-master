/**
 * @fileoverview Layout State Store
 * @module lib/state/layout-store
 * @governance LAYOUT-1
 * @ai-observable false
 * 
 * Unified Zustand store for home page layout state management.
 * Manages sidebar collapse, mobile menu, navigation state, and path history.
 * 
 * Story LAYOUT-1: Create Unified Layout Store
 * 
 * @example
 * ```tsx
 * import { useLayoutStore } from '@/lib/state';
 * 
 * function Component() {
 *   const sidebarCollapsed = useLayoutStore(s => s.sidebarCollapsed);
 *   const toggleSidebar = useLayoutStore(s => s.toggleSidebar);
 *   
 *   return (
 *     <button onClick={toggleSidebar}>
 *       {sidebarCollapsed ? 'Expand' : 'Collapse'}
 *     </button>
 *   );
 * }
 * ```
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type NavItem = 'home' | 'projects' | 'agents' | 'quality' | 'settings';

/**
 * Layout State shape
 */
export interface LayoutState {
    // =========================================================================
    // State
    // =========================================================================

    /** Sidebar collapse state */
    sidebarCollapsed: boolean;

    /** Mobile menu open state */
    sidebarMobileOpen: boolean;

    /** Currently active navigation item */
    activeNavItem: NavItem;

    /** Previous navigation path */
    previousPath: string | null;

    // =========================================================================
    // Actions
    // =========================================================================

    /** Toggle sidebar collapse state */
    toggleSidebar: () => void;

    /** Set sidebar collapse state */
    setSidebarCollapsed: (collapsed: boolean) => void;

    /** Set mobile menu open state */
    setMobileMenuOpen: (open: boolean) => void;

    /** Set active navigation item */
    setActiveNavItem: (item: NavItem) => void;

    /** Set previous navigation path */
    setPreviousPath: (path: string | null) => void;
}

// ============================================================================
// Default State
// ============================================================================

const defaultState = {
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    activeNavItem: 'home' as NavItem,
    previousPath: null,
};

// ============================================================================
// Store
// ============================================================================

/**
 * Main layout state store with localStorage persistence
 * 
 * Uses Zustand with persist middleware connected to localStorage.
 * Only user preferences (sidebarCollapsed, activeNavItem) are persisted.
 * Ephemeral state (sidebarMobileOpen, previousPath) is not persisted.
 */
export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => ({
            // Initial state
            ...defaultState,

            // =========================================================
            // Actions
            // =========================================================

            toggleSidebar: () => {
                const { sidebarCollapsed } = get();
                set({ sidebarCollapsed: !sidebarCollapsed });
            },

            setSidebarCollapsed: (collapsed) => {
                set({ sidebarCollapsed: collapsed });
            },

            setMobileMenuOpen: (open) => {
                set({ sidebarMobileOpen: open });
            },

            setActiveNavItem: (item) => {
                set({ activeNavItem: item });
            },

            setPreviousPath: (path) => {
                set({ previousPath: path });
            },
        }),
        {
            name: 'via-gent-layout-storage',

            // Only persist user preferences, not ephemeral state
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                activeNavItem: state.activeNavItem,
            }),
        },
    ),
);
