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
// Bento Grid System (CC-AR-04)
// ============================================================================

export { useBentoGridStore } from './BentoGridStore';
export {
  selectActivePlugins as selectBentoActivePlugins,
  selectPluginOrder,
  selectHasHydrated as selectBentoHasHydrated,
} from './BentoGridStore';

export {
  BENTO_LAYOUTS,
  getBentoLayout,
  getCellByIndex,
  clampPluginCount,
  ALWAYS_LOADED_PLUGINS,
  TOGGLEABLE_PLUGINS,
  MIN_PLUGINS,
  MAX_PLUGINS,
} from './bento-layouts';
export type {
  PluginCount,
  CellSizeVariant,
  BentoCell,
  BentoLayout,
} from './bento-layouts';

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
