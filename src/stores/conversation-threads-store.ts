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
 * Conversation thread
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
