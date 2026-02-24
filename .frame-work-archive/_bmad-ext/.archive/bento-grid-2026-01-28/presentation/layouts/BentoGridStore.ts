/**
 * @fileoverview Bento Grid Store - State Management for Bento Layout
 * @module presentation/layouts/BentoGridStore
 *
 * **BENTO GRID STATE MANAGEMENT**
 *
 * Zustand store for managing bento grid layout state:
 * - Active plugins (2-5)
 * - Plugin order (for drag-swap)
 * - Toggle actions (add/remove plugins)
 * - Swap actions (reorder plugins)
 *
 * Key Features:
 * - Always-loaded plugins (Chat, FileTree) cannot be toggled off
 * - Maximum 5 plugins, minimum 2
 * - Plugin order persisted to localStorage
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-04
 * @team Team A
 * @created 2026-01-27
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PluginId } from '@/domain/types/plugin-types';
import {
  type PluginCount,
  ALWAYS_LOADED_PLUGINS,
  MIN_PLUGINS,
  MAX_PLUGINS,
  clampPluginCount,
} from './bento-layouts';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Bento Grid State Interface
 *
 * @remarks
 * State structure for bento grid layout:
 * - activePlugins: Currently visible plugins
 * - pluginOrder: Order of plugins for layout slots
 */
interface BentoGridState {
  /** Hydration completion flag */
  _hasHydrated: boolean;

  /** Active plugin IDs (minimum 2: chat, filetree) */
  activePlugins: PluginId[];

  /** Plugin order for bento grid slots (determines which plugin in which cell) */
  pluginOrder: PluginId[];

  // ========================================================================
  // Actions
  // ========================================================================

  /** Toggle a plugin on/off */
  togglePlugin: (pluginId: PluginId) => void;

  /** Swap two plugins' positions */
  swapPlugins: (fromId: PluginId, toId: PluginId) => void;

  /** Get current plugin count as PluginCount type */
  getActiveCount: () => PluginCount;

  /** Check if a plugin is active */
  isPluginActive: (pluginId: PluginId) => boolean;

  /** Check if a plugin can be toggled */
  canToggle: (pluginId: PluginId) => boolean;

  /** Set hydration flag */
  setHasHydrated: (value: boolean) => void;

  /** Reset to default state */
  resetToDefaults: () => void;
}

// ============================================================================
// Default Values
// ============================================================================

/** Default active plugins (Core + Notes = 3 plugins) */
const DEFAULT_ACTIVE_PLUGINS: PluginId[] = ['chat', 'filetree', 'notes'];

/** Default plugin order */
const DEFAULT_PLUGIN_ORDER: PluginId[] = ['chat', 'filetree', 'notes'];

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Bento Grid Store
 *
 * @remarks
 * Created with Zustand v5 + persist middleware.
 * Persists to localStorage with key 'bento-grid-storage'.
 *
 * Usage with useShallow:
 * ```ts
 * const { activePlugins, togglePlugin } = useBentoGridStore(
 *   useShallow((s) => ({
 *     activePlugins: s.activePlugins,
 *     togglePlugin: s.togglePlugin,
 *   }))
 * );
 * ```
 */
export const useBentoGridStore = create<BentoGridState>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================

      _hasHydrated: false,
      activePlugins: [...DEFAULT_ACTIVE_PLUGINS],
      pluginOrder: [...DEFAULT_PLUGIN_ORDER],

      // ========================================================================
      // Actions
      // ========================================================================

      /**
       * Toggle a plugin on/off
       *
       * @param pluginId - Plugin ID to toggle
       *
       * @remarks
       * - Cannot toggle always-loaded plugins (chat, filetree)
       * - Cannot go below 2 plugins (minimum)
       * - Cannot go above 5 plugins (maximum)
       */
      togglePlugin: (pluginId: PluginId) => {
        const { activePlugins, pluginOrder } = get();

        // Cannot toggle always-loaded plugins
        if (ALWAYS_LOADED_PLUGINS.includes(pluginId as typeof ALWAYS_LOADED_PLUGINS[number])) {
          console.warn(`[BentoGridStore] Cannot toggle always-loaded plugin: ${pluginId}`);
          return;
        }

        const isActive = activePlugins.includes(pluginId);

        if (isActive) {
          // Remove plugin
          if (activePlugins.length <= MIN_PLUGINS) {
            console.warn(`[BentoGridStore] Cannot go below ${MIN_PLUGINS} plugins`);
            return;
          }

          set({
            activePlugins: activePlugins.filter((id) => id !== pluginId),
            pluginOrder: pluginOrder.filter((id) => id !== pluginId),
          });
        } else {
          // Add plugin
          if (activePlugins.length >= MAX_PLUGINS) {
            console.warn(`[BentoGridStore] Cannot exceed ${MAX_PLUGINS} plugins`);
            return;
          }

          set({
            activePlugins: [...activePlugins, pluginId],
            pluginOrder: [...pluginOrder, pluginId],
          });
        }
      },

      /**
       * Swap two plugins' positions
       *
       * @param fromId - Plugin ID to move from
       * @param toId - Plugin ID to swap with
       *
       * @remarks
       * - Swaps positions in pluginOrder array
       * - Does not change which plugins are active
       * - Grid shape remains the same
       */
      swapPlugins: (fromId: PluginId, toId: PluginId) => {
        const { pluginOrder } = get();
        const fromIndex = pluginOrder.indexOf(fromId);
        const toIndex = pluginOrder.indexOf(toId);

        // Validate indices
        if (fromIndex === -1 || toIndex === -1) {
          console.warn(`[BentoGridStore] Cannot swap: plugin not found`);
          return;
        }

        // Same position - no swap needed
        if (fromIndex === toIndex) {
          return;
        }

        // Create new order with swapped positions
        const newOrder = [...pluginOrder];
        [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];

        set({ pluginOrder: newOrder });
      },

      /**
       * Get current plugin count as PluginCount type
       *
       * @returns PluginCount (2 | 3 | 4 | 5)
       */
      getActiveCount: (): PluginCount => {
        const count = get().activePlugins.length;
        return clampPluginCount(count);
      },

      /**
       * Check if a plugin is active
       *
       * @param pluginId - Plugin ID to check
       * @returns true if plugin is in activePlugins
       */
      isPluginActive: (pluginId: PluginId): boolean => {
        return get().activePlugins.includes(pluginId);
      },

      /**
       * Check if a plugin can be toggled
       *
       * @param pluginId - Plugin ID to check
       * @returns true if plugin is toggleable
       *
       * @remarks
       * - Always-loaded plugins (chat, filetree) return false
       * - Active plugin: can toggle off if above min
       * - Inactive plugin: can toggle on if below max
       */
      canToggle: (pluginId: PluginId): boolean => {
        // Always-loaded plugins cannot be toggled
        if (ALWAYS_LOADED_PLUGINS.includes(pluginId as typeof ALWAYS_LOADED_PLUGINS[number])) {
          return false;
        }

        const { activePlugins } = get();
        const isActive = activePlugins.includes(pluginId);

        if (isActive) {
          // Can toggle off if above minimum
          return activePlugins.length > MIN_PLUGINS;
        } else {
          // Can toggle on if below maximum
          return activePlugins.length < MAX_PLUGINS;
        }
      },

      /**
       * Set hydration completion flag
       */
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),

      /**
       * Reset to default state
       */
      resetToDefaults: () =>
        set({
          activePlugins: [...DEFAULT_ACTIVE_PLUGINS],
          pluginOrder: [...DEFAULT_PLUGIN_ORDER],
        }),
    }),

    // ========================================================================
    // Persist Configuration
    // ========================================================================
    {
      name: 'bento-grid-storage',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// ============================================================================
// Selector Helpers
// ============================================================================

/**
 * Select active plugins array
 */
export const selectActivePlugins = (state: BentoGridState) => state.activePlugins;

/**
 * Select plugin order array
 */
export const selectPluginOrder = (state: BentoGridState) => state.pluginOrder;

/**
 * Select hydration status
 */
export const selectHasHydrated = (state: BentoGridState) => state._hasHydrated;

// ============================================================================
// No additional exports
// ============================================================================
