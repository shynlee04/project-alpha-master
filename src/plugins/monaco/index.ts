/**
 * @fileoverview Monaco Plugin Public API
 * @module plugins/monaco
 *
 * **ARCH-02-05**: Monaco Plugin Exports
 *
 * Public API for Monaco plugin.
 * Exports plugin definition for registration in plugin-registry.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-05
 * @team Team B
 * @created 2026-01-21
 */

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Monaco Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Exported for:
 * - Plugin registration: `registerPlugin(monacoPlugin)`
 * - Component usage: `<monacoPlugin.MainComponent />`
 *
 * @see MonacoPlugin.tsx for implementation details
 */
export { monacoPlugin } from './MonacoPlugin';

// ============================================================================
// Types
// ============================================================================

/**
 * Monaco plugin types
 *
 * @remarks
 * Types for Monaco plugin integration.
 */
export type {
  EditorState,
  MonacoPluginProps,
  TabData,
} from './types';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Monaco plugin hook
 *
 * @remarks
 * Hook for accessing ProjectContext in Monaco plugin.
 * Provides direct access to gateway and file operations.
 */
export { useMonacoPlugin } from './useMonacoPlugin';
