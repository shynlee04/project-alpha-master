/**
 * @fileoverview Note Tree Utilities
 * @module lib/notes/note-tree-utils
 * @governance EPIC-26-5
 *
 * Utilities for building, manipulating, and searching hierarchical note trees.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

/**
 * Tree node structure
 */
export interface TreeNode {
    id: string;
    note: NoteRecord;
    children: TreeNode[];
    level: number;
}

/**
 * Build a tree structure from flat notes array
 *
 * @param notes - Flat array of notes
 * @returns Tree structure with root nodes
 */
export function buildTree(notes: NoteRecord[]): TreeNode[] {
    // Create a map for quick lookup
    const noteMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    notes.forEach((note) => {
        noteMap.set(note.id, {
            id: note.id,
            note,
            children: [],
            level: 0,
        });
    });

    // Second pass: build hierarchy
    notes.forEach((note) => {
        const node = noteMap.get(note.id)!;

        if (note.parentId) {
            const parentNode = noteMap.get(note.parentId);
            if (parentNode) {
                parentNode.children.push(node);
                node.level = parentNode.level + 1;
            } else {
                // Parent not found, treat as root
                rootNodes.push(node);
            }
        } else {
            // No parent, it's a root node
            rootNodes.push(node);
        }
    });

    // Sort root nodes by order
    rootNodes.sort((a, b) => a.note.order - b.note.order);

    // Sort children recursively
    const sortChildren = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
            node.children.sort((a, b) => a.note.order - b.note.order);
            sortChildren(node.children);
        });
    };

    sortChildren(rootNodes);

    return rootNodes;
}

/**
 * Flatten tree to array (for searching)
 *
 * @param tree - Tree structure
 * @returns Flat array of all tree nodes
 */
export function flattenTree(tree: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    const traverse = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
            result.push(node);
            if (node.children.length > 0) {
                traverse(node.children);
            }
        });
    };

    traverse(tree);
    return result;
}

/**
 * Filter tree by search query
 *
 * @param tree - Tree structure
 * @param query - Search query
 * @returns Filtered tree (only matching nodes and their ancestors)
 */
export function filterTreeBySearch(tree: TreeNode[], query: string): TreeNode[] {
    if (!query.trim()) {
        return tree;
    }

    const lowerQuery = query.toLowerCase();

    /**
     * Check if node or any descendants match query
     */
    function searchNode(node: TreeNode): TreeNode | null {
        const titleMatch = node.note.title.toLowerCase().includes(lowerQuery);
        const contentMatch = JSON.stringify(node.note.blocks).toLowerCase().includes(lowerQuery);

        // Search children
        const matchingChildren = node.children
            .map((child) => searchNode(child))
            .filter((child): child is TreeNode => child !== null);

        // If node matches or has matching descendants, keep it
        if (titleMatch || contentMatch || matchingChildren.length > 0) {
            return {
                ...node,
                children: matchingChildren,
            };
        }

        return null;
    }

    return tree
        .map((node) => searchNode(node))
        .filter((node): node is TreeNode => node !== null);
}

/**
 * Filter tree to show only favorites
 *
 * @param tree - Tree structure
 * @returns Filtered tree (only favorite notes)
 */
export function filterTreeByFavorites(tree: TreeNode[]): TreeNode[] {
    /**
     * Check if node or any descendants are favorites
     */
    function filterFavorites(node: TreeNode): TreeNode | null {
        if (node.note.isFavorite) {
            return node;
        }

        // Search children
        const matchingChildren = node.children
            .map((child) => filterFavorites(child))
            .filter((child): child is TreeNode => child !== null);

        if (matchingChildren.length > 0) {
            return {
                ...node,
                children: matchingChildren,
            };
        }

        return null;
    }

    return tree
        .map((node) => filterFavorites(node))
        .filter((node): node is TreeNode => node !== null);
}

/**
 * Move a node to a new parent (drag-and-drop)
 *
 * @param notes - Flat array of all notes
 * @param nodeId - Node to move
 * @param newParentId - New parent (null for root)
 * @param newOrder - New order within parent
 * @returns Updated notes array
 */
export function moveNode(
    notes: NoteRecord[],
    nodeId: string,
    newParentId: string | null,
    newOrder: number
): NoteRecord[] {
    // Prevent moving a node into its own descendant
    const node = notes.find((n) => n.id === nodeId);
    if (!node) return notes;

    // Get all descendant IDs
    const getDescendantIds = (parentId: string): string[] => {
        const descendants: string[] = [];
        notes
            .filter((n) => n.parentId === parentId)
            .forEach((child) => {
                descendants.push(child.id);
                descendants.push(...getDescendantIds(child.id));
            });
        return descendants;
    };

    const descendantIds = getDescendantIds(nodeId);
    if (newParentId && descendantIds.includes(newParentId)) {
        // Cannot move into own descendant
        return notes;
    }

    // Update the node
    return notes.map((note) => {
        if (note.id === nodeId) {
            return {
                ...note,
                parentId: newParentId || undefined,
                order: newOrder,
                updatedAt: Date.now(),
            };
        }
        return note;
    });
}

/**
 * Toggle note favorite status
 *
 * @param notes - Flat array of all notes
 * @param nodeId - Note to toggle
 * @returns Updated notes array
 */
export function toggleFavorite(notes: NoteRecord[], nodeId: string): NoteRecord[] {
    return notes.map((note) => {
        if (note.id === nodeId) {
            return {
                ...note,
                isFavorite: !note.isFavorite,
                updatedAt: Date.now(),
            };
        }
        return note;
    });
}

/**
 * Get next node in tree (for keyboard navigation)
 *
 * @param tree - Tree structure
 * @param currentId - Current node ID
 * @param expandedNodes - Set of expanded node IDs
 * @returns Next node ID or null
 */
export function getNextNode(
    tree: TreeNode[],
    currentId: string | null,
    expandedNodes: Set<string>
): string | null {
    if (!currentId) {
        return tree[0]?.id || null;
    }

    const flat = flattenTree(tree);
    const currentIndex = flat.findIndex((node) => node.id === currentId);

    if (currentIndex === -1) {
        return tree[0]?.id || null;
    }

    const currentNode = flat[currentIndex];

    // If node has children and is expanded, go to first child
    if (currentNode.children.length > 0 && expandedNodes.has(currentNode.id)) {
        return currentNode.children[0].id;
    }

    // Otherwise, go to next sibling or parent's next sibling
    for (let i = currentIndex; i < flat.length - 1; i++) {
        // Check if next node is at same or higher level (sibling or parent sibling)
        const nextNode = flat[i + 1];
        if (nextNode.level <= currentNode.level) {
            return nextNode.id;
        }
    }

    return null;
}

/**
 * Get previous node in tree (for keyboard navigation)
 *
 * @param tree - Tree structure
 * @param currentId - Current node ID
 * @param expandedNodes - Set of expanded node IDs
 * @returns Previous node ID or null
 */
export function getPreviousNode(
    tree: TreeNode[],
    currentId: string | null,
    expandedNodes: Set<string>
): string | null {
    if (!currentId) {
        return null;
    }

    const flat = flattenTree(tree);
    const currentIndex = flat.findIndex((node) => node.id === currentId);

    if (currentIndex <= 0) {
        return null;
    }

    // Get previous node
    const prevNode = flat[currentIndex - 1];

    // If previous node has children and is expanded, go to last descendant
    if (prevNode.children.length > 0 && expandedNodes.has(prevNode.id)) {
        return getLastDescendant(prevNode);
    }

    return prevNode.id;
}

/**
 * Get last descendant of a node
 */
function getLastDescendant(node: TreeNode): string {
    if (node.children.length === 0) {
        return node.id;
    }

    const lastChild = node.children[node.children.length - 1];
    return getLastDescendant(lastChild);
}
