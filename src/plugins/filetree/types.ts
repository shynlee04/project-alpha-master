/**
 * @fileoverview FileTree Plugin Types
 * @module plugins/filetree/types
 *
 * **ARCH-02-04**: FileTree Plugin Types
 *
 * Types for FileTree plugin integration with plugin system.
 * Defines file tree node structure and plugin-specific props.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-04
 * @team Team A
 * @created 2026-01-21
 */

import type { TreeNode } from './FileTreePlugin';

// ============================================================================
// FileTree Plugin Props
// ============================================================================

/**
 * Props for FileTree plugin main component
 *
 * @remarks
 * Extends PluginMainProps with FileTree-specific props.
 * Project context provides storage and services.
 */
export interface FileTreePluginProps {
  /** Currently selected file path */
  selectedPath?: string;
  /** Callback when a file is selected */
  onFileSelect: (path: string, handle: FileSystemFileHandle) => void;
  /** Key to trigger refresh (increment to refresh tree) */
  refreshKey?: number;
  /** Optional class name for styling */
  className?: string;
}

/**
 * Props for file tree item list
 */
export interface FileTreeItemListProps {
  /** Tree nodes to render */
  nodes: TreeNode[];
  /** Current depth in tree */
  depth: number;
  /** Currently selected file path */
  selectedPath?: string;
  /** Currently focused path (keyboard navigation) */
  focusedPath?: string;
  /** Callback when node is selected */
  onSelect: (node: TreeNode) => void;
  /** Callback when folder is toggled (expand/collapse) */
  onToggle: (path: string) => void;
  /** Callback for context menu */
  onContextMenu: (node: TreeNode, x: number, y: number) => void;
  /** Callback to retry failed file operations */
  onRetryFile?: (node: TreeNode) => void;
  /** File exclusion patterns (e.g., node_modules) */
  exclusionPatterns?: string[];
}

/**
 * Context menu state
 */
export interface ContextMenuState {
  /** Whether menu is visible */
  visible: boolean;
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Target tree node */
  targetNode: TreeNode | null;
}

/**
 * Sync status for file operations
 */
export interface SyncStatus {
  /** Current sync status */
  status: 'idle' | 'syncing' | 'success' | 'error';
  /** Sync progress (0-100) */
  progress?: number;
  /** Timestamp of last successful sync */
  lastSyncTime?: number;
  /** Error message if sync failed */
  errorMessage?: string;
}

/**
 * Props for file operation dialog (rename/duplicate)
 */
export interface FileOperationDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Operation type: 'rename' or 'duplicate' */
  operation: 'rename' | 'duplicate';
  /** Current name of file/folder */
  currentName: string;
  /** Callback to confirm operation */
  onConfirm: (newName: string) => void;
  /** Callback to close dialog */
  onClose: () => void;
  /** List of existing names (for validation) */
  existingNames?: string[];
  /** Optional class name for styling */
  className?: string;
}

/**
 * Props for confirm dialog (delete)
 */
export interface ConfirmDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Operation description (e.g., 'delete', 'delete-folder') */
  operation: string;
  /** Name of item to delete */
  itemName: string;
  /** Whether item is a directory */
  isDirectory: boolean;
  /** Callback to confirm deletion */
  onConfirm: () => void;
  /** Callback to close dialog */
  onClose: () => void;
  /** Optional class name for styling */
  className?: string;
}

/**
 * Props for sync status indicator
 */
export interface SyncStatusIndicatorProps {
  /** Current sync status */
  status: SyncStatus['status'];
  /** Sync progress (0-100) */
  progress?: number;
  /** Timestamp of last successful sync */
  lastSyncTime?: number;
  /** Error message if sync failed */
  errorMessage?: string;
  /** Callback to retry sync */
  onRetry?: () => void;
}

// Note: TreeNode is imported from FileTreePlugin.tsx
// Re-export it for public API
export type { TreeNode } from './FileTreePlugin';
