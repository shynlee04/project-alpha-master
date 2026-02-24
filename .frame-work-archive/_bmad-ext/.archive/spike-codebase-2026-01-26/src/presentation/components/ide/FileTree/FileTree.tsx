/**
 * @fileoverview FileTree Component
 * @module components/ide/FileTree
 * 
 * Main file tree component for displaying and navigating project structure.
 *
 * Features:
 * - Hierarchical display of files and folders
 * - Expand/collapse folders with lazy loading
 * - File extension icons
 * - Context menu for CRUD operations
 * - Keyboard navigation
 * - Selection state
 * - Sync status integration
 * 
 * @example
 * ```tsx
 * <FileTree
 *   selectedPath={selectedFilePath}
 *   onFileSelect={handleFileSelect}
 *   refreshKey={fileTreeRefreshKey}
 * />
 * ```
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Internal components
import { FileTreeItemList } from './FileTreeItem';
import { ContextMenu } from './ContextMenu';
import { SyncStatusIndicator } from '../SyncStatusIndicator';
import { FileOperationDialog } from './FileOperationDialog';
import { ConfirmDialog } from './ConfirmDialog';

// Hooks
import {
  useFileTreeState,
  useFileTreeActions,
  useContextMenuActions,
  useKeyboardNavigation,
} from './hooks';

// State and types
// Story 27-1b: Migrated to Zustand
/**
 * @workspace ide-only
 *
 * This component uses the unified workspace context.
 * Provides file system operations for the IDE.
 */
import { useFileSyncStatusStore } from '@/lib/workspace';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import type { TreeNode } from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the FileTree component.
 * 
 * @interface FileTreeProps
 */
interface FileTreeProps {
  /** Currently selected file path */
  selectedPath?: string;
  /** Callback when a file is selected */
  onFileSelect: (path: string, handle: FileSystemFileHandle) => void;
  /** Key to trigger refresh (increment to refresh tree) */
  refreshKey?: number;
  /** Optional class name for styling */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FileTree - Main file tree component.
 * 
 * Displays a hierarchical view of the project filesystem with:
 * - Folder expand/collapse
 * - File selection
 * - Context menu operations
 * - Keyboard navigation
 * - Sync status indicators
 * 
 * @param props - Component props
 * @returns FileTree JSX element
 */
export function FileTree({
  onFileSelect,
  selectedPath,
  className = '',
  refreshKey,
}: FileTreeProps): React.JSX.Element {
  // Workspace context
  const {
    directoryHandle,
    syncStatus,
    syncError,
    syncNow,
    localAdapterRef,
    syncManagerRef,
    exclusionPatterns,
  } = useWorkspaceSync();

  // Note: syncProgress and lastSyncTime are not currently exposed via useWorkspaceSync
  // These can be added to the unified context if needed
  const syncProgress = undefined;
  const lastSyncTime = undefined;

  const { t } = useTranslation();

  // Sync counts for status display (Story 27-1b: Migrated to Zustand)
  const fileSyncCounts = useFileSyncStatusStore((s) => s.counts);

  // Container ref for focus management
  const treeRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // State Management
  // ============================================================================

  const {
    rootNodes,
    setRootNodes,
    focusedPath,
    setFocusedPath,
    expandedPaths,
    setExpandedPaths,
    error,
    setError,
    isLoading,
    setIsLoading,
    contextMenu,
    setContextMenu,
    getAdapter,
  } = useFileTreeState({ directoryHandle, refreshKey });

  // ============================================================================
  // Actions
  // ============================================================================

  const {
    loadRootDirectory,
    handleToggle,
    handleRetryFile,
  } = useFileTreeActions({
    directoryHandle,
    getAdapter,
    setRootNodes,
    setError,
    setIsLoading,
    expandedPaths,
    setExpandedPaths,
    localAdapterRef,
    syncManagerRef,
  });

  // File selection handler
  const handleSelect = useCallback(
    (node: TreeNode) => {
      if (node.type === 'file' && onFileSelect) {
        onFileSelect(node.path, node.handle as FileSystemFileHandle);
      }
      setFocusedPath(node.path);
    },
    [onFileSelect, setFocusedPath],
  );

  // ============================================================================
  // Context Menu
  // S-024: Enhanced with dialogs and toast notifications
  // ============================================================================

  const {
    handleContextMenu,
    closeContextMenu,
    handleContextMenuAction,
    operationDialog,
    closeOperationDialog,
    handleOperationConfirm,
    confirmDialog,
    closeConfirmDialog,
    handleDeleteConfirm,
  } = useContextMenuActions({
    contextMenu,
    setContextMenu,
    directoryHandle,
    getAdapter,
    handleToggle,
    loadRootDirectory,
    setExpandedPaths,
    setFocusedPath,
    existingNames: rootNodes.map(n => n.name), // Simple check for top-level
  });

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  const { handleKeyDown } = useKeyboardNavigation({
    rootNodes,
    focusedPath,
    setFocusedPath,
    handleToggle,
    handleSelect,
  });

  // ============================================================================
  // Effects
  // ============================================================================

  // Load root when directory handle changes or refresh is triggered
  useEffect(() => {
    loadRootDirectory();
  }, [loadRootDirectory, refreshKey]);

  // ============================================================================
  // Render States
  // ============================================================================

  // Empty state - no directory AND no local adapter (IndexedDB projects use localAdapterRef)
  if (!directoryHandle && !localAdapterRef.current) {
    return (
      <div className={`h-full flex flex-col items-center justify-center text-muted-foreground p-4 ${className}`}>
        <FolderOpen size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('ide.openFolderToView')}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`h-full flex flex-col items-center justify-center text-destructive p-4 ${className}`}>
        <AlertCircle size={32} className="mb-2" />
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center text-muted-foreground ${className}`}>
        <p className="text-sm">{t('ide.loading')}</p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Sync Status Header */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {fileSyncCounts.total > 0 && (
            <>
              <span title={t('status.pendingFiles')} className="text-warning">
                {fileSyncCounts.pending} {t('status.pending')}
              </span>
              <span title={t('status.errorFiles')} className="text-destructive">
                {fileSyncCounts.error} {t('status.error')}
              </span>
              <span title={t('status.syncedFiles')} className="text-success">
                {fileSyncCounts.synced} {t('status.synced')}
              </span>
            </>
          )}
        </div>
        <SyncStatusIndicator
          status={syncStatus}
          progress={syncProgress}
          lastSyncTime={lastSyncTime}
          errorMessage={syncError}
          onRetry={syncNow}
        />
      </div>

      {/* File Tree Content */}
      <div
        ref={treeRef}
        role="tree"
        aria-label={t('ide.fileExplorer')}
        tabIndex={0}
        className="flex-1 overflow-auto focus:outline-none min-h-0"
        onKeyDown={handleKeyDown}
        onClick={() => treeRef.current?.focus()}
      >
        <FileTreeItemList
          nodes={rootNodes}
          depth={0}
          selectedPath={selectedPath}
          focusedPath={focusedPath}
          onSelect={handleSelect}
          onToggle={handleToggle}
          onContextMenu={handleContextMenu}
          onRetryFile={handleRetryFile}
          exclusionPatterns={exclusionPatterns}
        />
      </div>

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        targetNode={contextMenu.targetNode}
        onAction={handleContextMenuAction}
        onClose={closeContextMenu}
      />

      {/* S-024: File Operation Dialog (Rename/Duplicate) */}
      {contextMenu.targetNode && (
        <FileOperationDialog
          open={operationDialog.open}
          operation={operationDialog.operation || 'rename'}
          currentName={operationDialog.currentName}
          onConfirm={handleOperationConfirm}
          onClose={closeOperationDialog}
          existingNames={rootNodes.map(n => n.name)}
        />
      )}

      {/* S-024: Confirm Dialog (Delete) */}
      <ConfirmDialog
        open={confirmDialog.open}
        operation={confirmDialog.isDirectory ? 'delete-folder' : 'delete'}
        itemName={confirmDialog.itemName}
        isDirectory={confirmDialog.isDirectory}
        onConfirm={handleDeleteConfirm}
        onClose={closeConfirmDialog}
      />
    </div>
  );
}
