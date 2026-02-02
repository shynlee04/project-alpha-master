/**
 * @fileoverview FileTree Operator Public API
 * @module @/platform/operators/filetree
 *
 * Public exports for FileTree platform operator.
 * Provides operator instance, component, and types.
 *
 * Strangler Fig Pattern:
 * - Re-exports from plugins where appropriate
 * - Adds new platform-layer abstractions
 * - No modifications to original plugin
 *
 * @phase R-1 (Platform Layer)
 * @task R-1-01
 * @created 2026-02-02
 */

// ============================================================================
// Platform Operator
// ============================================================================

/**
 * FileTree Platform Operator
 *
 * Singleton operator instance for platform registration.
 * Implements IPlatformOperator from @/platform/types.
 */
export {
  fileTreePlatformOperator,
  FileTreePlatformOperator,
  legacyFileTreeOperator,
} from './FileTreeOperator';

// ============================================================================
// React Component
// ============================================================================

/**
 * FileTree Operator Component
 *
 * React component for rendering FileTree in PlatformLayout.
 * Takes projectId prop from platform layer.
 */
export { FileTreeOperatorComponent } from './FileTreeOperatorComponent';

// ============================================================================
// Types
// ============================================================================

/**
 * FileTree types re-exported from plugin layer
 */
export type {
  TreeNode,
  ContextMenuState,
  SyncStatus,
  FileOperationDialogProps,
  ConfirmDialogProps,
  SyncStatusIndicatorProps,
  FileTreePluginProps,
  FileTreeOperations,
  ProjectResult,
} from './types';

// ============================================================================
// Hooks (passthrough from plugin)
// ============================================================================

/**
 * CRUD operations hook
 * Re-exported from plugin for convenience
 */
export { useFileTreeOperations } from '@/plugins/filetree';
