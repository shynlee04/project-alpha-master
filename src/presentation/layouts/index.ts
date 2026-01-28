/**
 * @fileoverview Layouts Module Exports
 * @module presentation/layouts
 * @updated 2026-01-28
 *
 * Exports layout components and hooks.
 * Legacy layout components archived to: _bmad-ext/.archive/layout-cleanup-2026-01-28/
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-09
 * @team Team B
 * @created 2026-01-21
 */

// ============================================================================
// Layout Hooks
// ============================================================================

export { useBreakpoint, BREAKPOINTS, LAYOUT_RULES } from './useBreakpoint';
export type { Breakpoint } from './useBreakpoint';

// ============================================================================
// Workspace Layout (6-Column Grid)
// ============================================================================

export { WorkspaceLayout, type WorkspaceLayoutProps } from './WorkspaceLayout';

// ============================================================================
// Add Plugin Dialog
// ============================================================================

export { AddPluginDialog } from './AddPluginDialog';

// ============================================================================
// Workflow Presets
// ============================================================================

export {
  WORKFLOW_PRESETS,
  type WorkflowPreset,
  type PresetConfig,
  getPresetConfig,
  getAllPresets,
  getDefaultPresetForDevice,
} from './workflow-presets';

// ============================================================================
// Plugin Layout Store (Restored - still in use)
// ============================================================================

export { usePluginLayoutStore, type LayoutMode } from './PluginLayoutStore';
export {
  selectActivePlugins,
  selectLayoutMode,
  selectPanelSizes,
} from './PluginLayoutStore';

// ============================================================================
// Archived Components (2026-01-28):
// - PluginLayout → archived
// - PluginPanel → archived
// - MobilePluginNav → archived
// - layout-presets-store → archived
// See: _bmad-ext/.archive/layout-cleanup-2026-01-28/
// ============================================================================
