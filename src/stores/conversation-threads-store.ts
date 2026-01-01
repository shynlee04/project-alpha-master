/**
 * Conversation Threads Store - Zustand with Persistence
 * 
 * Manages conversation threads with multi-agent support within threads.
 * Threads are project-scoped and support agent switching during conversation.
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 * 
 * Design Decisions:
 * - One thread per conversation (project-scoped)
 * - Agents can be switched within a thread (response shows agent name/model)
 * - Future: Auto-compress context for long threads
 * - Future: Multi-pipeline storage for complex workflows
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Message with agent attribution
 */
export interface ThreadMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    /** Agent that generated this response (for assistant messages) */
    agentId?: string;
    agentName?: string;
    agentModel?: string;
    timestamp: number;
    /** Tool calls made during this response */
    toolCalls?: ThreadToolCall[];
}

/**
 * Tool call record within a message
 */
export interface ThreadToolCall {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    input?: unknown;
    output?: unknown;
    duration?: number;
}

/**
 * Context window configuration for thread
 * Ralph Loop Cycle 5: Cascade Flow Support
 */
export interface ContextWindowConfig {
    maxTokens: number;
    currentTokens: number;
    compressionStrategy: 'drop_oldest' | 'summarize' | 'truncate';
}

/**
 * Conversation thread with cascade hierarchy support
 * Ralph Loop Cycle 5: Folder-based organization for conversations
 */
export interface ConversationThread {
    id: string;
    projectId: string;
    title: string;
    preview: string;
    messages: ThreadMessage[];
    /** Agents used in this thread (for display) */
    agentsUsed: string[];
    messageCount: number;
    createdAt: number;
    updatedAt: number;

    // ========== Ralph Loop Cycle 5: Cascade Flow Fields ==========

    /** Parent thread ID for hierarchical organization (null = root level) */
    parentId?: string | null;

    /** Child thread IDs for cascade navigation */
    children?: string[];

    /** Folder path for thread organization (e.g., "/Frontend/Components") */
    folderPath?: string;

    /** Context window management for long conversations */
    contextWindow?: ContextWindowConfig;
}

/**
 * Thread hierarchy node for tree navigation
 * Ralph Loop Cycle 5: Cascade Flow Support
 */
export interface ThreadHierarchyNode {
    thread: ConversationThread;
    children: ThreadHierarchyNode[];
    depth: number;
}

/**
 * Thread store state
 */
interface ThreadsState {
    /** All threads indexed by ID */
    threads: Record<string, ConversationThread>;
    /** Currently active thread ID */
    activeThreadId: string | null;
    /** Currently selected project ID */
    currentProjectId: string | null;
    /** Hydration status */
    _hasHydrated: boolean;

    // Actions
    setHasHydrated: (state: boolean) => void;
    setCurrentProject: (projectId: string) => void;

    /** Create a new thread for current project */
    createThread: (projectId: string) => ConversationThread;

    /** Delete a thread */
    deleteThread: (threadId: string) => void;

    /** Set active thread (enters conversation) */
    setActiveThread: (threadId: string | null) => void;

    /** Update thread title */
    updateThreadTitle: (threadId: string, title: string) => void;

    /** Add message to thread */
    addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => void;

    /** Update message (for streaming) */
    updateMessage: (threadId: string, messageId: string, content: string) => void;

    /** Get threads for project (sorted by updatedAt) */
    getThreadsForProject: (projectId: string) => ConversationThread[];

    /** Get thread by ID */
    getThread: (threadId: string) => ConversationThread | undefined;

    /** Clear all threads for project */
    clearProjectThreads: (projectId: string) => void;

    // ========== Ralph Loop Cycle 5: Cascade Flow Operations ==========

    /** Create child thread under parent */
    createChildThread: (parentId: string, title: string) => ConversationThread;

    /** Move thread to new parent or root */
    moveThread: (threadId: string, newParentId: string | null) => void;

    /** Get thread hierarchy (tree structure) */
    getThreadHierarchy: (projectId: string) => ThreadHierarchyNode[];

    /** Get all descendants of a thread */
    getThreadDescendants: (threadId: string) => ConversationThread[];

    /** Update folder path for thread */
    updateThreadFolder: (threadId: string, folderPath: string) => void;

    /** Prune context window for long conversations */
    pruneContextWindow: (threadId: string, targetTokens: number) => Promise<void>;
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Conversation Threads Store
 * 
 * Persisted to localStorage for cross-session access.
 * 
 * @example
 * ```tsx
 * const { threads, createThread, setActiveThread } = useThreadsStore();
 * 
 * // Create new thread
 * const thread = createThread('project-123');
 * 
 * // Enter conversation
 * setActiveThread(thread.id);
 * 
 * // Add message
 * addMessage(thread.id, { role: 'user', content: 'Hello!' });
 * ```
 */
export const useThreadsStore = create<ThreadsState>()(
    persist(
        (set, get) => ({
            threads: {},
            activeThreadId: null,
            currentProjectId: null,
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            setCurrentProject: (projectId: string) => {
                console.log('[ThreadsStore] Setting current project:', projectId);
                set({ currentProjectId: projectId, activeThreadId: null });
            },

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

                console.log('[ThreadsStore] Creating thread:', id);
                set((state) => ({
                    threads: { ...state.threads, [id]: thread },
                    activeThreadId: id, // Auto-enter new thread
                }));

                return thread;
            },

            deleteThread: (threadId: string) => {
                console.log('[ThreadsStore] Deleting thread:', threadId);
                set((state) => {
                    const { [threadId]: deleted, ...remaining } = state.threads;
                    return {
                        threads: remaining,
                        activeThreadId: state.activeThreadId === threadId ? null : state.activeThreadId,
                    };
                });
            },

            setActiveThread: (threadId: string | null) => {
                console.log('[ThreadsStore] Setting active thread:', threadId);
                set({ activeThreadId: threadId });
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

            addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => {
                const id = generateId('msg');
                const timestamp = Date.now();

                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;

                    const newMessage: ThreadMessage = { ...message, id, timestamp };
                    const messages = [...thread.messages, newMessage];

                    // Update title from first user message
                    let title = thread.title;
                    if (thread.messages.length === 0 && message.role === 'user') {
                        title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
                    }

                    // Track agents used
                    let agentsUsed = thread.agentsUsed;
                    if (message.agentId && !agentsUsed.includes(message.agentId)) {
                        agentsUsed = [...agentsUsed, message.agentId];
                    }

                    // Preview from last message
                    const preview = message.content.slice(0, 100);

                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                messages,
                                title,
                                preview,
                                agentsUsed,
                                messageCount: messages.length,
                                updatedAt: timestamp,
                            },
                        },
                    };
                });
            },

            updateMessage: (threadId: string, messageId: string, content: string) => {
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;

                    const messages = thread.messages.map((msg) =>
                        msg.id === messageId ? { ...msg, content } : msg
                    );

                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                messages,
                                preview: content.slice(0, 100),
                                updatedAt: Date.now(),
                            },
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
                console.log('[ThreadsStore] Clearing threads for project:', projectId);
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

            // ========== Ralph Loop Cycle 5: Cascade Flow Operations ==========

            createChildThread: (parentId: string, title: string) => {
                const id = generateId('thread');
                const now = Date.now();
                const parent = get().threads[parentId];

                if (!parent) {
                    console.error('[ThreadsStore] Parent thread not found:', parentId);
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

                console.log('[ThreadsStore] Creating child thread:', id, 'under parent:', parentId);

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
                console.log('[ThreadsStore] Moving thread:', threadId, 'to parent:', newParentId);
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) {
                        console.error('[ThreadsStore] Thread not found:', threadId);
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
                            children: oldParentChildren.filter((id) => id !== threadId),
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

                // Build lookup map
                const threadMap = new Map(projectThreads.map((t) => [t.id, t]));

                // Build tree recursively
                function buildTree(parentId: string | null, depth: number): ThreadHierarchyNode[] {
                    const children = projectThreads.filter((t) => t.parentId === parentId);
                    return children.map((thread) => ({
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

            updateThreadFolder: (threadId: string, folderPath: string) => {
                console.log('[ThreadsStore] Updating folder for thread:', threadId, 'to:', folderPath);
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;

                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                folderPath,
                                updatedAt: Date.now(),
                            },
                        },
                    };
                });
            },

            pruneContextWindow: async (threadId: string, targetTokens: number) => {
                console.log('[ThreadsStore] Pruning context window for thread:', threadId, 'target:', targetTokens);
                const thread = get().threads[threadId];
                if (!thread) {
                    console.error('[ThreadsStore] Thread not found:', threadId);
                    return;
                }

                // Import context window manager dynamically
                const { pruneContextWindow, countMessageTokens } = await import('@/lib/chat/context-window-manager');

                // Get current token count
                const currentTokens = countMessageTokens(thread.messages);
                console.log('[ThreadsStore] Current tokens:', currentTokens, 'target:', targetTokens);

                if (currentTokens <= targetTokens) {
                    console.log('[ThreadsStore] No pruning needed');
                    return;
                }

                // Get compression strategy from thread config (default to drop_oldest)
                const strategy = thread.contextWindow?.compressionStrategy || 'drop_oldest';

                // Prune messages
                const prunedMessages = await pruneContextWindow(thread.messages, {
                    maxTokens: targetTokens,
                    currentTokens,
                    compressionStrategy: strategy,
                });

                console.log('[ThreadsStore] Pruned messages:', thread.messages.length, '→', prunedMessages.length);

                // Update thread with pruned messages
                set((state) => ({
                    threads: {
                        ...state.threads,
                        [threadId]: {
                            ...thread,
                            messages: prunedMessages,
                            messageCount: prunedMessages.length,
                            updatedAt: Date.now(),
                        },
                    },
                }));
            },
        }),
        {
            name: 'via-gent-threads',
            version: 1,
            onRehydrateStorage: () => (state) => {
                console.log('[ThreadsStore] Rehydrated:', Object.keys(state?.threads || {}).length, 'threads');
                state?.setHasHydrated(true);
            },
        }
    )
);

/**
 * Hook to get active thread
 */
export function useActiveThread() {
    return useThreadsStore((state) =>
        state.activeThreadId ? state.threads[state.activeThreadId] : null
    );
}

/**
 * Hook to get threads for current project
 */
export function useProjectThreads(projectId: string) {
    return useThreadsStore((state) => state.getThreadsForProject(projectId));
}

/**
 * Hook for hydration status
 */
export function useThreadsHydration() {
    return useThreadsStore((state) => state._hasHydrated);
}

// ============================================================================
// Ralph Loop Cycle 5: Cascade Flow Hooks
// ============================================================================

/**
 * Hook to get thread hierarchy as tree structure
 */
export function useThreadHierarchy(projectId: string) {
    return useThreadsStore((state) => state.getThreadHierarchy(projectId));
}

/**
 * Hook to get descendants of a thread
 */
export function useThreadDescendants(threadId: string) {
    return useThreadsStore((state) => state.getThreadDescendants(threadId));
}

/**
 * Hook to create child thread
 */
export function useCreateChildThread() {
    return useThreadsStore((state) => state.createChildThread);
}

/**
 * Hook to move thread to new parent
 */
export function useMoveThread() {
    return useThreadsStore((state) => state.moveThread);
}

/**
 * Hook to update thread folder path
 */
export function useUpdateThreadFolder() {
    return useThreadsStore((state) => state.updateThreadFolder);
}

/**
 * Hook to prune context window
 */
export function usePruneContextWindow() {
    return useThreadsStore((state) => state.pruneContextWindow);
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
        console.log('[ThreadsStore] Synced to Dexie:', thread.id);
    } catch (error) {
        console.warn('[ThreadsStore] Dexie sync failed:', error);
    }
}

async function deleteThreadFromDexie(threadId: string) {
    try {
        const { deleteThread } = await import('@/lib/workspace/threads-store');
        await deleteThread(threadId);
        console.log('[ThreadsStore] Deleted from Dexie:', threadId);
    } catch (error) {
        console.warn('[ThreadsStore] Dexie delete failed:', error);
    }
}

// Subscribe to store changes and sync to Dexie
let lastThreads: Record<string, ConversationThread> = {};

useThreadsStore.subscribe((state) => {
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
    const { threads } = useThreadsStore.getState();
    try {
        const { bulkSaveThreads } = await import('@/lib/workspace/threads-store');
        await bulkSaveThreads(Object.values(threads));
        console.log('[ThreadsStore] Bulk synced', Object.keys(threads).length, 'threads to Dexie');
    } catch (error) {
        console.warn('[ThreadsStore] Bulk sync failed:', error);
    }
}

// Save all threads on page close/refresh and periodically
if (typeof window !== 'undefined') {
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        // Use synchronous localStorage as backup (Dexie async may not complete)
        const { threads } = useThreadsStore.getState();
        try {
            localStorage.setItem('via-gent-threads-backup', JSON.stringify({
                state: { threads },
                timestamp: Date.now()
            }));
            console.log('[ThreadsStore] Saved backup on unload');
        } catch (e) {
            console.warn('[ThreadsStore] Backup save failed:', e);
        }
        // Trigger async Dexie sync (best effort)
        syncAllThreadsToDexie();
    });

    // Periodic sync every 30 seconds as safety net
    setInterval(() => {
        const { threads } = useThreadsStore.getState();
        if (Object.keys(threads).length > 0) {
            syncAllThreadsToDexie();
        }
    }, 30000);
}
