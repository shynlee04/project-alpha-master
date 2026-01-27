/**
 * @fileoverview Panel Components Index
 * @module presentation/components/panels
 *
 * **Phase 2**: Panel Components for CSS Grid Layout
 *
 * This module re-exports plugin MainComponents as panel interfaces.
 * The actual panel rendering is handled by PluginPanel.tsx which:
 * - Gets plugins from the registry
 * - Renders plugin.MainComponent
 * - Provides consistent panel wrapper (optional header, border)
 *
 * Architecture Note:
 * - Panels ARE plugins - no separate wrapper components needed
 * - Each plugin's MainComponent handles its own header with context-specific info
 * - PluginPanel provides optional external header (drag handle, close button)
 * - CSS Grid layout uses fixed ratios from workflow-presets.ts
 *
 * @created 2026-01-27
 * @team Team A
 */

// ============================================================================
// Panel Type Mapping
// ============================================================================

/**
 * Panel ID to Plugin ID Mapping
 *
 * @remarks
 * Panels are directly mapped to plugins. The workflow presets reference
 * plugin IDs (e.g., 'chat', 'filetree') which are used to render panels
 * via the plugin registry.
 *
 * Available Panels (via Plugin Registry):
 * - chat      → ChatPlugin.tsx     → AgentChatPanel
 * - filetree  → FileTreePlugin.tsx → Direct implementation
 * - notes     → NotesPlugin.tsx    → NoteEditor
 * - monaco    → MonacoPlugin.tsx   → Monaco Editor
 * - preview   → PreviewPlugin.tsx  → Dev server iframe
 * - terminal  → TerminalPlugin.tsx → XTerminal
 */
export type PanelId = 'chat' | 'filetree' | 'notes' | 'monaco' | 'preview' | 'terminal';

// ============================================================================
// Re-exports from Plugin System
// ============================================================================

/**
 * Plugin Registry Functions
 *
 * @remarks
 * Use getPlugin(panelId) to get the FeaturePlugin object which includes:
 * - MainComponent: The React component to render
 * - id, name, icon: Panel identity
 * - requirements: Platform constraints
 */
export { getPlugin, getAllPlugins } from '@/infrastructure/plugins/plugin-registry';

/**
 * PluginPanel Component
 *
 * @remarks
 * The actual panel wrapper that renders any plugin.
 * Provides optional header with drag handle and close button.
 */
export { PluginPanel } from '@/presentation/layouts/PluginPanel';

/**
 * Workflow Presets
 *
 * @remarks
 * Predefined panel configurations for different workflows:
 * - default: Chat + FileTree + Notes (3:2:5)
 * - focus: Chat + FileTree (7:3)
 * - code: FileTree + Monaco + Preview (2:5:3)
 * - full-editor: Monaco only (100%)
 */
export {
  WORKFLOW_PRESETS,
  getPresetConfig,
  getAllPresets,
  type WorkflowPreset,
  type PresetConfig,
} from '@/presentation/layouts/workflow-presets';

// ============================================================================
// Panel Constants (for convenience)
// ============================================================================

/**
 * All available panel IDs
 */
export const PANEL_IDS: PanelId[] = [
  'chat',
  'filetree',
  'notes',
  'monaco',
  'preview',
  'terminal',
];

/**
 * Panel display names (i18n keys should be used in production)
 */
export const PANEL_NAMES: Record<PanelId, string> = {
  chat: 'Chat',
  filetree: 'Files',
  notes: 'Notes',
  monaco: 'Editor',
  preview: 'Preview',
  terminal: 'Terminal',
};
