/**
 * @fileoverview Sidebar State Store
 * @module infrastructure/persistence/stores/layout/sidebar-store
 * @updated 2026-01-30
 *
 * Zustand store for managing sidebar state with localStorage persistence
 * EPIC-UXUI-04: Global Sidebar Auto-Collapse
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SidebarState,
  SidebarStore,
  PersistedSidebarState,
} from '@/presentation/components/layout/types';
import {
  SIDEBAR_STORAGE_KEY,
  SIDEBAR_STATE_VERSION,
  DEFAULT_SIDEBAR_STATE,
} from '@/presentation/components/layout/types';

/**
 * Load persisted state from localStorage
 * Handles version migration and validation
 */
function loadPersistedState(): Partial<SidebarState> | null {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!stored) return null;

    const parsed: PersistedSidebarState = JSON.parse(stored);

    // Version check for migrations
    if (parsed.version !== SIDEBAR_STATE_VERSION) {
      console.log('[sidebar-store] State version mismatch, using defaults');
      return null;
    }

    return {
      isExpanded: parsed.isExpanded,
      activeWorkspace: parsed.activeWorkspace,
      pinnedItems: parsed.pinnedItems,
    };
  } catch (error) {
    console.warn('[sidebar-store] Failed to load persisted state:', error);
    return null;
  }
}

/**
 * Create the sidebar store with persistence
 */
export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      // Initial state (will be overridden by persisted state if available)
      ...DEFAULT_SIDEBAR_STATE,

      // Actions
      toggleSidebar: () => {
        set((state) => ({ isExpanded: !state.isExpanded }));
      },

      setExpanded: (expanded: boolean) => {
        set({ isExpanded: expanded });
      },

      setActiveWorkspace: (workspaceId: string) => {
        set({ activeWorkspace: workspaceId });
      },

      pinItem: (itemId: string) => {
        set((state) => {
          if (state.pinnedItems.includes(itemId)) {
            return state; // Already pinned
          }
          return { pinnedItems: [...state.pinnedItems, itemId] };
        });
      },

      unpinItem: (itemId: string) => {
        set((state) => ({
          pinnedItems: state.pinnedItems.filter((id) => id !== itemId),
        }));
      },

      togglePin: (itemId: string) => {
        set((state) => {
          const isPinned = state.pinnedItems.includes(itemId);
          if (isPinned) {
            return { pinnedItems: state.pinnedItems.filter((id) => id !== itemId) };
          }
          return { pinnedItems: [...state.pinnedItems, itemId] };
        });
      },

      reset: () => {
        set(DEFAULT_SIDEBAR_STATE);
      },
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: SIDEBAR_STATE_VERSION,
      partialize: (state): PersistedSidebarState => ({
        isExpanded: state.isExpanded,
        activeWorkspace: state.activeWorkspace,
        pinnedItems: state.pinnedItems,
        version: SIDEBAR_STATE_VERSION,
      }),
      migrate: (persistedState: unknown, version: number): SidebarState => {
        // Migration logic for future state versions
        if (version !== SIDEBAR_STATE_VERSION) {
          console.log('[sidebar-store] Migrating state from version', version);
          return DEFAULT_SIDEBAR_STATE;
        }
        return persistedState as SidebarState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[sidebar-store] Rehydration error:', error);
        } else if (state) {
          console.log('[sidebar-store] State rehydrated successfully');
        }
      },
    }
  )
);

/**
 * Hydrate store with initial persisted state synchronously
 * Call this early in app initialization if needed
 */
export function hydrateSidebarStore(): void {
  const persisted = loadPersistedState();
  if (persisted) {
    useSidebarStore.setState(persisted);
  }
}

/**
 * Get current sidebar width based on state
 * @returns Width in pixels (200 for expanded, 48 for collapsed)
 */
export function getSidebarWidth(isExpanded: boolean): number {
  return isExpanded ? 200 : 48;
}

/**
 * Check if sidebar should auto-collapse based on viewport width
 * @param width Viewport width in pixels
 * @returns true if should auto-collapse
 */
export function shouldAutoCollapse(width: number): boolean {
  return width < 1024; // Collapse on mobile (< 768) and tablet (< 1024)
}
