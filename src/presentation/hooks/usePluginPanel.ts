/**
 * @fileoverview usePluginPanel Hook - React hook for Plugin Panel state management
 * @module presentation/hooks/usePluginPanel
 *
 * EPIC-UXUI-04: Plugin Panel System
 * Provides convenient access to plugin panel state and actions
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  useActivityBarStore,
  selectLeftBar,
  selectMainTopBar,
  selectRightBar,
} from '@/infrastructure/persistence/stores/activity-bar';
import type { PluginId } from '@/domain/types/plugin-types';
import type { ActivityBarPosition } from '@/presentation/components/layout/activity-bar-types';
import type {
  PluginPanelPosition,
  PluginMetadata,
  UsePluginPanelReturn,
} from '@/presentation/components/layout/plugin-panel-types';

// ============================================================================
// Plugin Metadata Registry
// ============================================================================

/**
 * Plugin metadata registry
 * Contains metadata for all available plugins
 */
const PLUGIN_METADATA: Record<PluginId, PluginMetadata> = {
  filetree: {
    id: 'filetree',
    name: 'File Explorer',
    description: 'Browse and manage project files',
    mobileSupported: true,
    desktopOnly: false,
  },
  monaco: {
    id: 'monaco',
    name: 'Code Editor',
    description: 'Edit code with syntax highlighting',
    mobileSupported: false,
    desktopOnly: true,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    description: 'Create and edit notes',
    mobileSupported: true,
    desktopOnly: false,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command line interface',
    mobileSupported: false,
    desktopOnly: true,
  },
  chat: {
    id: 'chat',
    name: 'Chat',
    description: 'AI assistant chat',
    mobileSupported: true,
    desktopOnly: false,
  },
  agents: {
    id: 'agents',
    name: 'Agents',
    description: 'AI agent management',
    mobileSupported: true,
    desktopOnly: false,
  },
  preview: {
    id: 'preview',
    name: 'Preview',
    description: 'Preview content',
    mobileSupported: true,
    desktopOnly: false,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the selector for a specific panel position
 */
function getBarSelector(position: PluginPanelPosition) {
  switch (position) {
    case 'left':
      return selectLeftBar;
    case 'main':
      return selectMainTopBar;
    case 'right':
      return selectRightBar;
    default:
      return selectLeftBar;
  }
}

/**
 * Get the activity bar position for a panel position
 */
function getBarPosition(position: PluginPanelPosition): ActivityBarPosition {
  switch (position) {
    case 'left':
      return 'left';
    case 'main':
      return 'main-top';
    case 'right':
      return 'right';
    default:
      return 'left';
  }
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * usePluginPanel Hook
 *
 * Provides access to plugin panel state and actions.
 * Uses useShallow for optimal re-rendering performance.
 *
 * @example
 * ```tsx
 * // Left panel
 * const { activePluginId, plugins, togglePlugin } = usePluginPanel('left');
 *
 * // Main panel
 * const { activePluginId, setActivePlugin } = usePluginPanel('main');
 *
 * // Right panel
 * const { isActive, getPluginMetadata } = usePluginPanel('right');
 * ```
 *
 * @param position - The panel position ('left' | 'main' | 'right')
 * @returns Plugin panel state and actions
 */
export function usePluginPanel(position: PluginPanelPosition): UsePluginPanelReturn {
  // Get bar state from store using useShallow for performance
  const barSelector = useMemo(() => getBarSelector(position), [position]);
  const barState = useActivityBarStore(useShallow(barSelector));

  // Get store actions
  const setActivePluginAction = useActivityBarStore((state) => state.setActivePlugin);
  const togglePluginAction = useActivityBarStore((state) => state.togglePlugin);

  // Get bar position for actions
  const barPosition = useMemo(() => getBarPosition(position), [position]);

  // ============================================================================
  // State
  // ============================================================================

  const activePluginId = barState.activePluginId;
  const plugins = barState.plugins;
  const hasPlugins = plugins.length > 0;
  const isActive = activePluginId !== null;

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Set the active plugin for this panel
   */
  const setActivePlugin = useCallback(
    (pluginId: PluginId | null) => {
      setActivePluginAction(barPosition, pluginId);
    },
    [setActivePluginAction, barPosition]
  );

  /**
   * Toggle plugin visibility in this panel
   */
  const togglePlugin = useCallback(
    (pluginId: PluginId) => {
      togglePluginAction(barPosition, pluginId);
    },
    [togglePluginAction, barPosition]
  );

  /**
   * Get metadata for a plugin
   */
  const getPluginMetadata = useCallback((pluginId: PluginId): PluginMetadata | undefined => {
    return PLUGIN_METADATA[pluginId];
  }, []);

  /**
   * Check if a specific plugin is currently active
   */
  const isPluginActive = useCallback(
    (pluginId: PluginId): boolean => {
      return activePluginId === pluginId;
    },
    [activePluginId]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    activePluginId,
    plugins,
    hasPlugins,
    isActive,
    setActivePlugin,
    togglePlugin,
    getPluginMetadata,
    isPluginActive,
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * usePluginPanelLeft Hook
 *
 * Convenient hook for accessing only the left plugin panel
 *
 * @example
 * ```tsx
 * const { activePluginId, plugins } = usePluginPanelLeft();
 * ```
 */
export function usePluginPanelLeft(): UsePluginPanelReturn {
  return usePluginPanel('left');
}

/**
 * usePluginPanelMain Hook
 *
 * Convenient hook for accessing only the main plugin panel
 *
 * @example
 * ```tsx
 * const { activePluginId, togglePlugin } = usePluginPanelMain();
 * ```
 */
export function usePluginPanelMain(): UsePluginPanelReturn {
  return usePluginPanel('main');
}

/**
 * usePluginPanelRight Hook
 *
 * Convenient hook for accessing only the right plugin panel
 *
 * @example
 * ```tsx
 * const { activePluginId, getPluginMetadata } = usePluginPanelRight();
 * ```
 */
export function usePluginPanelRight(): UsePluginPanelReturn {
  return usePluginPanel('right');
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Get metadata for any plugin (outside of React context)
 *
 * @param pluginId - The plugin ID
 * @returns Plugin metadata or undefined
 */
export function getPluginMetadata(pluginId: PluginId): PluginMetadata | undefined {
  return PLUGIN_METADATA[pluginId];
}

/**
 * Get all available plugins
 *
 * @returns Array of all plugin metadata
 */
export function getAllPlugins(): PluginMetadata[] {
  return Object.values(PLUGIN_METADATA);
}

/**
 * Get plugins by category
 *
 * @param desktopOnly - If true, returns only desktop-only plugins
 * @returns Array of plugin metadata
 */
export function getPluginsByDeviceSupport(desktopOnly: boolean): PluginMetadata[] {
  return Object.values(PLUGIN_METADATA).filter(
    (plugin) => plugin.desktopOnly === desktopOnly
  );
}
