/**
 * @fileoverview Activity Bar Types - Shared type definitions for Activity Bar system
 * @module presentation/components/layout/activity-bar-types
 *
 * EPIC-UXUI-04: Three Activity Bar System
 * - ActivityBarLeft (vertical, left side)
 * - ActivityBarMainTop (horizontal, above main content)
 * - ActivityBarRight (vertical, right side)
 *
 * @story UXUI-04-03
 * @created 2026-01-30
 */

import type { LucideIcon } from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Activity Bar Position Types
// ============================================================================

/**
 * Activity bar position - determines orientation and placement
 */
export type ActivityBarPosition = 'left' | 'main-top' | 'right';

/**
 * Activity bar orientation - derived from position
 */
export type ActivityBarOrientation = 'vertical' | 'horizontal';

// ============================================================================
// Plugin Item Types
// ============================================================================

/**
 * Plugin item displayed in an activity bar
 */
export interface ActivityBarPluginItem {
  /** Unique plugin identifier */
  id: PluginId;

  /** Display name for tooltips */
  name: string;

  /** Icon component (Lucide icon) */
  icon: LucideIcon;

  /** Optional keyboard shortcut display */
  shortcut?: string;

  /** Whether the plugin is disabled */
  disabled?: boolean;

  /** Optional badge count */
  badge?: number;
}

// ============================================================================
// Activity Bar State Types
// ============================================================================

/**
 * State for a single activity bar
 */
export interface ActivityBarState {
  /** Plugin IDs in this bar (max 3) */
  plugins: PluginId[];

  /** Currently active plugin ID (null if none) */
  activePluginId: PluginId | null;
}

/**
 * Complete activity bars state for all three bars
 */
export interface ActivityBarsState {
  /** Left activity bar state */
  left: ActivityBarState;

  /** Main-top activity bar state */
  mainTop: ActivityBarState;

  /** Right activity bar state */
  right: ActivityBarState;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Base props shared by all activity bar components
 */
export interface ActivityBarBaseProps {
  /** Additional CSS class names */
  className?: string;

  /** Callback when a plugin is clicked/tapped */
  onPluginClick?: (pluginId: PluginId) => void;
}

/**
 * Props for ActivityBarLeft component
 */
export interface ActivityBarLeftProps extends ActivityBarBaseProps {
  /** Plugins to display in the left bar */
  plugins?: ActivityBarPluginItem[];

  /** Currently active plugin ID */
  activePluginId?: PluginId | null;
}

/**
 * Props for ActivityBarMainTop component
 */
export interface ActivityBarMainTopProps extends ActivityBarBaseProps {
  /** Plugins to display in the main-top bar */
  plugins?: ActivityBarPluginItem[];

  /** Currently active plugin ID */
  activePluginId?: PluginId | null;
}

/**
 * Props for ActivityBarRight component
 */
export interface ActivityBarRightProps extends ActivityBarBaseProps {
  /** Plugins to display in the right bar */
  plugins?: ActivityBarPluginItem[];

  /** Currently active plugin ID */
  activePluginId?: PluginId | null;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Return type for useActivityBar hook
 */
export interface UseActivityBarReturn {
  /** Current state of all activity bars */
  state: ActivityBarsState;

  /** Set plugins for a specific bar */
  setBarPlugins: (position: ActivityBarPosition, plugins: PluginId[]) => void;

  /** Set active plugin for a specific bar */
  setActivePlugin: (position: ActivityBarPosition, pluginId: PluginId | null) => void;

  /** Toggle plugin visibility in a bar */
  togglePlugin: (position: ActivityBarPosition, pluginId: PluginId) => void;

  /** Move plugin between bars (enforces single instance) */
  movePlugin: (pluginId: PluginId, from: ActivityBarPosition, to: ActivityBarPosition) => void;

  /** Check if a plugin is active in any bar */
  isPluginActive: (pluginId: PluginId) => boolean;

  /** Get which bar contains a plugin (if any) */
  getPluginBar: (pluginId: PluginId) => ActivityBarPosition | null;

  /** Check if a bar has reached max capacity (3 plugins) */
  isBarFull: (position: ActivityBarPosition) => boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum number of plugins per activity bar
 */
export const MAX_PLUGINS_PER_BAR = 3;

/**
 * Activity bar width in pixels (vertical bars)
 */
export const ACTIVITY_BAR_WIDTH = 48;

/**
 * Activity bar height in pixels (horizontal bar)
 */
export const ACTIVITY_BAR_HEIGHT = 48;

/**
 * Icon size in pixels
 */
export const ACTIVITY_BAR_ICON_SIZE = 24;

/**
 * Touch target minimum size in pixels
 */
export const ACTIVITY_BAR_TOUCH_TARGET = 44;
