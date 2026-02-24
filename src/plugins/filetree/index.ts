/**
 * @fileoverview FileTree Plugin Public API
 * @module plugins/filetree
 *
 * **PLAT-02, PLAT-05**: FileTree Platform Operator Exports
 *
 * Public API for FileTree plugin including:
 * - Plugin definition for registration
 * - FileTreeOperator for lifecycle management
 * - useFileTreeOperations hook for CRUD
 * - ProjectSelector component for project switching
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PLAT-02, PLAT-05
 * @team Team A
 * @created 2026-01-21
 * @updated 2026-02-01
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
// Platform Operator
// ============================================================================

/**
 * FileTreeOperator - Platform Operator for file tree lifecycle
 *
 * @remarks
 * Implements IPlatformOperator interface.
 * Manages event subscriptions and tree synchronization.
 *
 * Initialize on app startup:
 * ```typescript
 * await fileTreeOperator.init();
 * ```
 */
export { fileTreeOperator, FileTreeOperator } from './FileTreeOperator';

// ============================================================================
// Hooks
// ============================================================================

/**
 * useFileTreeOperations - CRUD hook for files and projects
 *
 * @remarks
 * All file operations via FileService (domain events).
 * All project operations via ProjectStore.
 * switchProject fires project:switched event.
 */
export { useFileTreeOperations } from './hooks/useFileTreeOperations';
export type { FileTreeOperations, ProjectResult } from './hooks/useFileTreeOperations';

/**
 * useFileTreePlugin - Legacy hook for ProjectContext access
 */
export { useFileTreePlugin } from './useFileTreePlugin';

// ============================================================================
// Components
// ============================================================================

/**
 * ProjectSelector - Dropdown for project switching (PLAT-05)
 */
export { ProjectSelector } from './components/ProjectSelector';

// ============================================================================
// Types
// ============================================================================

/**
 * FileTree plugin types
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
