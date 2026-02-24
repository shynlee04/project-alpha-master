/**
 * @fileoverview usePluginDocker Hook - React hook for Plugin Docker state management
 * @module presentation/hooks/usePluginDocker
 *
 * EPIC-UXUI-04: Plugin Docker Component
 * Provides state management and filtering logic for the plugin docker
 *
 * @story UXUI-04-04
 * @created 2026-01-30
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  FolderOpen,
  FileText,
  MessageSquare,
  Code,
  Terminal,
  Bot,
  Eye,
} from 'lucide-react';
import { useActivityBarStore } from '@/infrastructure/persistence/stores/activity-bar';
import type { PluginId } from '@/domain/types/plugin-types';
import type {
  DockerPluginDefinition,
  UsePluginDockerReturn,
  PluginDockerState,
} from '@/presentation/components/layout/docker-types';

// ============================================================================
// Mock Plugin Data
// ============================================================================

/**
 * Default plugin configurations
 * Maps plugin IDs to their metadata
 */
const DEFAULT_PLUGINS: Record<PluginId, Omit<DockerPluginDefinition, 'id'>> = {
  filetree: {
    name: 'Files',
    icon: FolderOpen,
    availability: 'always',
    description: 'File explorer and project management',
    shortcut: 'Ctrl+Shift+E',
  },
  notes: {
    name: 'Notes',
    icon: FileText,
    availability: 'always',
    description: 'Markdown notes editor',
    shortcut: 'Ctrl+Shift+N',
  },
  chat: {
    name: 'Chat',
    icon: MessageSquare,
    availability: 'always',
    description: 'AI assistant chat',
    shortcut: 'Ctrl+Shift+C',
  },
  monaco: {
    name: 'Editor',
    icon: Code,
    availability: 'pc_only',
    description: 'Code editor with syntax highlighting',
    shortcut: 'Ctrl+1',
  },
  terminal: {
    name: 'Terminal',
    icon: Terminal,
    availability: 'pc_only',
    description: 'Integrated terminal',
    shortcut: 'Ctrl+`',
  },
  agents: {
    name: 'Agents',
    icon: Bot,
    availability: 'always',
    description: 'Agentic tool execution',
    shortcut: 'Ctrl+Shift+A',
  },
  preview: {
    name: 'Preview',
    icon: Eye,
    availability: 'always',
    description: 'File preview panel',
    shortcut: 'Ctrl+Shift+V',
  },
};

/**
 * All available plugin IDs
 */
const ALL_PLUGIN_IDS: PluginId[] = [
  'filetree',
  'notes',
  'chat',
  'monaco',
  'terminal',
  'agents',
  'preview',
];

// ============================================================================
// Device Detection
// ============================================================================
function isPCDevice(): boolean {
  if (typeof navigator === 'undefined') return true;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return !mobileRegex.test(navigator.userAgent);
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * usePluginDocker Hook
 *
 * Provides state management and filtering for the Plugin Docker component.
 * Handles device-aware filtering and activity bar assignment tracking.
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   toggleExpanded,
 *   getFilteredPlugins,
 *   isPluginInActivityBar,
 * } = usePluginDocker();
 *
 * // Get plugins available to drag
 * const availablePlugins = getFilteredPlugins();
 *
 * // Check if plugin is already assigned
 * const isAssigned = isPluginInActivityBar('filetree');
 * ```
 */
export function usePluginDocker(): UsePluginDockerReturn {
  // ============================================================================
  // Local State
  // ============================================================================

  const [isExpanded, setIsExpanded] = useState(true);
  const [isPC, setIsPC] = useState(true);

  // ============================================================================
  // Activity Bar State (from Zustand store)
  // ============================================================================

  const leftBarPlugins = useActivityBarStore(
    useShallow((state) => state.left.plugins)
  );
  const mainTopBarPlugins = useActivityBarStore(
    useShallow((state) => state.mainTop.plugins)
  );
  const rightBarPlugins = useActivityBarStore(
    useShallow((state) => state.right.plugins)
  );

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Detect device type on mount
   */
  useEffect(() => {
    setIsPC(isPCDevice());
  }, []);

  // ============================================================================
  // Memoized Values
  // ============================================================================

  /**
   * All plugins with their definitions
   */
  const allPlugins = useMemo((): DockerPluginDefinition[] => {
    return ALL_PLUGIN_IDS.map((id) => ({
      id,
      ...DEFAULT_PLUGINS[id],
    }));
  }, []);

  /**
   * All plugins currently assigned to activity bars
   */
  const assignedPlugins = useMemo((): Set<PluginId> => {
    return new Set([
      ...leftBarPlugins,
      ...mainTopBarPlugins,
      ...rightBarPlugins,
    ]);
  }, [leftBarPlugins, mainTopBarPlugins, rightBarPlugins]);

  /**
   * Docker state object
   */
  const state: PluginDockerState = useMemo(
    () => ({
      isExpanded,
      expandedWidth: 240,
      availablePlugins: allPlugins,
    }),
    [isExpanded, allPlugins]
  );

  // ============================================================================
  // Callbacks
  // ============================================================================

  /**
   * Toggle expand/collapse state
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /**
   * Set explicit expand state
   */
  const setExpanded = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
  }, []);

  /**
   * Check if a plugin is available on the current device
   */
  const isPluginAvailableOnDevice = useCallback(
    (pluginId: PluginId): boolean => {
      const plugin = DEFAULT_PLUGINS[pluginId];
      if (!plugin) return false;

      // PC-only plugins are only available on PC devices
      if (plugin.availability === 'pc_only' && !isPC) {
        return false;
      }

      return true;
    },
    [isPC]
  );

  /**
   * Check if a plugin is already assigned to an activity bar
   */
  const isPluginInActivityBar = useCallback(
    (pluginId: PluginId): boolean => {
      return assignedPlugins.has(pluginId);
    },
    [assignedPlugins]
  );

  /**
   * Get all plugins available for current device
   */
  const getAvailablePlugins = useCallback((): DockerPluginDefinition[] => {
    return allPlugins.filter((plugin) => isPluginAvailableOnDevice(plugin.id));
  }, [allPlugins, isPluginAvailableOnDevice]);

  /**
   * Get plugins filtered by availability (not in activity bars)
   * This is the main list shown in the docker
   */
  const getFilteredPlugins = useCallback((): DockerPluginDefinition[] => {
    return allPlugins.filter((plugin) => {
      // Must be available on current device
      if (!isPluginAvailableOnDevice(plugin.id)) {
        return false;
      }

      // Must NOT be in any activity bar
      if (isPluginInActivityBar(plugin.id)) {
        return false;
      }

      return true;
    });
  }, [allPlugins, isPluginAvailableOnDevice, isPluginInActivityBar]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    state,
    toggleExpanded,
    setExpanded,
    getAvailablePlugins,
    isPluginAvailableOnDevice,
    isPluginInActivityBar,
    getFilteredPlugins,
  };
}

