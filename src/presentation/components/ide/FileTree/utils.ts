/**
 * FileTree Utilities
 */
import type { FileEntry } from '@/domain/interfaces/storage-gateway.interface';
import type { TreeNode } from './types';

/**
 * Build a TreeNode from a FileEntry (StorageGateway format).
 * 
 * @param entry - File entry from storage gateway
 * @param parentPath - Parent path for constructing full path
 * @returns TreeNode for the file tree
 */
export function buildTreeNode(entry: FileEntry, parentPath: string): TreeNode {
    // Extract name from path
    const name = entry.path.split('/').pop() || entry.path;
    const path = parentPath ? `${parentPath}/${name}` : name;
    return {
        name,
        path,
        type: entry.kind,
        handle: undefined, // StorageGateway doesn't provide handles in list()
        expanded: false,
        loading: false,
        children: entry.kind === 'directory' ? undefined : undefined,
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
