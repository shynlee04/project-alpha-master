/**
 * @fileoverview Docker Types - Type definitions for Plugin Docker system
 * @module presentation/components/layout/docker-types
 *
 * EPIC-UXUI-04: Plugin Docker Component
 * Type definitions for the plugin docker that serves as the source of plugins
 *
 * @story UXUI-04-04
 * @created 2026-01-30
 */

import type { LucideIcon } from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Plugin Definition Types
// ============================================================================

/**
 * Plugin availability category
 * - always: Available on all devices
 * - pc_only: Only available on PC (IDE plugins like Monaco, Terminal)
 */
export type PluginAvailability = 'always' | 'pc_only';

/**
 * Plugin definition for the docker
 * Contains metadata about a plugin that can be dragged to activity bars
 */
export interface DockerPluginDefinition {
  /** Unique plugin identifier */
  id: PluginId;

  /** Display name shown in the docker */
  name: string;

  /** Icon component (Lucide icon) */
  icon: LucideIcon;

  /** Availability category for device filtering */
  availability: PluginAvailability;

  /** Optional description for tooltips */
  description?: string;

  /** Optional keyboard shortcut display */
  shortcut?: string;
}

// ============================================================================
// Docker State Types
// ============================================================================

/**
 * Docker panel state
 */
export interface PluginDockerState {
  /** Whether the docker panel is expanded */
  isExpanded: boolean;

  /** Width when expanded (in pixels) */
  expandedWidth: number;

  /** Currently filtered plugins based on device and assignments */
  availablePlugins: DockerPluginDefinition[];
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for PluginDocker component
 */
export interface PluginDockerProps {
  /** Additional CSS class names */
  className?: string;

  /** Callback when expand/collapse state changes */
  onExpandedChange?: (isExpanded: boolean) => void;

  /** Callback when a plugin is selected (for drag-drop preparation) */
  onPluginSelect?: (plugin: DockerPluginDefinition) => void;
}

/**
 * Props for PluginDockerItem component
 */
export interface PluginDockerItemProps {
  /** Plugin definition to display */
  plugin: DockerPluginDefinition;

  /** Whether the item is being dragged */
  isDragging?: boolean;

  /** Callback when item is clicked */
  onClick?: (plugin: DockerPluginDefinition) => void;

  /** Callback when drag starts */
  onDragStart?: (plugin: DockerPluginDefinition) => void;

  /** Callback when drag ends */
  onDragEnd?: () => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for usePluginDocker hook
 */
export interface UsePluginDockerReturn {
  /** Current docker state */
  state: PluginDockerState;

  /** Toggle expand/collapse state */
  toggleExpanded: () => void;

  /** Set explicit expand state */
  setExpanded: (isExpanded: boolean) => void;

  /** Get all plugins available for current device */
  getAvailablePlugins: () => DockerPluginDefinition[];

  /** Check if a plugin is available on current device */
  isPluginAvailableOnDevice: (pluginId: PluginId) => boolean;

  /** Check if a plugin is already assigned to an activity bar */
  isPluginInActivityBar: (pluginId: PluginId) => boolean;

  /** Get plugins filtered by availability (not in activity bars) */
  getFilteredPlugins: () => DockerPluginDefinition[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default docker width when expanded (in pixels)
 */
export const DOCKER_EXPANDED_WIDTH = 240;

/**
 * Docker width when collapsed (in pixels) - icon only
 */
export const DOCKER_COLLAPSED_WIDTH = 48;

/**
 * Plugin icon size in the docker
 */
export const DOCKER_ICON_SIZE = 24;

/**
 * Plugin item height
 */
export const DOCKER_ITEM_HEIGHT = 48;

/**
 * Maximum number of plugins to show before scrolling
 */
export const DOCKER_MAX_VISIBLE_PLUGINS = 10;
