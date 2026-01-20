/**
 * @fileoverview File Tree Store - Zustand store for file tree state
 * @module infrastructure/persistence/stores/file-tree-store
 *
 * **ARCH-02-03**: Create ProjectContext Provider
 *
 * Per ADR-034 Decision D3:
 * Single file tree instance per project (not per plugin).
 * Shared state across all plugins ensures consistent view.
 *
 * State includes:
 * - Tree nodes (file/directory structure)
 * - Selected file (currently opened)
 * - Expanded folders (collapsed state)
 * - Loading state
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-03
 * @team Team B
 * @created 2026-01-21
 */

import { create } from 'zustand';
import type { FileEntry } from '@/domain/interfaces/storage-gateway.interface';

// ============================================================================
// File Tree Node
// ============================================================================

/**
 * File tree node
 *
 * @remarks
 * Represents a single node in the file tree.
 * Can be a file or directory with children.
 */
export interface FileTreeNode {
  /** Unique path (acts as key) */
  path: string;

  /** Entry kind: file or directory */
  kind: 'file' | 'directory';

  /** Display name (filename without path) */
  name: string;

  /** File size in bytes (0 for directories) */
  size: number;

  /** Last modified timestamp */
  lastModified: number;

  /** Whether directory is expanded (shows children) */
  expanded: boolean;

  /** Child nodes (populated lazily) */
  children: FileTreeNode[];

  /** Depth level in tree (0 = root) */
  level: number;

  /** Whether entry is currently selected */
  selected: boolean;
}

// ============================================================================
// Store State
// ============================================================================

/**
 * File tree store state
 *
 * @remarks
 * Manages file tree structure and UI state.
 * Single instance per project shared via ProjectContext.
 */
interface FileTreeState {
  // ========================================================================
  // Tree Data
  // ========================================================================

  /** All tree nodes (flat map by path for O(1) lookup) */
  nodes: Map<string, FileTreeNode>;

  /** Root node paths (entry points into tree) */
  rootPaths: string[];

  // ========================================================================
  // UI State
  // ========================================================================

  /** Currently selected file path */
  selectedPath: string | null;

  /** Set of expanded folder paths */
  expandedPaths: Set<string>;

  /** Loading state for async operations */
  loading: boolean;

  /** Error message if operation failed */
  error: string | null;

  // ========================================================================
  // Actions
  // ========================================================================

  /** Load tree from file entries */
  load: (entries: FileEntry[]) => void;

  /** Toggle expand/collapse for folder */
  toggleExpand: (path: string) => void;

  /** Set folder expanded state */
  setExpanded: (path: string, expanded: boolean) => void;

  /** Select a file */
  selectFile: (path: string) => void;

  /** Clear selection */
  clearSelection: () => void;

  /** Update node (when file changes externally) */
  updateNode: (path: string, entry: FileEntry) => void;

  /** Remove node (when file deleted) */
  removeNode: (path: string) => void;

  /** Add node (when file created) */
  addNode: (entry: FileEntry, parentPath: string) => void;

  /** Reset store to initial state */
  reset: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert FileEntry to FileTreeNode
 */
function entryToNode(
  entry: FileEntry,
  level: number = 0,
  expanded: boolean = false,
  selected: boolean = false
): FileTreeNode {
  const name = entry.path.split('/').pop() || entry.path;
  return {
    path: entry.path,
    kind: entry.kind,
    name,
    size: entry.size,
    lastModified: entry.lastModified,
    expanded,
    children: [],
    level,
    selected,
  };
}

/**
 * Find parent path of a given path
 */
function getParentPath(path: string): string | null {
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash <= 0) return null;
  return path.substring(0, lastSlash);
}

// ============================================================================
// Store Creation
// ============================================================================

/**
 * File tree store singleton
 *
 * Single instance per application shared via ProjectContext.
 */
export const useFileTreeStore = create<FileTreeState>()((set, get) => ({
  // ========================================================================
  // Initial State
  // ========================================================================

  nodes: new Map(),
  rootPaths: [],
  selectedPath: null,
  expandedPaths: new Set(),
  loading: false,
  error: null,

  // ========================================================================
  // Actions
  // ========================================================================

  /**
   * Load tree from file entries
   *
   * @param entries - File entries from gateway.list()
   *
   * @remarks
   * Converts flat entry list to tree structure.
   * Identifies root nodes (no parent or parent not in entries).
   */
  load: (entries) => {
    const nodes = new Map<string, FileTreeNode>();
    const rootPaths: string[] = [];

    // First pass: create all nodes
    for (const entry of entries) {
      nodes.set(entry.path, entryToNode(entry));
    }

    // Second pass: build tree structure and identify roots
    for (const entry of entries) {
      const node = nodes.get(entry.path);
      if (!node) continue;

      const parentPath = getParentPath(entry.path);

      // If no parent or parent not in entries, it's a root
      if (!parentPath || !nodes.has(parentPath)) {
        rootPaths.push(entry.path);
      } else {
        // Add as child of parent
        const parentNode = nodes.get(parentPath);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    }

    set({
      nodes,
      rootPaths,
      loading: false,
      error: null,
    });
  },

  /**
   * Toggle expand/collapse for folder
   *
   * @param path - Folder path to toggle
   */
  toggleExpand: (path) => {
    const { nodes, expandedPaths } = get();
    const node = nodes.get(path);

    if (!node || node.kind !== 'directory') return;

    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }

    set({
      nodes: new Map(nodes).set(path, { ...node, expanded: !node.expanded }),
      expandedPaths: newExpandedPaths,
    });
  },

  /**
   * Set folder expanded state
   *
   * @param path - Folder path
   * @param expanded - Whether to expand
   */
  setExpanded: (path, expanded) => {
    const { nodes } = get();
    const node = nodes.get(path);

    if (!node || node.kind !== 'directory') return;

    const newExpandedPaths = new Set(get().expandedPaths);
    if (expanded) {
      newExpandedPaths.add(path);
    } else {
      newExpandedPaths.delete(path);
    }

    set({
      nodes: new Map(nodes).set(path, { ...node, expanded }),
      expandedPaths: newExpandedPaths,
    });
  },

  /**
   * Select a file
   *
   * @param path - File path to select
   *
   * @remarks
   * Clears previous selection, marks new file as selected.
   */
  selectFile: (path) => {
    const { nodes, selectedPath } = get();

    // Clear previous selection
    if (selectedPath && nodes.has(selectedPath)) {
      const prevNode = nodes.get(selectedPath);
      if (prevNode) {
        nodes.set(selectedPath, { ...prevNode, selected: false });
      }
    }

    // Set new selection
    const newNode = nodes.get(path);
    if (newNode) {
      nodes.set(path, { ...newNode, selected: true });
    }

    set({
      nodes: new Map(nodes),
      selectedPath: path,
    });
  },

  /**
   * Clear selection
   */
  clearSelection: () => {
    const { nodes, selectedPath } = get();

    if (!selectedPath) return;

    const node = nodes.get(selectedPath);
    if (node) {
      nodes.set(selectedPath, { ...node, selected: false });
    }

    set({
      nodes: new Map(nodes),
      selectedPath: null,
    });
  },

  /**
   * Update node (external file change)
   *
   * @param path - File path to update
   * @param entry - New file entry data
   */
  updateNode: (path, entry) => {
    const { nodes } = get();
    const node = nodes.get(path);

    if (node) {
      set({
        nodes: new Map(nodes).set(path, entryToNode(entry, node.level, node.expanded, node.selected)),
      });
    }
  },

  /**
   * Remove node (file deleted)
   *
   * @param path - File path to remove
   *
   * @remarks
   * Also removes from parent's children list.
   */
  removeNode: (path) => {
    const { nodes, rootPaths } = get();

    if (!nodes.has(path)) return;

    // Remove from parent's children
    const parentPath = getParentPath(path);
    if (parentPath && nodes.has(parentPath)) {
      const parentNode = nodes.get(parentPath);
      if (parentNode) {
        parentNode.children = parentNode.children.filter((child) => child.path !== path);
        nodes.set(parentPath, parentNode);
      }
    }

    // Remove from root paths if applicable
    set({
      nodes: new Map(nodes).set(path, { ...nodes.get(path)! } as never),
      rootPaths: rootPaths.filter((p) => p !== path),
    });

    // Finally delete the node
    const newNodes = new Map(get().nodes);
    newNodes.delete(path);
    set({ nodes: newNodes });
  },

  /**
   * Add node (file created)
   *
   * @param entry - New file entry
   * @param parentPath - Parent directory path
   */
  addNode: (entry, parentPath) => {
    const { nodes } = get();
    const parentNode = nodes.get(parentPath);

    const newNode = entryToNode(entry, parentNode?.level ? parentNode.level + 1 : 0, false, false);

    if (parentNode) {
      parentNode.children.push(newNode);
      nodes.set(parentPath, parentNode);
    }

    set({
      nodes: new Map(nodes).set(entry.path, newNode),
    });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      nodes: new Map(),
      rootPaths: [],
      selectedPath: null,
      expandedPaths: new Set(),
      loading: false,
      error: null,
    });
  },
}));

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get tree nodes (readable array)
 *
 * @returns Root nodes with children populated
 */
export function useFileTreeNodes() {
  return useFileTreeStore((state) => {
    const rootNodes = state.rootPaths
      .map((path) => state.nodes.get(path))
      .filter((node): node is FileTreeNode => node !== undefined);

    return rootNodes;
  });
}

/**
 * Hook to get selected file
 *
 * @returns Selected file node or null
 */
export function useSelectedFile() {
  return useFileTreeStore((state) => {
    if (!state.selectedPath) return null;
    return state.nodes.get(state.selectedPath) || null;
  });
}
