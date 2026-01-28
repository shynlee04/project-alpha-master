/**
 * @fileoverview usePluginPlacement Hook - Single Instance Plugin Panel Tracking
 * @module presentation/hooks/usePluginPlacement
 *
 * **UXUI-02-04b**: Single Instance Constraint
 * **UXUI-03-07**: Persist Plugin Placements (localStorage per projectId)
 *
 * Implements the ONE INSTANCE RULE: Plugin can only be open in ONE panel at a time.
 * If already open in left Docker, dragging to right Docker MOVES it (closes in left, opens in right).
 *
 * Key behaviors:
 * - Plugin can only exist in ONE panel at a time (left or right)
 * - Dragging MOVES the plugin (never duplicates)
 * - Same panel drop is a no-op
 * - Placements persist to localStorage keyed by projectId (UXUI-03-07)
 * - Fallback to defaults if no saved config
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-07
 * @team Team A
 * @created 2026-01-28
 * @updated 2026-01-28
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { PluginId } from '@/domain/types/plugin-types';
import { useToast } from '@/presentation/components/ui/Toast/ToastContext';

// ============================================================================
// Persistence Constants & Types (UXUI-03-07)
// ============================================================================

/**
 * LocalStorage key prefix for plugin placements
 * Format: plugin-placements-{projectId}
 */
const STORAGE_KEY_PREFIX = 'plugin-placements';

/**
 * Storage format version for migration support
 */
const STORAGE_VERSION = 1;

/**
 * Stored placement data structure
 */
interface StoredPlacementData {
  version: number;
  placements: Record<string, PanelPosition>;
}

// ============================================================================
// Persistence Helper Functions (UXUI-03-07)
// ============================================================================

/**
 * Generate storage key for a specific project
 *
 * @param projectId - Project identifier
 * @returns localStorage key
 */
function getStorageKey(projectId: string): string {
  return `${STORAGE_KEY_PREFIX}-${projectId}`;
}

/**
 * Save placements to localStorage
 *
 * @param projectId - Project identifier
 * @param placements - Map of plugin placements
 *
 * @remarks
 * Converts Map to plain object for JSON serialization.
 * Includes version number for future migration support.
 */
export function savePlacements(
  projectId: string,
  placements: Map<PluginId, PanelPosition>
): void {
  if (!projectId) {
    console.warn('[usePluginPlacement] Cannot save: no projectId provided');
    return;
  }

  try {
    const data: StoredPlacementData = {
      version: STORAGE_VERSION,
      placements: Object.fromEntries(placements),
    };
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(data));
    console.log(`[usePluginPlacement] Saved placements for project ${projectId}`, data);
  } catch (error) {
    console.error('[usePluginPlacement] Failed to save placements:', error);
  }
}

/**
 * Load placements from localStorage
 *
 * @param projectId - Project identifier
 * @returns Map of plugin placements or null if not found
 *
 * @remarks
 * Handles migration from old storage format.
 * Returns null if no saved data or invalid data.
 */
export function loadPlacements(
  projectId: string
): Map<PluginId, PanelPosition> | null {
  if (!projectId) {
    console.warn('[usePluginPlacement] Cannot load: no projectId provided');
    return null;
  }

  try {
    const raw = localStorage.getItem(getStorageKey(projectId));
    if (!raw) {
      console.log(`[usePluginPlacement] No saved placements for project ${projectId}`);
      return null;
    }

    const parsed = JSON.parse(raw);

    // Handle versioned format
    if (parsed.version && parsed.placements) {
      const data = parsed as StoredPlacementData;
      const map = new Map<PluginId, PanelPosition>();
      Object.entries(data.placements).forEach(([key, value]) => {
        // Validate panel position
        if (value === 'left' || value === 'main' || value === 'right' || value === null) {
          map.set(key as PluginId, value);
        }
      });
      console.log(`[usePluginPlacement] Loaded placements for project ${projectId}`, data);
      return map;
    }

    // Handle legacy format (direct object without version)
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      const map = new Map<PluginId, PanelPosition>();
      Object.entries(parsed).forEach(([key, value]) => {
        if (value === 'left' || value === 'main' || value === 'right' || value === null) {
          map.set(key as PluginId, value as PanelPosition);
        }
      });
      console.log(`[usePluginPlacement] Migrated legacy placements for project ${projectId}`);
      return map;
    }

    console.warn('[usePluginPlacement] Invalid storage format, returning null');
    return null;
  } catch (error) {
    console.error('[usePluginPlacement] Failed to load placements:', error);
    return null;
  }
}

/**
 * Clear saved placements for a project
 *
 * @param projectId - Project identifier
 */
export function clearSavedPlacements(projectId: string): void {
  if (!projectId) return;
  try {
    localStorage.removeItem(getStorageKey(projectId));
    console.log(`[usePluginPlacement] Cleared placements for project ${projectId}`);
  } catch (error) {
    console.error('[usePluginPlacement] Failed to clear placements:', error);
  }
}

// ============================================================================
// Types
// ============================================================================

/**
 * Panel Position Type
 *
 * @remarks
 * Defines which panel a plugin is currently placed in:
 * - 'left': Plugin is in the left docker panel
 * - 'main': Plugin is in the main content area (Activity Bar TOP)
 * - 'right': Plugin is in the right docker panel
 * - null: Plugin is not placed in any panel (closed/hidden)
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-02
 * @gap GAP-04, GAP-14
 */
export type PanelPosition = 'left' | 'main' | 'right' | null;

/**
 * Plugin Placement Entry
 *
 * @remarks
 * Represents the initial placement of a plugin.
 * Used for initializing the hook with default placements.
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-02
 */
export interface PluginPlacementEntry {
  /** Plugin identifier */
  pluginId: PluginId;
  /** Panel the plugin is placed in */
  panel: 'left' | 'main' | 'right';
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

  /** Whether placements have been loaded from storage (hydrated) */
  isHydrated: boolean;

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
   * @param targetPanel - Target panel ('left' | 'main' | 'right')
   * @returns boolean - true if moved, false if already in target panel
   *
   * @remarks
   * - If plugin is already in target panel: no-op, returns false
   * - If plugin is in other panel: removes from old, adds to new, returns true
   * - If plugin is not placed: adds to target panel, returns true
   */
  movePluginToPanel: (pluginId: PluginId, targetPanel: 'left' | 'main' | 'right') => boolean;

  /**
   * Close a plugin (remove from any panel)
   * @param pluginId - Plugin to close
   */
  closePlugin: (pluginId: PluginId) => void;

  /**
   * Get all plugins currently in a specific panel
   * @param panel - Panel to query ('left' | 'main' | 'right')
   * @returns Array of plugin IDs in that panel
   */
  getPluginsInPanel: (panel: 'left' | 'main' | 'right') => PluginId[];

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

  /**
   * Reset placements to defaults and clear saved storage
   * @param defaults - Default placements to reset to
   */
  resetToDefaults: (defaults?: PluginPlacementEntry[]) => void;
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
  // Toast Hook for Notifications
  // ========================================================================
  const { toast } = useToast();

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
    (pluginId: PluginId, targetPanel: 'left' | 'main' | 'right'): boolean => {
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

      // Show toast notification for the move operation
      const panelLabel = targetPanel === 'main' ? 'center' : targetPanel;
      if (currentPanel) {
        const fromLabel = currentPanel === 'main' ? 'center' : currentPanel;
        toast(
          `Moving ${getPluginDisplayName(pluginId)} from ${fromLabel} to ${panelLabel} panel`,
          'info',
          3000
        );
        console.log(
          `[usePluginPlacement] Moved ${pluginId} from ${currentPanel} to ${targetPanel}`
        );
      } else {
        toast(
          `Moving ${getPluginDisplayName(pluginId)} to ${panelLabel} panel`,
          'info',
          3000
        );
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
    (panel: 'left' | 'main' | 'right'): PluginId[] => {
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
 * Get human-readable display name for a plugin
 *
 * @param pluginId - Plugin identifier
 * @returns Human-readable name for the plugin
 *
 * @example
 * ```ts
 * getPluginDisplayName('filetree'); // 'File Tree'
 * getPluginDisplayName('monaco'); // 'Code Editor'
 * ```
 */
function getPluginDisplayName(pluginId: PluginId): string {
  const displayNames: Record<PluginId, string> = {
    filetree: 'File Tree',
    monaco: 'Code Editor',
    notes: 'Notes',
    terminal: 'Terminal',
    chat: 'Chat',
    agents: 'Agents',
    preview: 'Preview',
  };
  return displayNames[pluginId] ?? pluginId;
}

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
