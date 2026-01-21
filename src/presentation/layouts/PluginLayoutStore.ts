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

          // Add plugin to end of list
          return {
            activePlugins: [...state.activePlugins, pluginId],
          };
        }),

      /**
       * Remove plugin from active list
       *
       * @param pluginId - Plugin ID to remove
       * @remarks
       * - Filters out plugin from activePlugins array
       * - Also removes panel size for this plugin
       */
      removePlugin: (pluginId) =>
        set((state) => {
          const newPanelSizes = { ...state.panelSizes };
          delete newPanelSizes[pluginId];

          return {
            activePlugins: state.activePlugins.filter((id) => id !== pluginId),
            panelSizes: newPanelSizes,
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
          };
        }),

      /**
       * Change layout mode
       *
       * @param mode - New layout mode
       * @remarks
       * - Directly updates layoutMode
       * - No validation needed (all modes supported)
       */
      setLayoutMode: (mode) =>
        set({
          layoutMode: mode,
        }),

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
