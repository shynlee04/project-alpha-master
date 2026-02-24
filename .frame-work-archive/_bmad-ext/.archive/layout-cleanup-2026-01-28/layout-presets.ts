/**
 * @fileoverview Layout Presets - Pre-designed layout configurations
 * @module presentation/layouts/layout-presets
 *
 * **CC-AR-04**: Toggle-Based Layout System
 *
 * Provides pre-designed layout configurations for different plugin counts.
 * Used by PluginLayout to auto-select optimal layout based on active plugins.
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-04
 * @team Team A
 * @created 2026-01-26
 */

import type { LayoutMode } from './PluginLayoutStore';

// ============================================================================
// Layout Slot Configuration
// ============================================================================

/**
 * Layout Slot Configuration
 *
 * @remarks
 * Defines sizing and positioning for each slot in a layout preset.
 * - flex: Relative size (0-100)
 * - minWidth: Minimum width in pixels
 * - row: Row number for 2+1 layouts (1 = top, 2 = bottom)
 */
export interface LayoutSlot {
  /** Flex percentage (0-100) - relative size within row */
  flex: number;

  /** Minimum width in pixels */
  minWidth: number;

  /** Row number for multi-row layouts (1 or 2) */
  row?: number;
}

// ============================================================================
// Layout Preset Configuration
// ============================================================================

/**
 * Layout Preset Configuration
 *
 * @remarks
 * Defines a complete layout configuration:
 * - mode: LayoutMode string for the store
 * - pluginCount: Number of plugins this preset is designed for
 * - slots: Array of slot configurations
 */
export interface LayoutPreset {
  /** Layout mode identifier */
  mode: LayoutMode;

  /** Optimal plugin count for this preset */
  pluginCount: number;

  /** Slot configurations */
  slots: LayoutSlot[];
}

// ============================================================================
// Pre-designed Layout Presets
// ============================================================================

/**
 * Pre-designed Layout Presets
 *
 * @remarks
 * - Auto-selected based on active plugin count
 * - Optimized for common workflows
 * - 8-bit design compliant (sharp corners, no rounded edges)
 *
 * Layout patterns:
 * - 1-column: Single full-width panel
 * - 2-column: Sidebar (30%) + Main (70%)
 * - 3-column: Sidebar (20%) + Main (50%) + Secondary (30%)
 * - 4-plugin-2+2: Top row (3 panels) + Bottom row (1 panel)
 * - 5-plugin-3+2: Top row (4 panels) + Bottom row (1 panel)
 */
export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  '1-column': {
    mode: '1-column',
    pluginCount: 1,
    slots: [
      { flex: 100, minWidth: 300 },
    ],
  },

  '2-column': {
    mode: '2-column',
    pluginCount: 2,
    slots: [
      { flex: 30, minWidth: 200 },  // FileTree or sidebar
      { flex: 70, minWidth: 300 },  // Main editor
    ],
  },

  '3-column': {
    mode: '3-column',
    pluginCount: 3,
    slots: [
      { flex: 20, minWidth: 180 },  // FileTree
      { flex: 50, minWidth: 300 },  // Main editor
      { flex: 30, minWidth: 200 },  // Chat/Notes
    ],
  },

  '4-plugin-2+2': {
    mode: '2+1',
    pluginCount: 4,
    slots: [
      { flex: 25, minWidth: 180, row: 1 },  // FileTree
      { flex: 50, minWidth: 300, row: 1 },  // Editor
      { flex: 25, minWidth: 200, row: 1 },  // Chat
      { flex: 100, minWidth: 300, row: 2 }, // Terminal
    ],
  },

  '5-plugin-3+2': {
    mode: '2+1',
    pluginCount: 5,
    slots: [
      { flex: 15, minWidth: 150, row: 1 },  // FileTree
      { flex: 40, minWidth: 280, row: 1 },  // Editor
      { flex: 25, minWidth: 180, row: 1 },  // Preview
      { flex: 20, minWidth: 150, row: 1 },  // Chat
      { flex: 100, minWidth: 300, row: 2 }, // Terminal
    ],
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get optimal layout preset for given plugin count
 *
 * @param pluginCount - Number of active plugins
 * @returns LayoutPreset for the count, or default 2-column
 *
 * @remarks
 * Returns the best-matching preset based on plugin count.
 * Defaults to 2-column layout if count is unexpected.
 *
 * @example
 * ```ts
 * const preset = getLayoutPresetForCount(3);
 * // Returns LAYOUT_PRESETS['3-column']
 * ```
 */
export function getLayoutPresetForCount(pluginCount: number): LayoutPreset {
  switch (pluginCount) {
    case 0:
    case 1:
      return LAYOUT_PRESETS['1-column'];
    case 2:
      return LAYOUT_PRESETS['2-column'];
    case 3:
      return LAYOUT_PRESETS['3-column'];
    case 4:
      return LAYOUT_PRESETS['4-plugin-2+2'];
    case 5:
      return LAYOUT_PRESETS['5-plugin-3+2'];
    default:
      // For 6+ plugins, use 2+1 layout (max supported)
      return LAYOUT_PRESETS['5-plugin-3+2'];
  }
}

/**
 * Get slot configuration for a specific plugin index
 *
 * @param preset - Layout preset to use
 * @param index - Plugin index (0-based)
 * @returns LayoutSlot configuration, or default if index out of range
 */
export function getSlotForIndex(preset: LayoutPreset, index: number): LayoutSlot {
  if (index >= 0 && index < preset.slots.length) {
    return preset.slots[index];
  }
  // Default slot for out-of-range indices
  return { flex: 100, minWidth: 200 };
}

// ============================================================================
// No additional exports - types and functions exported above
// ============================================================================
