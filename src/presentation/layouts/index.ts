/**
 * @fileoverview Layouts Module Exports
 * @module presentation/layouts
 *
 * Exports all layout components and stores.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-09
 * @team Team B
 * @created 2026-01-21
 */

// ============================================================================
// Main Layout Components
// ============================================================================

export { PluginLayout } from './PluginLayout';
export { PluginPanel } from './PluginPanel';

// ============================================================================
// Layout Stores
// ============================================================================

export { usePluginLayoutStore } from './PluginLayoutStore';
export type { LayoutMode } from './PluginLayoutStore';
export {
  selectActivePlugins,
  selectLayoutMode,
  selectPanelSizes,
} from './PluginLayoutStore';

// ============================================================================
// No additional exports
// ============================================================================
