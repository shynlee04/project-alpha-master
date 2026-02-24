/**
 * @fileoverview Plugin Panel Types - Shared type definitions for Plugin Panel system
 * @module presentation/components/layout/plugin-panel-types
 *
 * EPIC-UXUI-04: Plugin Panel System
 * - PluginPanelLeft (2 width) - associated with ActivityBarLeft
 * - PluginPanelMain (4 width) - associated with ActivityBarMainTop
 * - PluginPanelRight (2.5 width) - associated with ActivityBarRight
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 */

import type { ReactNode } from 'react';
import type { PluginId } from '@/domain/types/plugin-types';
import type { ActivityBarPosition } from './activity-bar-types';

// ============================================================================
// Plugin Panel Position Types
// ============================================================================

/**
 * Plugin panel position - determines width and associated activity bar
 */
export type PluginPanelPosition = 'left' | 'main' | 'right';

/**
 * Plugin panel width in grid units
 */
export type PluginPanelWidth = 2 | 4 | 2.5;

/**
 * Map of panel positions to their grid widths
 */
export const PANEL_WIDTHS: Record<PluginPanelPosition, PluginPanelWidth> = {
  left: 2,
  main: 4,
  right: 2.5,
};

/**
 * Map of panel positions to their associated activity bar positions
 */
export const PANEL_TO_BAR_MAP: Record<PluginPanelPosition, ActivityBarPosition> = {
  left: 'left',
  main: 'main-top',
  right: 'right',
};

// ============================================================================
// Plugin Component Registry
// ============================================================================

/**
 * Plugin component renderer function type
 */
export type PluginComponentRenderer = () => ReactNode;

/**
 * Plugin metadata for panel rendering
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: PluginId;

  /** Display name */
  name: string;

  /** Description for empty states */
  description: string;

  /** Whether plugin is available on mobile */
  mobileSupported: boolean;

  /** Whether plugin requires desktop features */
  desktopOnly: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Base props shared by all plugin panel components
 */
export interface PluginPanelBaseProps {
  /** Additional CSS class names */
  className?: string;

  /** Panel position (determines width and associated bar) */
  position: PluginPanelPosition;
}

/**
 * Props for PluginPanelContainer component
 */
export interface PluginPanelContainerProps extends PluginPanelBaseProps {
  /** Children content (plugin components) */
  children?: ReactNode;
}

/**
 * Props for individual plugin panel components
 */
export interface PluginPanelProps {
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * State for a single plugin panel
 */
export interface PluginPanelState {
  /** Currently active plugin ID (null if none) */
  activePluginId: PluginId | null;

  /** All plugins assigned to this panel's bar */
  plugins: PluginId[];

  /** Whether the panel has any plugins */
  hasPlugins: boolean;

  /** Whether the panel has an active plugin */
  isActive: boolean;
}

/**
 * Return type for usePluginPanel hook
 */
export interface UsePluginPanelReturn extends PluginPanelState {
  /** Set the active plugin */
  setActivePlugin: (pluginId: PluginId | null) => void;

  /** Toggle plugin visibility */
  togglePlugin: (pluginId: PluginId) => void;

  /** Get plugin metadata */
  getPluginMetadata: (pluginId: PluginId) => PluginMetadata | undefined;

  /** Check if a plugin is active */
  isPluginActive: (pluginId: PluginId) => boolean;
}

// ============================================================================
// Empty State Types
// ============================================================================

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  /** Icon to display (emoji or component) */
  icon: string;

  /** Primary message */
  message: string;

  /** Secondary hint text */
  hint: string;
}

/**
 * Default empty state configurations by panel position
 */
export const DEFAULT_EMPTY_STATES: Record<PluginPanelPosition, EmptyStateConfig> = {
  left: {
    icon: '📁',
    message: 'No plugin selected',
    hint: 'Click an icon in the left activity bar',
  },
  main: {
    icon: '📝',
    message: 'No plugin selected',
    hint: 'Click an icon in the main activity bar',
  },
  right: {
    icon: '💬',
    message: 'No plugin selected',
    hint: 'Click an icon in the right activity bar',
  },
};

// ============================================================================
// Constants
// ============================================================================

/**
 * CSS class prefix for plugin panels
 */
export const PANEL_CLASS_PREFIX = 'plugin-panel';

/**
 * Animation duration in milliseconds
 */
export const PANEL_TRANSITION_DURATION = 200;

/**
 * Default panel padding in pixels
 */
export const PANEL_PADDING = 16;
