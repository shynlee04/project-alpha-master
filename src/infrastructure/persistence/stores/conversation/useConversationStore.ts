/**
 * Conversation Store - Combined from Focused Slices
 *
 * December 2025 Zustand Pattern:
 * - Single store composed from focused slices
 * - Each slice is <165 lines (single responsibility)
 * - Persist middleware on combined store
 * - Dexie sync for background persistence
 *
 * @module conversation/useConversationStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    ThreadMessage,
    ConversationThread,
    ThreadHierarchyNode,
} from './types';
import {
    createThreadCrudSlice,
    createMessageSlice,
    createContextWindowSlice,
    createHierarchySlice,
    createMetadataSlice,
    createProjectStateSlice,
} from './slices';

// Re-export types for consumers
export type { ThreadMessage, ConversationThread, ThreadHierarchyNode };

/**
 * Combined Conversation Store State
 * Composed from all slices
 */
export interface ConversationStoreState {
    // Shared state across all slices
    threads: Record<string, ConversationThread>;

    // Project state slice
    activeThreadId: string | null;
    currentProjectId: string | null;
    _hasHydrated: boolean;

    // Thread CRUD actions
    createThread: (projectId: string) => ConversationThread;
    deleteThread: (threadId: string) => void;
    updateThreadTitle: (threadId: string, title: string) => void;
    getThreadsForProject: (projectId: string) => ConversationThread[];
    getThread: (threadId: string) => ConversationThread | undefined;
    clearProjectThreads: (projectId: string) => void;

    // Message actions
    addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => void;
    updateMessage: (threadId: string, messageId: string, content: string) => void;

    // Context window actions
    pruneContextWindow: (threadId: string, targetTokens: number) => Promise<void>;

    // Hierarchy actions
    createChildThread: (parentId: string, title: string) => ConversationThread;
    moveThread: (threadId: string, newParentId: string | null) => void;
    getThreadHierarchy: (projectId: string) => ThreadHierarchyNode[];
    getThreadDescendants: (threadId: string) => ConversationThread[];

    // Metadata actions
    updateThreadFolder: (threadId: string, folderPath: string) => void;

    // Project state actions
    setHasHydrated: (state: boolean) => void;
    setCurrentProject: (projectId: string) => void;
}

/**
 * Combined Conversation Store
 *
 * Composed from 6 focused slices using December 2025 Zustand pattern.
 * Persisted to localStorage with Dexie background sync.
 */
export const useConversationStore = create<ConversationStoreState>()(
    persist(
        (set, get, api) => ({
            // Initialize shared state
            threads: {},

            // Compose all slices
            ...createProjectStateSlice(set, get, api),
            ...createThreadCrudSlice(set, get, api),
            ...createMessageSlice(set, get, api),
            ...createContextWindowSlice(set, get, api),
            ...createHierarchySlice(set, get, api),
            ...createMetadataSlice(set, get, api),
        }),
        {
            name: 'via-gent-threads',
            version: 1,
            onRehydrateStorage: () => (state) => {
                console.log('[ConversationStore] Rehydrated:', Object.keys(state?.threads || {}).length, 'threads');
                state?.setHasHydrated(true);
            },
        }
    )
);

// ============================================================================
// Convenience Hooks (Matching Original Store API)
// ============================================================================

/**
 * Hook to get active thread
 */
export function useActiveThread() {
    return useConversationStore((state) =>
        state.activeThreadId ? state.threads[state.activeThreadId] : null
    );
}

/**
 * Hook to get threads for current project
 */
export function useProjectThreads(projectId: string) {
    return useConversationStore((state) => state.getThreadsForProject(projectId));
}

/**
 * Hook for hydration status
 */
export function useThreadsHydration() {
    return useConversationStore((state) => state._hasHydrated);
}

// ============================================================================
// Ralph Loop Cycle 5: Cascade Flow Hooks
// ============================================================================

/**
 * Hook to get thread hierarchy as tree structure
 */
export function useThreadHierarchy(projectId: string) {
    return useConversationStore((state) => state.getThreadHierarchy(projectId));
}

/**
 * Hook to get descendants of a thread
 */
export function useThreadDescendants(threadId: string) {
    return useConversationStore((state) => state.getThreadDescendants(threadId));
}

/**
 * Hook to create child thread
 */
export function useCreateChildThread() {
    return useConversationStore((state) => state.createChildThread);
}

/**
 * Hook to move thread to new parent
 */
export function useMoveThread() {
    return useConversationStore((state) => state.moveThread);
}

/**
 * Hook to update thread folder path
 */
export function useUpdateThreadFolder() {
    return useConversationStore((state) => state.updateThreadFolder);
}

/**
 * Hook to prune context window
 */
export function usePruneContextWindow() {
    return useConversationStore((state) => state.pruneContextWindow);
}

// ============================================================================
// Dexie Sync (Background Persistence for Indexing)
// ============================================================================

/**
 * Sync threads to Dexie for persistence and future indexing.
 * This runs in background after zustand/localStorage handles immediate state.
 */
async function syncThreadToDexie(thread: ConversationThread) {
    try {
        const { saveThread } = await import('@/lib/workspace/threads-store');
        await saveThread(thread);
        console.log('[ConversationStore] Synced to Dexie:', thread.id);
    } catch (error) {
        console.warn('[ConversationStore] Dexie sync failed:', error);
    }
}

async function deleteThreadFromDexie(threadId: string) {
    try {
        const { deleteThread } = await import('@/lib/workspace/threads-store');
        await deleteThread(threadId);
        console.log('[ConversationStore] Deleted from Dexie:', threadId);
    } catch (error) {
        console.warn('[ConversationStore] Dexie delete failed:', error);
    }
}

// Subscribe to store changes and sync to Dexie
let lastThreads: Record<string, ConversationThread> = {};

useConversationStore.subscribe((state) => {
    const currentThreads = state.threads;

    // Find new or updated threads
    for (const [id, thread] of Object.entries(currentThreads)) {
        const lastThread = lastThreads[id];
        if (!lastThread || lastThread.updatedAt !== thread.updatedAt) {
            // Thread is new or updated - sync to Dexie
            syncThreadToDexie(thread);
        }
    }

    // Find deleted threads
    for (const id of Object.keys(lastThreads)) {
        if (!currentThreads[id]) {
            // Thread was deleted
            deleteThreadFromDexie(id);
        }
    }

    lastThreads = { ...currentThreads };
});

/**
 * Force sync all threads to Dexie (used on page close)
 */
async function syncAllThreadsToDexie() {
    const { threads } = useConversationStore.getState();
    try {
        const { bulkSaveThreads } = await import('@/lib/workspace/threads-store');
        await bulkSaveThreads(Object.values(threads));
        console.log('[ConversationStore] Bulk synced', Object.keys(threads).length, 'threads to Dexie');
    } catch (error) {
        console.warn('[ConversationStore] Bulk sync failed:', error);
    }
}

// Save all threads on page close/refresh and periodically
if (typeof window !== 'undefined') {
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        // Use synchronous localStorage as backup (Dexie async may not complete)
        const { threads } = useConversationStore.getState();
        try {
            localStorage.setItem('via-gent-threads-backup', JSON.stringify({
                state: { threads },
                timestamp: Date.now()
            }));
            console.log('[ConversationStore] Saved backup on unload');
        } catch (e) {
            console.warn('[ConversationStore] Backup save failed:', e);
        }
        // Trigger async Dexie sync (best effort)
        syncAllThreadsToDexie();
    });

    // Periodic sync every 30 seconds as safety net
    setInterval(() => {
        const { threads } = useConversationStore.getState();
        if (Object.keys(threads).length > 0) {
            syncAllThreadsToDexie();
        }
    }, 30000);
}
