/**
 * FileTree Utilities
 * 
 * BUG-FIX-2026-01-20: Fixed DirectoryEntry vs FileEntry type mismatch
 * LocalFSAdapter.listDirectory() returns DirectoryEntry (name, type)
 * StorageGateway.list() returns FileEntry (path, kind, size, lastModified)
 * This file now supports BOTH formats for backward compatibility.
 */
import type { DirectoryEntry } from '@/domain/interfaces/file-operations-adapter.interface';
import type { TreeNode } from './types';

/**
 * Entry type that supports both DirectoryEntry and FileEntry formats.
 * DirectoryEntry has: name, type
 * FileEntry has: path, kind, size, lastModified
 */
type AnyFileEntry = DirectoryEntry | { path: string; kind: 'file' | 'directory' };

/**
 * Build a TreeNode from a directory entry.
 * 
 * BUG-FIX-2026-01-20: Now supports both DirectoryEntry (from LocalFSAdapter)
 * and FileEntry (from StorageGateway) formats.
 * 
 * @param entry - Directory entry from LocalFSAdapter or StorageGateway
 * @param parentPath - Parent path for constructing full path
 * @returns TreeNode for the file tree
 */
export function buildTreeNode(entry: AnyFileEntry, parentPath: string): TreeNode {
    // Support both DirectoryEntry (name/type) and FileEntry (path/kind)
    let name: string;
    let type: 'file' | 'directory';
    
    if ('name' in entry && 'type' in entry) {
        // DirectoryEntry format from LocalFSAdapter.listDirectory()
        name = entry.name;
        type = entry.type;
    } else if ('path' in entry && 'kind' in entry) {
        // FileEntry format from StorageGateway.list()
        name = entry.path.split('/').pop() || entry.path;
        type = entry.kind;
    } else {
        // Fallback - try to extract from any available property
        name = (entry as { name?: string }).name || 'unknown';
        type = 'file';
    }
    
    const path = parentPath ? `${parentPath}/${name}` : name;
    
    return {
        name,
        path,
        type,
        handle: (entry as DirectoryEntry & { handle?: FileSystemHandle }).handle,
        expanded: false,
        loading: false,
        children: type === 'directory' ? undefined : undefined,
    };
}

/**
 * Update a node in the tree by path.
 * 
 * @param nodes - Array of tree nodes
 * @param targetPath - Path of node to update
 * @param updater - Function to update the node
 * @returns Updated array of tree nodes
 */
export function updateNodeByPath(
    nodes: TreeNode[],
    targetPath: string,
    updater: (n: TreeNode) => TreeNode,
): TreeNode[] {
    return nodes.map((n) => {
        if (n.path === targetPath) {
            return updater(n);
        }
        if (n.children && n.path !== targetPath && targetPath.startsWith(n.path + '/')) {
            return {
                ...n,
                children: updateNodeByPath(n.children, targetPath, updater),
            };
        }
        return n;
    });
}

/**
 * Restore expanded state to tree nodes based on saved paths.
 * 
 * @param nodes - Array of tree nodes to update
 * @param expandedPaths - Set of paths that should be expanded
 * @returns Updated array with expanded state restored
 */
export function restoreExpandedState(
    nodes: TreeNode[],
    expandedPaths: Set<string>,
): TreeNode[] {
    return nodes.map((node) => ({
        ...node,
        expanded: node.type === 'directory' && expandedPaths.has(node.path),
        children: node.children
            ? restoreExpandedState(node.children, expandedPaths)
            : undefined,
    }));
}

/**
 * Get all ancestor paths for a given path.
 * 
 * @param path - Path to get ancestors for (e.g., "src/components/Foo.tsx")
 * @returns Array of ancestor paths (e.g., ["src", "src/components"])
 */
export function getAncestorPaths(path: string): string[] {
    const parts = path.split('/');
    const ancestors: string[] = [];
    for (let i = 1; i < parts.length; i++) {
        ancestors.push(parts.slice(0, i).join('/'));
    }
    return ancestors;
}
