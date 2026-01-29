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

  /**
   * Get the currently active (visible) plugin for a panel
   * @param panel - Panel to query ('left' | 'main' | 'right')
   * @returns PluginId or null if no active plugin
   *
   * @remarks
   * This is different from getPluginsInPanel - multiple plugins can be
   * placed in a panel, but only ONE is "active" (visible) at a time.
   * Clicking an ActivityBar item switches the active plugin.
   */
  getActivePluginForPanel: (panel: 'left' | 'main' | 'right') => PluginId | null;

  /**
   * Set the active (visible) plugin for a panel
   * @param panel - Target panel
   * @param pluginId - Plugin to make active (must be placed in that panel)
   *
   * @remarks
   * Only sets active if the plugin is actually placed in that panel.
   * Does not trigger toast notifications (silent switch).
   */
  setActivePluginForPanel: (panel: 'left' | 'main' | 'right', pluginId: PluginId) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook Options Interface
 */
export interface UsePluginPlacementOptions {
  /** Project ID for per-project persistence (required for persistence) */
  projectId?: string;
  /** Initial placements (used as fallback if no saved config) */
  initialPlacements?: PluginPlacementEntry[];
}

/**
 * usePluginPlacement Hook
 *
 * @param options - Hook options including projectId and initialPlacements
 * @returns UsePluginPlacementReturn - State and actions for plugin placement
 *
 * @remarks
 * This hook manages the single-instance constraint for plugins.
 * A plugin can only exist in ONE panel at a time.
 *
 * **UXUI-03-07**: Persistence Feature
 * - Placements are saved to localStorage keyed by projectId
 * - On mount: loads from localStorage OR falls back to initialPlacements
 * - On change: automatically saves to localStorage
 * - resetToDefaults: clears saved config and resets to platform defaults
 *
 * @example
 * ```tsx
 * const {
 *   getPluginPanel,
 *   movePluginToPanel,
 *   getPluginsInPanel,
 *   isHydrated,
 * } = usePluginPlacement({
 *   projectId: 'my-project',
 *   initialPlacements: [
 *     { pluginId: 'filetree', panel: 'left' },
 *     { pluginId: 'chat', panel: 'right' },
 *   ],
 * });
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
  optionsOrInitialPlacements: UsePluginPlacementOptions | PluginPlacementEntry[] = []
): UsePluginPlacementReturn {
  // ========================================================================
  // Normalize Options (backward compatibility)
  // ========================================================================

  const options: UsePluginPlacementOptions = Array.isArray(optionsOrInitialPlacements)
    ? { initialPlacements: optionsOrInitialPlacements }
    : optionsOrInitialPlacements;

  const { projectId, initialPlacements = [] } = options;

  // ========================================================================
  // Toast Hook for Notifications
  // ========================================================================
  const { toast } = useToast();

  // ========================================================================
  // State: Hydration Status (UXUI-03-07)
  // ========================================================================

  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialMount = useRef(true);

  // ========================================================================
  // State: Placements
  // ========================================================================

  /**
   * Map of plugin ID to current panel position
   *
   * @remarks
   * Using Map for O(1) lookup and type-safe key management.
   * Initialized from localStorage (if projectId provided) OR initialPlacements.
   */
  const [placements, setPlacements] = useState<Map<PluginId, PanelPosition>>(() => {
    // Try to load from localStorage if projectId is provided
    if (projectId) {
      const saved = loadPlacements(projectId);
      if (saved && saved.size > 0) {
        console.log(`[usePluginPlacement] Initialized from localStorage for project ${projectId}`);
        return saved;
      }
    }

    // Fallback to initial placements
    const map = new Map<PluginId, PanelPosition>();
    initialPlacements.forEach((entry) => {
      map.set(entry.pluginId, entry.panel);
    });
    console.log('[usePluginPlacement] Initialized from default placements');
    return map;
  });

  // ========================================================================
  // State: Active Plugins Per Panel (UXUI-03-XX: Activity Bar Switching)
  // ========================================================================

  /**
   * Map of panel position to currently active (visible) plugin
   *
   * @remarks
   * This is SEPARATE from placements. Multiple plugins can be "placed" in a panel,
   * but only ONE is "active" (visible) at a time. Clicking an ActivityBar item
   * changes which plugin is active without moving plugins between panels.
   *
   * Initialized based on first placed plugin per panel from localStorage/defaults.
   */
  const [activePlugins, setActivePlugins] = useState<Map<'left' | 'main' | 'right', PluginId | null>>(() => {
    const map = new Map<'left' | 'main' | 'right', PluginId | null>([
      ['left', null],
      ['main', null],
      ['right', null],
    ]);

    // Set initial active plugin for each panel based on placements
    // (first plugin found in each panel)
    const panels: ('left' | 'main' | 'right')[] = ['left', 'main', 'right'];
    panels.forEach((panel) => {
      // Find first plugin in this panel from initial placements
      for (const entry of initialPlacements) {
        if (entry.panel === panel) {
          map.set(panel, entry.pluginId);
          break;
        }
      }
    });

    console.log('[usePluginPlacement] Initialized active plugins:', Object.fromEntries(map));
    return map;
  });

  // ========================================================================
  // Effect: Mark Hydration Complete
  // ========================================================================

  useEffect(() => {
    // Mark as hydrated after initial render
    setIsHydrated(true);
  }, []);

  // ========================================================================
  // Effect: Save Placements on Change (UXUI-03-07)
  // ========================================================================

  useEffect(() => {
    // Skip save on initial mount (we just loaded from storage)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Save to localStorage if projectId is provided
    if (projectId && placements.size > 0) {
      savePlacements(projectId, placements);
    }
  }, [projectId, placements]);

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

  /**
   * Reset placements to defaults and clear saved storage (UXUI-03-07)
   *
   * @param defaults - Optional default placements to reset to
   *
   * @remarks
   * This clears the saved localStorage for this project and resets
   * to the provided defaults (or initialPlacements if not provided).
   */
  const resetToDefaults = useCallback(
    (defaults?: PluginPlacementEntry[]): void => {
      // Clear saved storage
      if (projectId) {
        clearSavedPlacements(projectId);
      }

      // Reset to defaults
      const map = new Map<PluginId, PanelPosition>();
      const entries = defaults ?? initialPlacements;
      entries.forEach((entry) => {
        map.set(entry.pluginId, entry.panel);
      });
      setPlacements(map);

      toast('Plugin layout reset to defaults', 'info', 3000);
      console.log('[usePluginPlacement] Reset to defaults and cleared storage', entries);
    },
    [projectId, initialPlacements, toast]
  );

  // ========================================================================
  // Actions: Active Plugin Per Panel (Activity Bar Switching)
  // ========================================================================

  /**
   * Get the currently active (visible) plugin for a panel
   *
   * @remarks
   * This returns which plugin is currently being displayed in the Docker.
   * Multiple plugins can be "placed" in a panel, but only one is visible.
   */
  const getActivePluginForPanel = useCallback(
    (panel: 'left' | 'main' | 'right'): PluginId | null => {
      const activeId = activePlugins.get(panel);

      // If no active plugin set but there are plugins in this panel,
      // return the first one (fallback for backwards compatibility)
      if (!activeId) {
        const pluginsInPanel = getPluginsInPanel(panel);
        return pluginsInPanel[0] ?? null;
      }

      // Verify the active plugin is still placed in this panel
      const currentPlacement = placements.get(activeId);
      if (currentPlacement !== panel) {
        // Active plugin was moved or closed, return first available
        const pluginsInPanel = getPluginsInPanel(panel);
        return pluginsInPanel[0] ?? null;
      }

      return activeId;
    },
    [activePlugins, placements, getPluginsInPanel]
  );

  /**
   * Set the active (visible) plugin for a panel
   *
   * @remarks
   * This is a SILENT switch - no toast notifications.
   * Used when clicking ActivityBar items to switch between plugins in same panel.
   */
  const setActivePluginForPanel = useCallback(
    (panel: 'left' | 'main' | 'right', pluginId: PluginId): void => {
      // Verify plugin is actually placed in that panel
      const currentPlacement = placements.get(pluginId);
      if (currentPlacement !== panel) {
        console.warn(
          `[usePluginPlacement] Cannot set ${pluginId} as active for ${panel}: ` +
            `plugin is in ${currentPlacement ?? 'no panel'}`
        );
        return;
      }

      setActivePlugins((prev) => {
        const next = new Map(prev);
        next.set(panel, pluginId);
        console.log(`[usePluginPlacement] Set ${pluginId} as active in ${panel} panel`);
        return next;
      });
    },
    [placements]
  );

  // ========================================================================
  // Return Hook Interface
  // ========================================================================

  return useMemo(
    () => ({
      placements,
      isHydrated,
      getPluginPanel,
      movePluginToPanel,
      closePlugin,
      getPluginsInPanel,
      isPluginPlaced,
      resetPlacements,
      resetToDefaults,
      getActivePluginForPanel,
      setActivePluginForPanel,
    }),
    [
      placements,
      isHydrated,
      getPluginPanel,
      movePluginToPanel,
      closePlugin,
      getPluginsInPanel,
      isPluginPlaced,
      resetPlacements,
      resetToDefaults,
      getActivePluginForPanel,
      setActivePluginForPanel,
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
