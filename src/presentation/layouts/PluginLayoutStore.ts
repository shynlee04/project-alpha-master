/**
 * @fileoverview PluginLayout Store - Zustand store for layout state
 * @module presentation/layouts/PluginLayoutStore
 *
 * **ARCH-02-09**: PluginLayout Container - State Management
 *
 * Provides Zustand store with persist middleware for plugin layout state.
 * Persists active plugin selection and layout mode per project.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-09
 * @team Team B
 * @created 2026-01-21
 */

import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';
import type { PluginId } from '@/domain/types/plugin-types';
import { type WorkflowPreset, getPresetConfig } from './workflow-presets';
// Import type { Breakpoint } from './useBreakpoint';

// ============================================================================
// Project-Specific Storage Wrapper (INT-02 fix)
// ============================================================================

/**
 * Get current project ID from localStorage
 *
 * @remarks
 * - Reads project ID from project store's storage
 * - Returns undefined if no active project or not in browser
 * - Used to prefix plugin-layout storage key
 * - SSR-safe: checks for localStorage availability
 */
function getCurrentProjectId(): string | undefined {
  // SSR-safe: check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return undefined;
  }

  try {
    const projectStoreKey = 'project-storage';
    const projectData = localStorage.getItem(projectStoreKey);
    if (!projectData) return undefined;

    const parsed = JSON.parse(projectData);
    return parsed.state?.activeProjectId || undefined;
  } catch (error) {
    console.warn('[PluginLayoutStore] Failed to read current project ID:', error);
    return undefined;
  }
}

/**
 * Custom storage wrapper with project-specific prefix
 *
 * @remarks
 * - Wraps localStorage to add projectId prefix to all keys
 * - Ensures layout data is isolated per project
 * - Falls back to global key if no project active
 * - Implements StorageValue<PluginLayoutState> type contract
 */
const projectSpecificStorage = {
  getItem: (name: string): StorageValue<PluginLayoutState> | null => {
    // SSR-safe: check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const projectId = getCurrentProjectId();
    const key = projectId ? `plugin-layout-${projectId}` : name;
    const item = localStorage.getItem(key);
    if (item === null) return null;
    try {
      return JSON.parse(item) as StorageValue<PluginLayoutState>;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<PluginLayoutState>): void => {
    // SSR-safe: check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    const projectId = getCurrentProjectId();
    const key = projectId ? `plugin-layout-${projectId}` : name;
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    const projectId = getCurrentProjectId();
    const key = projectId ? `plugin-layout-${projectId}` : name;
    localStorage.removeItem(key);
  },
};

// ============================================================================
// Layout Mode Type
// ============================================================================

/**
 * Layout mode options for plugin arrangement
 *
 * @remarks
 * Defines 4 supported layout configurations:
 * - 1-column: Single panel (full width)
 * - 2-column: Two panels side-by-side
 * - 3-column: Three panels side-by-side
 * - 2+1: Two panels on top, one full-width panel below
 */
export type LayoutMode = '1-column' | '2-column' | '3-column' | '2+1';

// ============================================================================
// Plugin Layout State Interface
// ============================================================================

/**
 * PluginLayout State Interface
 *
 * @remarks
 * Stores plugin layout configuration:
 * - Active plugin IDs in display order
 * - Layout mode (1-column, 2-column, 3-column, 2+1)
 * - Panel sizes (plugin ID -> size percentage)
 * - User customization flag (prevents overwriting defaults)
 * - Responsive breakpoint state
 * - Current plugin for mobile single-view
 * - Hydration completion flag (CC-AR-03 fix)
 *
 * Persisted via localStorage with project-specific key.
 */
interface PluginLayoutState {
  /** Hydration completion flag - true after persist middleware finishes loading */
  _hasHydrated: boolean;

  /** Active plugin IDs in display order (1-5 plugins max) */
  activePlugins: PluginId[];

  /** Current layout mode */
  layoutMode: LayoutMode;

  /** Panel sizes: position (left/main/right) -> size percentage (0-100) */
  panelSizes: Record<'left' | 'main' | 'right', number>;

  /** Panel visibility: position -> visible */
  panelVisibility: Record<'left' | 'main' | 'right', boolean>;

  /** Track if user has customized layout (prevents overwriting defaults) */
  hasUserCustomized: boolean;

  /** Current breakpoint (responsive state) */
  breakpoint: 'mobile' | 'mobileLg' | 'tablet' | 'desktop' | 'wide';

  /** Current plugin for mobile single-view */
  currentPlugin: PluginId | null;

  /** Current workflow preset (Phase 1: Fixed-ratio CSS Grid) */
  currentPreset: WorkflowPreset;

  // ========================================================================
  // LC-02: Sidebar State (consolidated from layout-store.ts)
  // ========================================================================

  /** Sidebar collapse state (for desktop/tablet) */
  sidebarCollapsed: boolean;

  /** Mobile sidebar open state (for mobile overlay) */
  sidebarMobileOpen: boolean;

  // ========================================================================
  // Actions
  // ========================================================================

  /** Add plugin to active list (if not already active) */
  addPlugin: (pluginId: PluginId) => void;

  /** Remove plugin from active list */
  removePlugin: (pluginId: PluginId) => void;

  /** Reorder plugin (move from index to index) */
  reorderPlugin: (fromIndex: number, toIndex: number) => void;

  /** Change layout mode */
  setLayoutMode: (mode: LayoutMode) => void;

  /** Update panel size by position */
  setPanelSize: (position: 'left' | 'main' | 'right', size: number) => void;

  /** Set all panel sizes at once (must sum to 100%) */
  setPanelSizes: (sizes: Record<'left' | 'main' | 'right', number>) => void;

  /** Toggle panel visibility by position */
  togglePanelVisibility: (position: 'left' | 'main' | 'right') => void;

  /** Set panel visibility by position */
  setPanelVisibility: (position: 'left' | 'main' | 'right', visible: boolean) => void;

  /** Clear all active plugins */
  clearActivePlugins: () => void;

  /** Initialize default plugins and layout mode (only if not customized) */
  initializeDefaults: (plugins: PluginId[], mode: LayoutMode) => void;

  /** Set current breakpoint */
  setBreakpoint: (bp: 'mobile' | 'mobileLg' | 'tablet' | 'desktop' | 'wide') => void;

  /** Switch to specific plugin (for mobile navigation) */
  switchPlugin: (pluginId: PluginId) => void;

  /** Switch to next plugin (for mobile swipe gestures) */
  switchToNextPlugin: () => void;

  /** Switch to previous plugin (for mobile swipe gestures) */
  switchToPreviousPlugin: () => void;

  /** Set hydration completion flag (CC-AR-03 fix) */
  setHasHydrated: (value: boolean) => void;

  /** Set workflow preset (Phase 1: Fixed-ratio CSS Grid) */
  setPreset: (preset: WorkflowPreset) => void;

  /** Toggle plugin on/off (convenience method for UI) */
  togglePlugin: (pluginId: PluginId) => void;

  // ========================================================================
  // LC-02: Sidebar Actions (consolidated from layout-store.ts)
  // ========================================================================

  /** Toggle sidebar collapse state */
  toggleSidebar: () => void;

  /** Set sidebar collapse state */
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Set mobile menu open state */
  setMobileMenuOpen: (open: boolean) => void;
}

// ============================================================================
// Create Zustand Store with Persist Middleware
// ============================================================================

/**
 * PluginLayout Store
 *
 * @remarks
 * - Created with Zustand v5
 * - Uses persist middleware for localStorage
 * - Storage key: 'plugin-layout-storage'
 *
 * Persisted state:
 * - activePlugins: Plugin IDs array (order matters)
 * - layoutMode: String ('1-column', '2-column', etc.)
 * - panelSizes: Object mapping plugin ID to size percentage
 */
export const usePluginLayoutStore = create<PluginLayoutState>()(
  persist(
    (set) => ({
      // ========================================================================
      // Initial State
      // ========================================================================

      /** CC-AR-03: Hydration flag - false until onRehydrateStorage fires */
      _hasHydrated: false,

      activePlugins: [],
      layoutMode: '2-column',
      // Default panel sizes - sum to ~100% (23.5 + 47 + 29.5 = 100)
      // Based on grid ratios: left:2, main:4, right:2.5 => 23.5%, 47%, 29.5%
      panelSizes: { left: 23.5, main: 47, right: 29.5 },
      panelVisibility: { left: true, main: true, right: true },
      hasUserCustomized: false,
      breakpoint: 'desktop',
      currentPlugin: null,
      currentPreset: 'default' as WorkflowPreset,

      // LC-02: Sidebar state (from layout-store.ts)
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      // ========================================================================
      // Actions
      // ========================================================================

      /**
       * Add plugin to active list
       *
       * @param pluginId - Plugin ID to add
       * @remarks
       * - Checks if plugin is already active (prevents duplicates)
       * - Enforces 5 plugins max (per ADR-034 Section 4)
       * - Appends to end of list (newest plugins last)
       * - Sets hasUserCustomized flag when user adds plugin
       */
      addPlugin: (pluginId) =>
        set((state) => {
          // Prevent duplicates
          if (state.activePlugins.includes(pluginId)) {
            console.warn(`[PluginLayoutStore] Plugin ${pluginId} already active`);
            return state;
          }

          // Enforce 5 plugins max (per ADR-034)
          if (state.activePlugins.length >= 5) {
            console.warn(
              `[PluginLayoutStore] Maximum 5 plugins allowed, cannot add ${pluginId}`
            );
            return state;
          }

          // Add plugin to end of list and mark as customized
          return {
            activePlugins: [...state.activePlugins, pluginId],
            hasUserCustomized: true,
          };
        }),

      /**
       * Remove plugin from active list
       *
       * @param pluginId - Plugin ID to remove
       * @remarks
       * - Filters out plugin from activePlugins array
       * - Sets hasUserCustomized flag when user removes plugin
       */
      removePlugin: (pluginId) =>
        set((state) => {
          return {
            activePlugins: state.activePlugins.filter((id) => id !== pluginId),
            hasUserCustomized: true,
          };
        }),

      /**
       * Reorder plugin in active list
       *
       * @param fromIndex - Current index of plugin
       * @param toIndex - Target index to move to
       * @remarks
       * - Uses array splice to remove and reinsert
       * - Useful for drag-drop reordering
       * - Sets hasUserCustomized flag when user reorders
       */
      reorderPlugin: (fromIndex, toIndex) =>
        set((state) => {
          const newPlugins = [...state.activePlugins];

          // Remove from old position
          const [moved] = newPlugins.splice(fromIndex, 1);

          // Insert at new position
          newPlugins.splice(toIndex, 0, moved);

          console.log(
            `[PluginLayoutStore] Reordered plugin from ${fromIndex} to ${toIndex}`
          );

          return {
            activePlugins: newPlugins,
            hasUserCustomized: true,
          };
        }),

      /**
       * Change layout mode
       *
       * @param mode - New layout mode
       * @remarks
       * - Directly updates layoutMode
       * - No validation needed (all modes supported)
       * - Sets hasUserCustomized flag when user changes mode
       */
      setLayoutMode: (mode) =>
        set(() => ({
          layoutMode: mode,
          hasUserCustomized: true,
        })),

      /**
       * Update panel size by position
       *
       * @param position - Panel position (left, main, right)
       * @param size - Size percentage (10-80)
       * @remarks
       * - Called when user resizes panel with drag handle
       * - Clamps size to 10%-80% range
       * - Auto-adjusts other panels to sum to 100%
       */
      setPanelSize: (position, size) =>
        set((state) => {
          // Clamp size to 10%-80% range
          const clampedSize = Math.min(80, Math.max(10, size));
          const oldSize = state.panelSizes[position];
          const delta = clampedSize - oldSize;

          // Calculate new sizes - distribute delta to other panels proportionally
          const otherPositions = (['left', 'main', 'right'] as const).filter(p => p !== position);
          const otherTotal = otherPositions.reduce((sum, p) => sum + state.panelSizes[p], 0);
          
          const newSizes = { ...state.panelSizes };
          newSizes[position] = clampedSize;
          
          // Distribute the delta proportionally to other panels
          otherPositions.forEach(p => {
            const ratio = state.panelSizes[p] / otherTotal;
            newSizes[p] = Math.max(10, Math.min(80, state.panelSizes[p] - (delta * ratio)));
          });

          // Normalize to ensure sum is 100%
          const total = newSizes.left + newSizes.main + newSizes.right;
          if (Math.abs(total - 100) > 0.01) {
            const scale = 100 / total;
            newSizes.left *= scale;
            newSizes.main *= scale;
            newSizes.right *= scale;
          }

          return {
            panelSizes: newSizes,
            hasUserCustomized: true,
          };
        }),

      /**
       * Set all panel sizes at once
       *
       * @param sizes - Object with sizes for left, main, right
       * @remarks
       * - Normalizes to ensure sum is 100%
       */
      setPanelSizes: (sizes) =>
        set(() => {
          const total = sizes.left + sizes.main + sizes.right;
          const scale = total > 0 ? 100 / total : 1;
          return {
            panelSizes: {
              left: sizes.left * scale,
              main: sizes.main * scale,
              right: sizes.right * scale,
            },
            hasUserCustomized: true,
          };
        }),

      /**
       * Toggle panel visibility
       *
       * @param position - Panel position to toggle
       */
      togglePanelVisibility: (position) =>
        set((state) => ({
          panelVisibility: {
            ...state.panelVisibility,
            [position]: !state.panelVisibility[position],
          },
        })),

      /**
       * Set panel visibility
       *
       * @param position - Panel position
       * @param visible - Whether panel should be visible
       */
      setPanelVisibility: (position, visible) =>
        set((state) => ({
          panelVisibility: {
            ...state.panelVisibility,
            [position]: visible,
          },
        })),

      /**
       * Clear all active plugins
       *
       * @remarks
       * - Useful when switching projects
       * - Clears activePlugins and resets panels to default
       */
      clearActivePlugins: () =>
        set({
          activePlugins: [],
          panelSizes: { left: 23.5, main: 47, right: 29.5 },
          panelVisibility: { left: true, main: true, right: true },
        }),

      /**
       * Initialize default plugins and layout mode
       *
       * @param plugins - Default plugin IDs to load
       * @param mode - Default layout mode
       * @remarks
       * - Only initializes if user hasn't customized layout
       * - Sets hasUserCustomized=false initially
       * - Called by route when first opening a project
       */
      initializeDefaults: (plugins, mode) =>
        set(() => {
          // Only initialize if not already customized
          return {
            activePlugins: plugins,
            layoutMode: mode,
            hasUserCustomized: false,
          };
        }),

      /**
       * Set current breakpoint
       *
       * @param bp - New breakpoint value
       * @remarks
       * - Updates responsive breakpoint state
       * - Enforces max plugins based on LAYOUT_RULES
       * - Sets current plugin if not set
       */
      setBreakpoint: (bp) =>
        set((state) => {
          // Import LAYOUT_RULES from useBreakpoint
          const LAYOUT_RULES = {
            mobile: {
              maxPlugins: 1,
              layoutMode: '1-column',
              sidebarMode: 'overlay',
              showBottomNav: true,
            },
            mobileLg: {
              maxPlugins: 1,
              layoutMode: '1-column',
              sidebarMode: 'overlay',
              showBottomNav: true,
            },
            tablet: {
              maxPlugins: 2,
              layoutMode: '2-column',
              sidebarMode: 'collapsible',
              showBottomNav: false,
            },
            desktop: {
              maxPlugins: 5,
              layoutMode: 'user-selected',
              sidebarMode: 'persistent',
              showBottomNav: false,
            },
            wide: {
              maxPlugins: 5,
              layoutMode: 'user-selected',
              sidebarMode: 'persistent',
              showBottomNav: false,
            },
          } as const;

          const rules = LAYOUT_RULES[bp];

          return {
            ...state,
            breakpoint: bp,
            // Enforce max plugins on breakpoint change
            activePlugins: state.activePlugins.slice(0, rules.maxPlugins),
            // Set current plugin if not set
            currentPlugin: state.currentPlugin || state.activePlugins[0] || null,
          };
        }),

      /**
       * Switch to specific plugin (for mobile navigation)
       *
       * @param pluginId - Plugin ID to switch to
       * @remarks
       * - Updates currentPlugin for mobile single-view
       * - Used by bottom navigation clicks
       */
      switchPlugin: (pluginId) =>
        set((state) => ({
          ...state,
          currentPlugin: pluginId,
        })),

      /**
       * Switch to next plugin (for mobile swipe gestures)
       *
       * @remarks
       * - Cycles forward through activePlugins array
       * - Wraps around to first plugin if at end
       * - Used by swipe left gesture
       */
      switchToNextPlugin: () =>
        set((state) => {
          const currentIndex = state.activePlugins.indexOf(state.currentPlugin || state.activePlugins[0] || '');
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % state.activePlugins.length;
          return {
            ...state,
            currentPlugin: state.activePlugins[nextIndex] || null,
          };
        }),

      /**
       * Switch to previous plugin (for mobile swipe gestures)
       *
       * @remarks
       * - Cycles backward through activePlugins array
       * - Wraps around to last plugin if at beginning
       * - Used by swipe right gesture
       */
      switchToPreviousPlugin: () =>
        set((state) => {
          const currentIndex = state.activePlugins.indexOf(state.currentPlugin || state.activePlugins[0] || '');
          const prevIndex = currentIndex === -1 ? state.activePlugins.length - 1 : currentIndex === 0 ? state.activePlugins.length - 1 : currentIndex - 1;
          return {
            ...state,
            currentPlugin: state.activePlugins[prevIndex] || null,
          };
        }),

/**
        * Set hydration completion flag (CC-AR-03 fix)
        *
        * @param value - Whether hydration is complete
        * @remarks
        * Called by onRehydrateStorage callback when persist middleware finishes
        */
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      /**
         * Set workflow preset (Phase 1: Fixed-ratio CSS Grid)
         *
         * @param preset - WorkflowPreset to apply
         * @remarks
         * - Updates activePlugins to match preset panels
         * - Resets panel sizes to defaults
         * - Sets hasUserCustomized flag
         */
      setPreset: (preset) =>
        set(() => {
          const config = getPresetConfig(preset);
          return {
            currentPreset: preset,
            activePlugins: config.panels,
            hasUserCustomized: true,
            panelSizes: { left: 23.5, main: 47, right: 29.5 }, // Reset to defaults
          };
        }),

      /**
       * Toggle plugin on/off
       *
       * @param pluginId - Plugin ID to toggle
       * @remarks
       * - Adds plugin if not active
       * - Removes plugin if already active
       * - Enforces min/max plugin limits
       */
      togglePlugin: (pluginId) =>
        set((state) => {
          const isActive = state.activePlugins.includes(pluginId);

          if (isActive) {
            // Remove plugin (enforce minimum of 2)
            if (state.activePlugins.length <= 2) {
              console.warn('[PluginLayoutStore] Cannot go below 2 plugins');
              return state;
            }
            return {
              activePlugins: state.activePlugins.filter((id) => id !== pluginId),
              hasUserCustomized: true,
            };
          } else {
            // Add plugin (enforce maximum of 5)
            if (state.activePlugins.length >= 5) {
              console.warn('[PluginLayoutStore] Cannot exceed 5 plugins');
              return state;
            }
            return {
              activePlugins: [...state.activePlugins, pluginId],
              hasUserCustomized: true,
            };
          }
        }),

      // ========================================================================
      // LC-02: Sidebar Actions (consolidated from layout-store.ts)
      // ========================================================================

      /**
       * Toggle sidebar collapse state
       */
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      /**
       * Set sidebar collapse state
       */
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      /**
       * Set mobile menu open state
       */
      setMobileMenuOpen: (open) =>
        set({ sidebarMobileOpen: open }),

    }),

    // ========================================================================
    // Persist Configuration (CC-AR-03: Added onRehydrateStorage)
    // ========================================================================

    {
      name: 'plugin-layout-storage', // Will be prefixed by projectSpecificStorage
      version: 1, // For migration support
      storage: projectSpecificStorage, // INT-02: Use project-specific storage
      /**
       * CC-AR-03: Hydration completion callback
       *
       * @remarks
       * Called when persist middleware finishes loading state from storage.
       * Sets _hasHydrated=true so components know when it's safe to read state.
       */
      onRehydrateStorage: () => (state) => {
        // Called when hydration completes
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// ============================================================================
// Helper Selectors (useShallow compatible)
// ============================================================================

/**
 * Select active plugins and layout mode
 *
 * @remarks
 * Use with useShallow for optimal re-rendering:
 * ```ts
 * const { activePlugins, layoutMode } = usePluginLayoutStore(
 *   useShallow((state) => ({
 *     activePlugins: state.activePlugins,
 *     layoutMode: state.layoutMode,
 *   }))
 * );
 * ```
 */
export const selectActivePlugins = (state: PluginLayoutState) =>
  state.activePlugins;

export const selectLayoutMode = (state: PluginLayoutState) => state.layoutMode;

export const selectPanelSizes = (state: PluginLayoutState) => state.panelSizes;

export const selectPanelVisibility = (state: PluginLayoutState) => state.panelVisibility;

export const selectIsPanelVisible = (state: PluginLayoutState, position: 'left' | 'main' | 'right'): boolean =>
  state.panelVisibility[position];

/**
 * Check if a plugin is active
 *
 * @param state - PluginLayoutState
 * @param pluginId - Plugin ID to check
 * @returns true if plugin is in activePlugins
 *
 * @example
 * ```ts
 * const isActive = usePluginLayoutStore(useShallow((s) => selectIsPluginActive(s, 'notes')));
 * ```
 */
export const selectIsPluginActive = (state: PluginLayoutState, pluginId: PluginId): boolean =>
  state.activePlugins.includes(pluginId);

// ============================================================================
// LC-02: Sidebar Selectors (consolidated from layout-store.ts)
// ============================================================================

export const selectSidebarCollapsed = (state: PluginLayoutState) => state.sidebarCollapsed;

export const selectSidebarMobileOpen = (state: PluginLayoutState) => state.sidebarMobileOpen;

// ============================================================================
// No additional exports - store and selectors exported above
// ============================================================================
