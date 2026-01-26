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

import React, { useEffect, useCallback, useState } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

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
function FileTreeComponent({ width, height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { gateway, project, refreshFileTree, openFile } = projectContext;

  // Local state for FileTree-specific UI
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [focusedPath, setFocusedPath] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Load file tree from storage
   */
  const loadFileTree = useCallback(async () => {
    if (!gateway) {
      setError('Storage gateway not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // List files from project root
      const entries = await gateway.list('.');
      console.log('[FileTreePlugin] Loaded entries:', entries);

      // Build tree nodes from flat entries
      const nodes: TreeNode[] = [];
      for (const entry of entries) {
        // Skip dotfiles (except .vscode, .git)
        if (entry.path.startsWith('.') && !['.vscode', '.git'].includes(entry.path)) {
          continue;
        }

        // Determine if directory (by path ending with /)
        const isDirectory = entry.path.endsWith('/');

        nodes.push({
          name: entry.path.replace(/\/$/, ''),
          path: entry.path.replace(/\/$/, ''),
          type: isDirectory ? 'directory' : 'file',
        });
      }

      setRootNodes(nodes);
    } catch (err) {
      setError(`Failed to load file tree: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[FileTreePlugin] Error loading file tree:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gateway]);

  /**
   * Toggle folder expansion
   */
  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  /**
   * Handle file selection
   */
  const handleSelect = useCallback(
    (node: TreeNode) => {
      if (node.type === 'file') {
        setSelectedPath(node.path);
        setFocusedPath(node.path);

        // Call context's openFile action
        openFile?.(node.path);

        console.log('[FileTreePlugin] Selected file:', node.path);
      }
    },
    [openFile],
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

  // Load file tree on mount and when refresh is triggered
  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  // Refresh file tree when ProjectContext.refreshFileTree is called
  useEffect(() => {
    // For POC, just reload on mount
    // Full integration would listen to refreshFileTree changes
  }, [refreshFileTree, loadFileTree]);

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

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
        <AlertCircle size={32} className="mb-2" />
        <p className="text-sm text-center">{error}</p>
        <button
          onClick={loadFileTree}
          className="mt-4 rounded-none bg-primary text-primary-foreground px-4 py-2 hover:brightness-110 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading state
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
  function renderTree(nodes: TreeNode[], depth: number = 0): React.JSX.Element[] {
    const items: React.JSX.Element[] = [];

    for (const node of nodes) {
      const isDirectory = node.type === 'directory';
      const isExpanded = expandedPaths.has(node.path);
      const isSelected = selectedPath === node.path;
      const isFocused = focusedPath === node.path;

      // Calculate padding based on depth
      const padding = `${depth * 16}px`;

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
          </div>

          {/* Render children if directory is expanded */}
          {isDirectory && isExpanded && node.children && (
            <div>{renderTree(node.children, depth + 1)}</div>
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
