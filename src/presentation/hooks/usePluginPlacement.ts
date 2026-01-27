/**
 * @fileoverview usePluginPlacement Hook - Single Instance Plugin Panel Tracking
 * @module presentation/hooks/usePluginPlacement
 *
 * **UXUI-02-04b**: Single Instance Constraint
 *
 * Implements the ONE INSTANCE RULE: Plugin can only be open in ONE panel at a time.
 * If already open in left Docker, dragging to right Docker MOVES it (closes in left, opens in right).
 *
 * Key behaviors:
 * - Plugin can only exist in ONE panel at a time (left or right)
 * - Dragging MOVES the plugin (never duplicates)
 * - Same panel drop is a no-op
 *
 * @epic EPIC-UXUI-02
 * @story UXUI-02-04b
 * @team Team A
 * @created 2026-01-28
 */

import { useState, useCallback, useMemo } from 'react';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Panel Position Type
 *
 * @remarks
 * Defines which panel a plugin is currently placed in:
 * - 'left': Plugin is in the left docker panel
 * - 'right': Plugin is in the right docker panel
 * - null: Plugin is not placed in any panel (closed/hidden)
 */
export type PanelPosition = 'left' | 'right' | null;

/**
 * Plugin Placement Entry
 *
 * @remarks
 * Represents the initial placement of a plugin.
 * Used for initializing the hook with default placements.
 */
export interface PluginPlacementEntry {
  /** Plugin identifier */
  pluginId: PluginId;
  /** Panel the plugin is placed in */
  panel: 'left' | 'right';
}

/**
 * Plugin Placement Hook Return Type
 *
 * @remarks
 * Full interface for the usePluginPlacement hook.
 * Provides state and actions for plugin panel management.
 */
export interface UsePluginPlacementReturn {
  /** Map of plugin ID to panel position */
  placements: Map<PluginId, PanelPosition>;

  /**
   * Get the current panel for a plugin
   * @param pluginId - Plugin to check
   * @returns 'left' | 'right' | null
   */
  getPluginPanel: (pluginId: PluginId) => PanelPosition;

  /**
   * Move a plugin to a target panel (implements single instance rule)
   *
   * @param pluginId - Plugin to move
   * @param targetPanel - Target panel ('left' | 'right')
   * @returns boolean - true if moved, false if already in target panel
   *
   * @remarks
   * - If plugin is already in target panel: no-op, returns false
   * - If plugin is in other panel: removes from old, adds to new, returns true
   * - If plugin is not placed: adds to target panel, returns true
   */
  movePluginToPanel: (pluginId: PluginId, targetPanel: 'left' | 'right') => boolean;

  /**
   * Close a plugin (remove from any panel)
   * @param pluginId - Plugin to close
   */
  closePlugin: (pluginId: PluginId) => void;

  /**
   * Get all plugins currently in a specific panel
   * @param panel - Panel to query ('left' | 'right')
   * @returns Array of plugin IDs in that panel
   */
  getPluginsInPanel: (panel: 'left' | 'right') => PluginId[];

  /**
   * Check if a plugin is currently placed in any panel
   * @param pluginId - Plugin to check
   * @returns boolean - true if plugin is in a panel
   */
  isPluginPlaced: (pluginId: PluginId) => boolean;

  /**
   * Reset placements to initial configuration
   * @param initialPlacements - Optional new initial placements
   */
  resetPlacements: (initialPlacements?: PluginPlacementEntry[]) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * usePluginPlacement Hook
 *
 * @param initialPlacements - Optional initial plugin placements
 * @returns UsePluginPlacementReturn - State and actions for plugin placement
 *
 * @remarks
 * This hook manages the single-instance constraint for plugins.
 * A plugin can only exist in ONE panel at a time.
 *
 * @example
 * ```tsx
 * const {
 *   getPluginPanel,
 *   movePluginToPanel,
 *   getPluginsInPanel,
 * } = usePluginPlacement([
 *   { pluginId: 'filetree', panel: 'left' },
 *   { pluginId: 'chat', panel: 'right' },
 * ]);
 *
 * // In PluginDocker:
 * <PluginDocker
 *   position="right"
 *   onPluginDrop={(pluginId) => movePluginToPanel(pluginId, 'right')}
 * >
 *   {getPluginsInPanel('right').map(pluginId => (
 *     <PluginRenderer key={pluginId} pluginId={pluginId} />
 *   ))}
 * </PluginDocker>
 * ```
 */
export function usePluginPlacement(
  initialPlacements: PluginPlacementEntry[] = []
): UsePluginPlacementReturn {
  // ========================================================================
  // State
  // ========================================================================

  /**
   * Map of plugin ID to current panel position
   *
   * @remarks
   * Using Map for O(1) lookup and type-safe key management.
   * Initialized from initialPlacements array.
   */
  const [placements, setPlacements] = useState<Map<PluginId, PanelPosition>>(() => {
    const map = new Map<PluginId, PanelPosition>();
    initialPlacements.forEach((entry) => {
      map.set(entry.pluginId, entry.panel);
    });
    return map;
  });

  // ========================================================================
  // Actions
  // ========================================================================

  /**
   * Get the current panel for a plugin
   */
  const getPluginPanel = useCallback(
    (pluginId: PluginId): PanelPosition => {
      return placements.get(pluginId) ?? null;
    },
    [placements]
  );

  /**
   * Move plugin to a target panel (single instance rule)
   *
   * @remarks
   * Implementation of the ONE INSTANCE RULE:
   * - If plugin is already in target panel → no-op (return false)
   * - If plugin is in other panel → move (return true)
   * - If plugin is not placed → add to target (return true)
   */
  const movePluginToPanel = useCallback(
    (pluginId: PluginId, targetPanel: 'left' | 'right'): boolean => {
      const currentPanel = placements.get(pluginId);

      // Already in target panel - no-op
      if (currentPanel === targetPanel) {
        console.log(
          `[usePluginPlacement] Plugin ${pluginId} already in ${targetPanel} panel - no-op`
        );
        return false;
      }

      // Move plugin to new panel
      setPlacements((prev) => {
        const next = new Map(prev);
        next.set(pluginId, targetPanel);
        return next;
      });

      // Log the move operation
      if (currentPanel) {
        console.log(
          `[usePluginPlacement] Moved ${pluginId} from ${currentPanel} to ${targetPanel}`
        );
      } else {
        console.log(
          `[usePluginPlacement] Added ${pluginId} to ${targetPanel} panel`
        );
      }

      return true;
    },
    [placements]
  );

  /**
   * Close a plugin (remove from any panel)
   */
  const closePlugin = useCallback((pluginId: PluginId): void => {
    setPlacements((prev) => {
      const next = new Map(prev);
      const hadPlugin = next.has(pluginId);
      next.delete(pluginId);

      if (hadPlugin) {
        console.log(`[usePluginPlacement] Closed plugin ${pluginId}`);
      }

      return next;
    });
  }, []);

  /**
   * Get all plugins in a specific panel
   *
   * @remarks
   * Uses useMemo for memoization to prevent unnecessary re-renders
   * when placements haven't changed.
   */
  const getPluginsInPanel = useCallback(
    (panel: 'left' | 'right'): PluginId[] => {
      const result: PluginId[] = [];
      placements.forEach((p, pluginId) => {
        if (p === panel) {
          result.push(pluginId);
        }
      });
      return result;
    },
    [placements]
  );

  /**
   * Check if a plugin is placed in any panel
   */
  const isPluginPlaced = useCallback(
    (pluginId: PluginId): boolean => {
      const panel = placements.get(pluginId);
      return panel !== null && panel !== undefined;
    },
    [placements]
  );

  /**
   * Reset placements to initial configuration
   */
  const resetPlacements = useCallback(
    (newInitialPlacements?: PluginPlacementEntry[]): void => {
      const map = new Map<PluginId, PanelPosition>();
      const entries = newInitialPlacements ?? initialPlacements;
      entries.forEach((entry) => {
        map.set(entry.pluginId, entry.panel);
      });
      setPlacements(map);
      console.log('[usePluginPlacement] Reset placements', entries);
    },
    [initialPlacements]
  );

  // ========================================================================
  // Return Hook Interface
  // ========================================================================

  return useMemo(
    () => ({
      placements,
      getPluginPanel,
      movePluginToPanel,
      closePlugin,
      getPluginsInPanel,
      isPluginPlaced,
      resetPlacements,
    }),
    [
      placements,
      getPluginPanel,
      movePluginToPanel,
      closePlugin,
      getPluginsInPanel,
      isPluginPlaced,
      resetPlacements,
    ]
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create default plugin placements for a project
 *
 * @param preset - Workflow preset ('default' | 'focus' | 'code' | 'full-editor')
 * @returns Array of PluginPlacementEntry for initial setup
 *
 * @example
 * ```tsx
 * const initialPlacements = getDefaultPlacements('code');
 * const { getPluginsInPanel } = usePluginPlacement(initialPlacements);
 * ```
 */
export function getDefaultPlacements(
  preset: 'default' | 'focus' | 'code' | 'full-editor' = 'default'
): PluginPlacementEntry[] {
  switch (preset) {
    case 'focus':
      // Focus mode: Just notes
      return [{ pluginId: 'notes', panel: 'left' }];

    case 'code':
      // Code mode: FileTree + Monaco + Terminal
      return [
        { pluginId: 'filetree', panel: 'left' },
        { pluginId: 'terminal', panel: 'right' },
      ];

    case 'full-editor':
      // Full editor mode: FileTree + Monaco + Chat
      return [
        { pluginId: 'filetree', panel: 'left' },
        { pluginId: 'chat', panel: 'right' },
      ];

    case 'default':
    default:
      // Default: FileTree left, Chat right
      return [
        { pluginId: 'filetree', panel: 'left' },
        { pluginId: 'chat', panel: 'right' },
      ];
  }
}

// ============================================================================
// No additional exports - hook and helpers exported above
// ============================================================================
