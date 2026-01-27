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
export { MobilePluginNav } from './MobilePluginNav';

// ============================================================================
// Layout Hooks
// ============================================================================

export { useBreakpoint, BREAKPOINTS, LAYOUT_RULES } from './useBreakpoint';
export type { Breakpoint } from './useBreakpoint';

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
// Bento Grid System (ARCHIVED 2026-01-28 - UXUI-02-08)
// ============================================================================
// The Bento Grid system has been archived. See _bmad-ext/.archive/bento-grid-2026-01-28/
// for the archived files.
//
// The PluginLayoutStore now provides:
// - usePluginLayoutStore: Main store for plugin state
// - togglePlugin: Add/remove plugins
// - selectIsPluginActive: Check if plugin is active

// ============================================================================
// Layout Presets (ARCH-03-03)
// ============================================================================

export {
  useLayoutPresetsStore,
  type LayoutPreset,
  BUILT_IN_PRESETS,
} from '@/infrastructure/persistence/stores/layout-presets-store';

// ============================================================================
// No additional exports
// ============================================================================
