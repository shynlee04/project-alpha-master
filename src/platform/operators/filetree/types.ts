/**
 * @fileoverview FileTree Operator Types
 * @module @/platform/operators/filetree/types
 *
 * Type definitions for FileTree platform operator.
 * Re-exports relevant types from the plugin layer.
 *
 * @phase R-1 (Platform Layer)
 * @task R-1-01
 * @created 2026-02-02
 */

// Re-export types from the existing plugin (Strangler Fig pattern)
export type {
  TreeNode,
  ContextMenuState,
  SyncStatus,
  FileOperationDialogProps,
  ConfirmDialogProps,
  SyncStatusIndicatorProps,
  FileTreePluginProps,
} from '@/plugins/filetree/types';

// Export operations hook types
export type {
  FileTreeOperations,
  ProjectResult,
} from '@/plugins/filetree/hooks/useFileTreeOperations';
