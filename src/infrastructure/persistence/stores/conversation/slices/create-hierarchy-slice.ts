/**
 * Thread Hierarchy Slice
 *
 * Handles hierarchical thread organization (parent/child relationships).
 * Supports cascade flow and thread navigation.
 *
 * @module conversation/slices/hierarchy
 */

import { StateCreator } from 'zustand';
import type { ConversationThread, ThreadHierarchyNode } from '../conversation-threads-store';

/**
 * Thread Hierarchy State & Actions
 */
export interface HierarchySlice {
    /** Create child thread under parent */
    createChildThread: (parentId: string, title: string) => ConversationThread;

    /** Move thread to new parent or root */
    moveThread: (threadId: string, newParentId: string | null) => void;

    /** Get thread hierarchy (tree structure) */
    getThreadHierarchy: (projectId: string) => ThreadHierarchyNode[];

    /** Get all descendants of a thread */
    getThreadDescendants: (threadId: string) => ConversationThread[];
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Thread Hierarchy Slice Implementation
 */
export const createHierarchySlice: StateCreator<
    HierarchySlice & {
        threads: Record<string, ConversationThread>;
        activeThreadId: string | null;
    },
    [],
    [],
    HierarchySlice
> = (set, get) => ({
    createChildThread: (parentId: string, title: string) => {
        const id = generateId('thread');
        const now = Date.now();
        const parent = get().threads[parentId];

        if (!parent) {
            console.error('[HierarchySlice] Parent thread not found:', parentId);
            throw new Error(`Parent thread ${parentId} not found`);
        }

        const childThread: ConversationThread = {
            id,
            projectId: parent.projectId,
            title,
            preview: '',
            messages: [],
            agentsUsed: [],
            messageCount: 0,
            createdAt: now,
            updatedAt: now,
            parentId: parent.id,
            children: [],
            folderPath: parent.folderPath,
        };

        console.log('[HierarchySlice] Creating child thread:', id, 'under parent:', parentId);

        set((state) => {
            // Add child thread
            const newThreads = {
                ...state.threads,
                [id]: childThread,
            };

            // Update parent's children array
            const parentChildren = state.threads[parentId]?.children || [];
            newThreads[parentId] = {
                ...state.threads[parentId],
                children: [...parentChildren, id],
                updatedAt: now,
            };

            return {
                threads: newThreads,
                activeThreadId: id,
            };
        });

        return childThread;
    },

    moveThread: (threadId: string, newParentId: string | null) => {
        console.log('[HierarchySlice] Moving thread:', threadId, 'to parent:', newParentId);
        set((state) => {
            const thread = state.threads[threadId];
            if (!thread) {
                console.error('[HierarchySlice] Thread not found:', threadId);
                return state;
            }

            const oldParentId = thread.parentId;
            if (oldParentId === newParentId) {
                return state; // No change needed
            }

            const newThreads = { ...state.threads };

            // Remove from old parent's children
            if (oldParentId && newThreads[oldParentId]) {
                const oldParentChildren = newThreads[oldParentId].children || [];
                newThreads[oldParentId] = {
                    ...newThreads[oldParentId],
                    children: oldParentChildren.filter((id: string) => id !== threadId),
                    updatedAt: Date.now(),
                };
            }

            // Add to new parent's children
            if (newParentId && newThreads[newParentId]) {
                const newParentChildren = newThreads[newParentId].children || [];
                newThreads[newParentId] = {
                    ...newThreads[newParentId],
                    children: [...newParentChildren, threadId],
                    updatedAt: Date.now(),
                };
            }

            // Update thread's parentId
            newThreads[threadId] = {
                ...thread,
                parentId: newParentId,
                updatedAt: Date.now(),
            };

            return { threads: newThreads };
        });
    },

    getThreadHierarchy: (projectId: string) => {
        const { threads } = get();
        const projectThreads = Object.values(threads).filter((t) => t.projectId === projectId);

        // Build tree recursively
        function buildTree(parentId: string | null, depth: number): ThreadHierarchyNode[] {
            const children = projectThreads.filter((t) => t.parentId === parentId);
            return children.map((thread: ConversationThread) => ({
                thread,
                children: buildTree(thread.id, depth + 1),
                depth,
            }));
        }

        return buildTree(null, 0);
    },

    getThreadDescendants: (threadId: string) => {
        const { threads } = get();
        const descendants: ConversationThread[] = [];

        function collectDescendants(parentId: string) {
            const children = Object.values(threads).filter((t) => t.parentId === parentId);
            for (const child of children) {
                descendants.push(child);
                collectDescendants(child.id);
            }
        }

        collectDescendants(threadId);
        return descendants;
    },
});
