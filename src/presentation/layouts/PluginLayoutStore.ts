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
import type { Breakpoint } from './useBreakpoint';

// ============================================================================
// Project-Specific Storage Wrapper (INT-02 fix)
// ============================================================================

/**
 * Get current project ID from localStorage
 *
 * @remarks
 * - Reads project ID from project store's storage
 * - Returns undefined if no active project
 * - Used to prefix plugin-layout storage key
 */
function getCurrentProjectId(): string | undefined {
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
 *
 * Persisted via localStorage with project-specific key.
 */
interface PluginLayoutState {
  /** Active plugin IDs in display order (1-5 plugins max) */
  activePlugins: PluginId[];

  /** Current layout mode */
  layoutMode: LayoutMode;

  /** Panel sizes: plugin ID -> size percentage (0-100) */
  panelSizes: Record<string, number>;

  /** Track if user has customized layout (prevents overwriting defaults) */
  hasUserCustomized: boolean;

  /** Current breakpoint (responsive state) */
  breakpoint: 'mobile' | 'mobileLg' | 'tablet' | 'desktop' | 'wide';

  /** Current plugin for mobile single-view */
  currentPlugin: PluginId | null;

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

  /** Update panel size */
  setPanelSize: (pluginId: PluginId, size: number) => void;

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

      activePlugins: [],
      layoutMode: '2-column',
      panelSizes: {},
      hasUserCustomized: false,
      breakpoint: 'desktop',
      currentPlugin: null,

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
       * - Also removes panel size for this plugin
       * - Sets hasUserCustomized flag when user removes plugin
       */
      removePlugin: (pluginId) =>
        set((state) => {
          const newPanelSizes = { ...state.panelSizes };
          delete newPanelSizes[pluginId];

          return {
            activePlugins: state.activePlugins.filter((id) => id !== pluginId),
            panelSizes: newPanelSizes,
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
       * Update panel size
       *
       * @param pluginId - Plugin ID
       * @param size - Size percentage (0-100)
       * @remarks
       * - Called when user resizes panel with drag handle
       * - Merges into panelSizes object (preserves other sizes)
       */
      setPanelSize: (pluginId, size) =>
        set((state) => ({
          panelSizes: {
            ...state.panelSizes,
            [pluginId]: size,
          },
        })),

      /**
       * Clear all active plugins
       *
       * @remarks
       * - Useful when switching projects
       * - Clears both activePlugins and panelSizes
       */
      clearActivePlugins: () =>
        set({
          activePlugins: [],
          panelSizes: {},
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
    }),

    // ========================================================================
    // Persist Configuration
    // ========================================================================

    {
      name: 'plugin-layout-storage', // Will be prefixed by projectSpecificStorage
      version: 1, // For migration support
      storage: projectSpecificStorage, // INT-02: Use project-specific storage
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

// ============================================================================
// No additional exports - store and selectors exported above
// ============================================================================
