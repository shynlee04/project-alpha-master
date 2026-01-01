/**
 * Thread CRUD Slice
 *
 * Handles basic create, read, update, delete operations for conversation threads.
 * Part of the December 2025 Zustand slices pattern.
 *
 * @module conversation/slices/thread-crud
 */

import { StateCreator } from 'zustand';
import type { ConversationThread } from '../conversation-threads-store';

/**
 * Thread CRUD State & Actions
 */
export interface ThreadCrudSlice {
    /** Create a new thread for current project */
    createThread: (projectId: string) => ConversationThread;

    /** Delete a thread */
    deleteThread: (threadId: string) => void;

    /** Update thread title */
    updateThreadTitle: (threadId: string, title: string) => void;

    /** Get threads for project (sorted by updatedAt) */
    getThreadsForProject: (projectId: string) => ConversationThread[];

    /** Get thread by ID */
    getThread: (threadId: string) => ConversationThread | undefined;

    /** Clear all threads for project */
    clearProjectThreads: (projectId: string) => void;
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Thread CRUD Slice Implementation
 */
export const createThreadCrudSlice: StateCreator<
    ThreadCrudSlice & {
        threads: Record<string, ConversationThread>;
        activeThreadId: string | null;
    },
    [],
    [],
    ThreadCrudSlice
> = (set, get) => ({
    createThread: (projectId: string) => {
        const id = generateId('thread');
        const now = Date.now();

        const thread: ConversationThread = {
            id,
            projectId,
            title: 'New Conversation',
            preview: '',
            messages: [],
            agentsUsed: [],
            messageCount: 0,
            createdAt: now,
            updatedAt: now,
        };

        console.log('[ThreadCrudSlice] Creating thread:', id);
        set((state) => ({
            threads: { ...state.threads, [id]: thread },
            activeThreadId: id, // Auto-enter new thread
        }));

        return thread;
    },

    deleteThread: (threadId: string) => {
        console.log('[ThreadCrudSlice] Deleting thread:', threadId);
        set((state) => {
            const { [threadId]: deleted, ...remaining } = state.threads;
            return {
                threads: remaining,
                activeThreadId: state.activeThreadId === threadId ? null : state.activeThreadId,
            };
        });
    },

    updateThreadTitle: (threadId: string, title: string) => {
        set((state) => {
            const thread = state.threads[threadId];
            if (!thread) return state;
            return {
                threads: {
                    ...state.threads,
                    [threadId]: { ...thread, title, updatedAt: Date.now() },
                },
            };
        });
    },

    getThreadsForProject: (projectId: string) => {
        const { threads } = get();
        return Object.values(threads)
            .filter((t) => t.projectId === projectId)
            .sort((a, b) => b.updatedAt - a.updatedAt);
    },

    getThread: (threadId: string) => {
        return get().threads[threadId];
    },

    clearProjectThreads: (projectId: string) => {
        console.log('[ThreadCrudSlice] Clearing threads for project:', projectId);
        set((state) => {
            const filtered = Object.fromEntries(
                Object.entries(state.threads).filter(([_, t]) => t.projectId !== projectId)
            );
            return {
                threads: filtered,
                activeThreadId: null,
            };
        });
    },
});
