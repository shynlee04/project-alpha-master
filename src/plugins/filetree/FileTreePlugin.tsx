/**
 * @fileoverview FileTree Plugin - Simplified POC Version
 * @module plugins/filetree/FileTreePlugin
 *
 * **ARCH-02-04**: FileTree Feature Plugin (POC Simplified)
 *
 * Simplified version for proof of concept.
 * Uses ProjectContext.gateway directly for file operations.
 * Does not depend on file-tree-store.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-04
 * @team Team A
 * @created 2026-01-21
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// Store - using shared file tree store for reactivity
import { useFileTreeStore } from '@/infrastructure/persistence/stores/file-tree-store';
import type { FileTreeNode } from '@/infrastructure/persistence/stores/file-tree-store';

// File event bus (EPIC-0.5-02)
import { fileEventBus } from '@/infrastructure/events/file-event-bus';

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
// Main FileTree Plugin Component
// ============================================================================

/**
 * FileTree Plugin - Main component for file tree feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns FileTree JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Uses gateway for file operations.
 * Simplified version for POC - excludes sync status, context menus.
 *
 * Features:
 * - Display hierarchical file tree from project
 * - Expand/collapse folders
 * - File selection with visual highlighting
 * - Keyboard navigation support
 */
function FileTreeComponent({ width: _width, height: _height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const { gateway, project, refreshFileTree, openFile, isDirty } = useProjectContext();

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

  // Local state for UI concerns not in store
  const [focusedPath, setFocusedPath] = useState<string | undefined>();

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
   */
  const handleSelect = useCallback(
    (node: FileTreeNode) => {
      if (node.kind === 'file') {
        selectFile(node.path);
        setFocusedPath(node.path);

        // Call context's openFile action
        openFile?.(node.path);

        console.log('[FileTreePlugin] Selected file:', node.path);
      }
    },
    [selectFile, openFile],
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

  // Note: FileTree is now reactive via store subscription.
  // ProjectContext loads initial data into store on mount.
  // No local loadFileTree() needed - store manages state centrally.

  // Refresh file tree when ProjectContext.refreshFileTree changes
  useEffect(() => {
    // Store will be updated by refreshFileTree via ProjectContext
    // This hook tracks the refresh trigger for side effects if needed
  }, [refreshFileTree]);

  // EPIC-0.5-02: Subscribe to file events for reactive updates
  // When files are created, updated, deleted, moved, or renamed,
  // refresh the file tree to reflect changes
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
   * 
   * BUG FIX: Look up fresh node objects from nodesMap instead of using
   * stale references from parent.children array. When a child is toggled,
   * the new node is in the Map, but parent.children still references the old object.
   */
  function renderTree(nodes: FileTreeNode[], depth: number = 0): React.JSX.Element[] {
    const items: React.JSX.Element[] = [];

    for (const nodeRef of nodes) {
      // BUG FIX: Always get the FRESH node from the Map, not the stale child reference
      const node = nodesMap.get(nodeRef.path) || nodeRef;
      
      const isDirectory = node.kind === 'directory';
      const isExpanded = node.expanded;
      const isSelected = selectedPath === node.path;
      const isFocused = focusedPath === node.path;

      // Calculate padding based on depth
      const padding = `${depth * 16}px`;

      // BUG FIX (Bug 1): Get fresh children from Map for recursive rendering
      // Use fallback to original child if Map lookup fails (defensive)
      const freshChildren = isDirectory && isExpanded && node.children && node.children.length > 0
        ? node.children.map(child => nodesMap.get(child.path) ?? child).filter((c): c is FileTreeNode => c !== undefined)
        : [];

      items.push(
        <div key={node.path} style={{ paddingLeft: padding }}>
          <div
            className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/80 ${isSelected ? 'bg-blue-100' : ''
              } ${isFocused ? 'outline-none ring-2 ring-blue-500' : ''}`}
            onClick={() => isDirectory ? handleToggle(node.path) : handleSelect(node)}
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
             <span className="text-sm">{node.name}</span>
             {/* EPIC-0.5-03: Dirty file indicator */}
             {!isDirectory && isDirty(node.path) && <span className="ml-2 text-orange-500 text-xs">●</span>}
           </div>

          {/* Render children if directory is expanded - using FRESH children from Map */}
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
    >
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{project.name}</span>
        </div>
      </div>

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

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
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
