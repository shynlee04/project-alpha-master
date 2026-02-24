/**
 * @fileoverview FileTree Plugin with CRUD Operations
 * @module plugins/filetree/FileTreePlugin
 *
 * **PLAT-02, PLAT-05**: FileTree Platform Operator with CRUD
 *
 * Enhanced FileTree with:
 * - Project switching via ProjectSelector (PLAT-05)
 * - Context menu for file operations (PLAT-02)
 * - Create/rename/delete files via useFileTreeOperations
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PLAT-02 - FileTree CRUD, PLAT-05 - Project Switching
 * @team Team A
 * @created 2026-01-21
 * @updated 2026-02-01
 */

import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { FolderOpen, AlertCircle, FilePlus, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// EPIC-0.6-02: Plugin Coordination for file open tracking
import { usePluginCoordinationSafe } from '@/infrastructure/context/plugin-coordination-context';

// Store - using shared file tree store for reactivity
import { useFileTreeStore } from '@/infrastructure/persistence/stores/file-tree-store';
import type { FileTreeNode } from '@/infrastructure/persistence/stores/file-tree-store';

// File event bus (EPIC-0.5-02)
import { fileEventBus } from '@/infrastructure/events/file-event-bus';

// PLAT-02: FileTree operations hook
import { useFileTreeOperations } from './hooks/useFileTreeOperations';

// PLAT-05: Project selector component
import { ProjectSelector } from './components/ProjectSelector';

// ============================================================================
// Tree Node Types
// ============================================================================

/**
 * Represents a node in the file tree
 */
export interface TreeNode {
  /** File/directory name */
  name: string;
  /** Full path from project root */
  path: string;
  /** Node type: file or directory */
  type: 'file' | 'directory';
  /** Child nodes (for directories) */
  children?: TreeNode[];
  /** Whether directory is expanded (for UI state) */
  expanded?: boolean;
  /** Whether node is currently loading (for async expansion) */
  loading?: boolean;
}

// ============================================================================
// Context Menu State
// ============================================================================

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: FileTreeNode | null;
  type: 'file' | 'directory' | 'root';
}

// ============================================================================
// Main FileTree Plugin Component
// ============================================================================

/**
 * FileTree Plugin - Main component for file tree feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns FileTree JSX element
 *
 * @remarks
 * Enhanced with context menu for CRUD operations.
 *
 * Features:
 * - Display hierarchical file tree from project
 * - Expand/collapse folders
 * - File selection with visual highlighting
 * - Keyboard navigation support
 * - Context menu for create/rename/delete (PLAT-02)
 * - Project switching via selector (PLAT-05)
 */
function FileTreeComponent({ width: _width, height: _height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const { gateway, project, refreshFileTree, openFile, isDirty } = useProjectContext();

  // PLAT-02: File tree operations
  const { createFile, renameFile, deleteFile } = useFileTreeOperations();

  // EPIC-0.6-02: Plugin coordination for file open tracking
  const coordination = usePluginCoordinationSafe();

  // CRITICAL FIX: Use ref to break infinite loop (coordination object changes on every render)
  const coordinationRef = useRef(coordination);
  coordinationRef.current = coordination;

  // CRITICAL FIX: Direct selector calls to prevent infinite loop
  // Using individual selectors instead of useFileTreeNodes() hook
  const rootPaths = useFileTreeStore((state) => state.rootPaths);
  const nodesMap = useFileTreeStore((state) => state.nodes);

  // Memoize root nodes computation to prevent infinite re-render
  const rootNodes = useMemo(() => {
    return rootPaths
      .map((path) => nodesMap.get(path))
      .filter((node): node is FileTreeNode => node !== undefined);
  }, [rootPaths, nodesMap]);

  // Get UI state from store (individual selectors for stability)
  const selectedPath = useFileTreeStore((state) => state.selectedPath);
  const toggleExpand = useFileTreeStore((state) => state.toggleExpand);
  const selectFile = useFileTreeStore((state) => state.selectFile);
  const isLoading = useFileTreeStore((state) => state.loading);
  const storeError = useFileTreeStore((state) => state.error);

  // Local state for UI concerns
  const [focusedPath, setFocusedPath] = useState<string | undefined>();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
    type: 'root',
  });
  const [renameState, setRenameState] = useState<{ path: string; name: string } | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileInput, setShowNewFileInput] = useState<string | null>(null); // parent path

  // ============================================================================
  // Context Menu Handlers
  // ============================================================================

  /**
   * Handle context menu on right-click
   */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, node: FileTreeNode | null, type: 'file' | 'directory' | 'root') => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        node,
        type,
      });
    },
    []
  );

  /**
   * Close context menu
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  /**
   * Handle new file creation
   */
  const handleNewFile = useCallback(async () => {
    if (!newFileName.trim()) return;

    const parentPath = showNewFileInput || '';
    const filePath = parentPath ? `${parentPath}/${newFileName}` : newFileName;

    const result = await createFile(filePath, '');
    if (result.success) {
      console.log('[FileTreePlugin] File created:', filePath);
      refreshFileTree();
    } else {
      console.error('[FileTreePlugin] Failed to create file:', result.error?.message);
    }

    setShowNewFileInput(null);
    setNewFileName('');
  }, [newFileName, showNewFileInput, createFile, refreshFileTree]);

  /**
   * Handle file rename
   */
  const handleRename = useCallback(async () => {
    if (!renameState || !renameState.name.trim()) return;

    const oldPath = renameState.path;
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = renameState.name;
    const newPath = pathParts.join('/');

    const result = await renameFile(oldPath, newPath);
    if (result.success) {
      console.log('[FileTreePlugin] File renamed:', oldPath, '->', newPath);
      refreshFileTree();
    } else {
      console.error('[FileTreePlugin] Failed to rename file:', result.error?.message);
    }

    setRenameState(null);
  }, [renameState, renameFile, refreshFileTree]);

  /**
   * Handle file deletion
   */
  const handleDelete = useCallback(
    async (path: string) => {
      if (!confirm(`Delete "${path}"?`)) return;

      const result = await deleteFile(path);
      if (result.success) {
        console.log('[FileTreePlugin] File deleted:', path);
        refreshFileTree();
      } else {
        console.error('[FileTreePlugin] Failed to delete file:', result.error?.message);
      }
    },
    [deleteFile, refreshFileTree]
  );

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Toggle folder expansion - using store action
   */
  const handleToggle = useCallback((path: string) => {
    toggleExpand(path);
  }, [toggleExpand]);

  /**
   * Handle file selection - using store action
   * EPIC-0.6-02: Also register with plugin coordination
   * CRITICAL FIX: Use coordinationRef to avoid re-creating callback on coordination change
   */
  const handleSelect = useCallback(
    async (node: FileTreeNode) => {
      if (node.kind === 'file') {
        selectFile(node.path);
        setFocusedPath(node.path);

        // Call context's openFile action
        openFile?.(node.path);

        // EPIC-0.6-02: Register with plugin coordination
        const coord = coordinationRef.current;
        if (coord && gateway) {
          try {
            // Read file content and set as active document
            const content = await gateway.read(node.path);
            const decoder = new TextDecoder();
            coord.setActiveDocument(node.path, decoder.decode(content));
            coord.openDocument(node.path, 'filetree');
            console.log('[FileTreePlugin] Registered with coordination:', node.path);
          } catch (err) {
            console.error('[FileTreePlugin] Failed to read file for coordination:', err);
          }
        }

        console.log('[FileTreePlugin] Selected file:', node.path);
      }
    },
    [selectFile, openFile, gateway], // CRITICAL: coordination removed, using ref instead
  );

  /**
   * Keyboard navigation handler
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentNodes = Array.from(rootNodes);
    if (currentNodes.length === 0) return;

    const currentIndex = focusedPath
      ? currentNodes.findIndex((n) => n.path === focusedPath)
      : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, currentNodes.length - 1);
        if (nextIndex >= 0) {
          setFocusedPath(currentNodes[nextIndex].path);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (prevIndex < currentNodes.length) {
          setFocusedPath(currentNodes[prevIndex].path);
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedPath) {
          const node = currentNodes.find((n) => n.path === focusedPath);
          if (node) {
            handleSelect(node);
          }
        }
        break;
    }
  }, [focusedPath, rootNodes, handleSelect]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible, closeContextMenu]);

  // Refresh file tree when ProjectContext.refreshFileTree changes
  useEffect(() => {
    // Store will be updated by refreshFileTree via ProjectContext
    // This hook tracks the refresh trigger for side effects if needed
  }, [refreshFileTree]);

  // EPIC-0.5-02: Subscribe to file events for reactive updates
  useEffect(() => {
    const unsubscribe = fileEventBus.onWithFilter(
      'file',
      (event) => {
        console.log('[FileTreePlugin] Received file event:', event.type, event.path);

        // Only refresh if event is for this project
        if (event.projectId === project.id) {
          refreshFileTree();
        }
      },
      {
        projectId: project.id,
      }
    );

    return () => {
      unsubscribe();
    };
  }, [project.id, refreshFileTree]);

  // ============================================================================
  // Render States
  // ============================================================================

  // No gateway error state
  if (!gateway) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('ide.openFolderToView')}
        </p>
      </div>
    );
  }

  // Error state (from store)
  if (storeError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
        <AlertCircle size={32} className="mb-2" />
        <p className="text-sm text-center">{storeError}</p>
        <button
          onClick={refreshFileTree}
          className="mt-4 rounded-none bg-primary text-primary-foreground px-4 py-2 hover:brightness-110 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading state (from store)
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">{t('ide.loading')}</p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  /**
   * Render tree nodes recursively
   */
  function renderTree(nodes: FileTreeNode[], depth: number = 0): React.JSX.Element[] {
    const items: React.JSX.Element[] = [];

    for (const nodeRef of nodes) {
      const node = nodesMap.get(nodeRef.path) || nodeRef;
      
      const isDirectory = node.kind === 'directory';
      const isExpanded = node.expanded;
      const isSelected = selectedPath === node.path;
      const isFocused = focusedPath === node.path;
      const isRenaming = renameState?.path === node.path;

      // EPIC-0.6-02: Get editors that have this file open
      const editors = !isDirectory && coordination
        ? coordination.getEditorsForPath(node.path)
        : [];
      const openInOtherEditors = editors.filter((e) => e !== 'filetree').length;

      // Calculate padding based on depth
      const padding = `${depth * 16}px`;

      // Get fresh children from Map for recursive rendering
      const freshChildren = isDirectory && isExpanded && node.children && node.children.length > 0
        ? node.children.map(child => nodesMap.get(child.path) ?? child).filter((c): c is FileTreeNode => c !== undefined)
        : [];

      items.push(
        <div key={node.path} style={{ paddingLeft: padding }}>
          <div
            className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/80 ${isSelected ? 'bg-blue-100' : ''
              } ${isFocused ? 'outline-none ring-2 ring-blue-500' : ''}`}
            onClick={() => isDirectory ? handleToggle(node.path) : handleSelect(node)}
            onContextMenu={(e) => handleContextMenu(e, node, isDirectory ? 'directory' : 'file')}
            onKeyDown={handleKeyDown}
            role="treeitem"
            aria-expanded={isDirectory ? isExpanded : undefined}
            aria-selected={isSelected}
            tabIndex={isFocused ? 0 : -1}
          >
            {isDirectory ? (
              isExpanded ? (
                <FolderOpen size={16} className="text-blue-500" />
              ) : (
                <FolderOpen size={16} className="text-gray-500" />
              )
            ) : (
              <span className="text-xs">📄</span>
            )}
            
            {isRenaming ? (
              <input
                type="text"
                value={renameState.name}
                onChange={(e) => setRenameState({ ...renameState, name: e.target.value })}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setRenameState(null);
                }}
                autoFocus
                className="text-sm bg-background border border-border px-1 rounded-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm">{node.name}</span>
            )}
            
            {/* EPIC-0.5-03: Dirty file indicator */}
            {!isDirectory && isDirty(node.path) && <span className="ml-2 text-orange-500 text-xs">●</span>}
            {/* EPIC-0.6-02: Open in other editors indicator */}
            {openInOtherEditors > 0 && (
              <span className="ml-1 text-blue-500 text-[10px]" title={`Open in ${editors.join(', ')}`}>
                [{openInOtherEditors}]
              </span>
            )}
          </div>

          {/* New file input inside directory */}
          {showNewFileInput === node.path && (
            <div className="flex items-center gap-2 py-1 px-2 ml-4">
              <FilePlus size={14} className="text-muted-foreground" />
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={handleNewFile}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewFile();
                  if (e.key === 'Escape') {
                    setShowNewFileInput(null);
                    setNewFileName('');
                  }
                }}
                placeholder="filename.ts"
                autoFocus
                className="text-sm bg-background border border-border px-1 rounded-none flex-1"
              />
            </div>
          )}

          {/* Render children if directory is expanded */}
          {freshChildren.length > 0 && (
            <div>{renderTree(freshChildren, depth + 1)}</div>
          )}
        </div>,
      );
    }

    return items;
  }

  return (
    <div
      className="h-full w-full flex flex-col overflow-auto"
      role="tree"
      aria-label={t('ide.fileExplorer')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => handleContextMenu(e, null, 'root')}
    >
      {/* Header with Project Selector */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <ProjectSelector />
        {/* New file button */}
        <button
          onClick={() => {
            setShowNewFileInput('');
            setNewFileName('');
          }}
          className="p-1 hover:bg-muted/80 rounded-none"
          title="New File"
        >
          <FilePlus size={14} />
        </button>
      </div>

      {/* New file input at root level */}
      {showNewFileInput === '' && (
        <div className="flex items-center gap-2 py-1 px-2 bg-muted/30">
          <FilePlus size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={handleNewFile}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNewFile();
              if (e.key === 'Escape') {
                setShowNewFileInput(null);
                setNewFileName('');
              }
            }}
            placeholder="filename.ts"
            autoFocus
            className="text-sm bg-background border border-border px-1 rounded-none flex-1"
          />
        </div>
      )}

      {/* File Tree Content */}
      <div className="flex-1 overflow-auto min-h-0 p-2">
        {rootNodes.length > 0 ? (
          renderTree(rootNodes)
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
            <FolderOpen size={32} className="mb-2 text-muted-foreground/70" />
            <p className="text-sm text-center">{t('ide.noFiles')}</p>
          </div>
        )}
      </div>

      {/* Context Menu (8-bit design) */}
      {contextMenu.visible && (
        <div
          className="fixed bg-card border-2 border-border py-1 min-w-[160px] z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            boxShadow: '4px 4px 0 0 rgba(0,0,0,0.2)',
            borderRadius: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* New File option */}
          <button
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2"
            onClick={() => {
              const parentPath = contextMenu.node?.kind === 'directory'
                ? contextMenu.node.path
                : '';
              setShowNewFileInput(parentPath);
              setNewFileName('');
              closeContextMenu();
            }}
          >
            <FilePlus size={14} />
            New File
          </button>

          {/* New Folder option */}
          <button
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2"
            onClick={() => {
              // For now, just create an empty folder by creating a placeholder file
              const parentPath = contextMenu.node?.kind === 'directory'
                ? contextMenu.node.path
                : '';
              const folderName = prompt('Folder name:');
              if (folderName) {
                createFile(`${parentPath ? parentPath + '/' : ''}${folderName}/.gitkeep`, '');
                refreshFileTree();
              }
              closeContextMenu();
            }}
          >
            <FolderPlus size={14} />
            New Folder
          </button>

          {/* Divider */}
          {contextMenu.type !== 'root' && (
            <>
              <div className="border-t border-border my-1" />

              {/* Rename option */}
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2"
                onClick={() => {
                  if (contextMenu.node) {
                    setRenameState({ path: contextMenu.node.path, name: contextMenu.node.name });
                  }
                  closeContextMenu();
                }}
              >
                <Pencil size={14} />
                Rename
              </button>

              {/* Delete option */}
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive"
                onClick={() => {
                  if (contextMenu.node) {
                    handleDelete(contextMenu.node.path);
                  }
                  closeContextMenu();
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * FileTree Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 */
export const fileTreePlugin: FeaturePlugin = {
  // ========================================================================
  // Identity
  // ========================================================================

  id: 'filetree',
  name: 'File Tree',
  icon: React.createElement(FolderOpen, { size: 16 }),
  description: 'Browse and manage project files',

  // ========================================================================
  // Requirements
  // ========================================================================

  requirements: {
    storageType: 'any', // Works with FSA and IndexedDB
    deviceType: 'any', // Works on desktop and mobile
    minWidth: 200, // Minimum 200px width
    maxInstances: 1, // Only one file tree per project
  },

  // ========================================================================
  // Rendering
  // ========================================================================

  MainComponent: FileTreeComponent,

  // ========================================================================
  // Lifecycle Hooks
  // ========================================================================

  onMount: async (context) => {
    console.log('[FileTreePlugin] Mounted for project:', context.projectId);
    // File tree will load automatically in component effect
  },

  onUnmount: async () => {
    console.log('[FileTreePlugin] Unmounted');
    // Cleanup if needed
  },

  onProjectChange: async (newProjectId) => {
    console.log('[FileTreePlugin] Project changed to:', newProjectId);
    // File tree will reload automatically via context update
  },
};

// ============================================================================
// No additional exports - plugin exported via index.ts
// ============================================================================
