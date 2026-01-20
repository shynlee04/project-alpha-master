/**
 * @fileoverview FileTree Plugin Public API
 * @module plugins/filetree
 *
 * **ARCH-02-04**: FileTree Plugin Exports
 *
 * Public API for FileTree plugin.
 * Exports plugin definition for registration in plugin-registry.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-04
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * FileTree Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Exported for:
 * - Plugin registration: `registerPlugin(fileTreePlugin)`
 * - Component usage: `<fileTreePlugin.MainComponent />`
 *
 * @see FileTreePlugin.tsx for implementation details
 */
export { fileTreePlugin } from './FileTreePlugin';

// ============================================================================
// Types
// ============================================================================

/**
 * FileTree plugin types
 *
 * @remarks
 * Types for FileTree plugin integration.
 */
export type {
  TreeNode,
  ContextMenuState,
  SyncStatus,
  FileOperationDialogProps,
  ConfirmDialogProps,
  SyncStatusIndicatorProps,
} from './types';

/**
 * FileTree plugin props
 */
export type { FileTreePluginProps } from './types';

// ============================================================================
// Hooks
// ============================================================================

/**
 * FileTree plugin hook
 *
 * @remarks
 * Hook for accessing ProjectContext in FileTree plugin.
 * Provides direct access to gateway and file operations.
 */
export { useFileTreePlugin } from './useFileTreePlugin';
