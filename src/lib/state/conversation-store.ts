/**
 * @fileoverview Conversation State Management (Zustand)
 * @module lib/state/conversation-store
 * @epic 2 - AI Chat That Just Works
 * @story 2.1 - Zustand + Dexie State Migration
 * 
 * Single source of truth for conversation state.
 * Persists to IndexedDB via Dexie adapter.
 * 
 * Features:
 * - Active conversation tracking
 * - Scroll position restoration (FR-STATE-02)
 * - Pending tool approval tracking
 * - Message history with hydration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { createDexieStorage } from './dexie-storage';
import type { ThreadMessageRecord, ConversationThreadRecord } from './dexie-db';
import { saveThread, getThread, deleteThread as deleteDexieThread } from '../workspace/threads-store';
import type { ConversationThread } from '@/stores/conversation-threads-store';

// ============================================================================
// Types
// ============================================================================

/**
 * Pending tool approval requiring user action
 */
export interface PendingToolApproval {
    id: string;
    conversationId: string;
    messageId: string;
    toolName: string;
    toolInput: unknown;
    status: 'pending' | 'approved' | 'denied';
    createdAt: number;
}

/**
 * Conversation metadata and state
 */
export interface ConversationMetadata {
    id: string;
    projectId: string | null;
    title: string;
    preview: string;
    agentId: string | null;
    messageCount: number;
    scrollPosition: number;
    createdAt: number;
    updatedAt: number;
}

/**
 * Full conversation state including messages
 */
export interface ConversationState {
    metadata: ConversationMetadata;
    messages: ThreadMessageRecord[];
}

/**
 * Conversation Store State Interface
 */
interface ConversationStoreState {
    /** Currently active conversation ID */
    activeConversationId: string | null;

    /** All conversations keyed by ID */
    conversations: Record<string, ConversationState>;

    /** Scroll positions per conversation (for restoration) */
    scrollPositions: Record<string, number>;

    /** Pending tool approvals awaiting user action */
    pendingToolApprovals: PendingToolApproval[];

    /** Whether store has hydrated from persistence */
    _hasHydrated: boolean;

    // Actions

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Create a new conversation */
    createConversation: (projectId?: string | null, agentId?: string | null) => string;

    /** Set active conversation */
    setActiveConversation: (id: string | null) => void;

    /** Add message to conversation */
    addMessage: (conversationId: string, message: ThreadMessageRecord) => void;

    /** Update message in conversation */
    updateMessage: (conversationId: string, messageId: string, updates: Partial<ThreadMessageRecord>) => void;

    /** Update scroll position for restoration */
    updateScrollPosition: (conversationId: string, scrollTop: number) => void;

    /** Add pending tool approval */
    addPendingToolApproval: (approval: Omit<PendingToolApproval, 'id' | 'createdAt'>) => string;

    /** Resolve tool approval (approve/deny) */
    resolveToolApproval: (id: string, status: 'approved' | 'denied') => void;

    /** Get conversation by ID */
    getConversation: (id: string) => ConversationState | undefined;

    /** Load conversation from Dexie into store */
    loadConversation: (id: string) => Promise<void>;

    /** Delete conversation */
    deleteConversation: (id: string) => Promise<void>;

    /** Reset store to empty state */
    reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_CONVERSATIONS = 50; // Limit to prevent unbounded growth

// ============================================================================
// Helpers
// ============================================================================

/**
 * Persist conversation state to Dexie threads table
 * This ensures consistency with the Threads view
 */
async function persistToDexie(conversation: ConversationState) {
    try {
        const thread: ConversationThreadRecord = {
            id: conversation.metadata.id,
            projectId: conversation.metadata.projectId || 'default',
            title: conversation.metadata.title,
            preview: conversation.metadata.preview || '',
            messages: conversation.messages,
            agentsUsed: conversation.metadata.agentId ? [conversation.metadata.agentId] : [],
            messageCount: conversation.messages.length,
            createdAt: conversation.metadata.createdAt,
            updatedAt: conversation.metadata.updatedAt,
        };

        const uiThread: ConversationThread = {
            id: thread.id,
            projectId: thread.projectId,
            title: thread.title,
            preview: thread.preview,
            messages: thread.messages as any[], // Casting for now, types match close enough
            agentsUsed: thread.agentsUsed,
            messageCount: thread.messageCount,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt
        };

        await saveThread(uiThread);
    } catch (error: any) {
        console.error('[ConversationStore] Failed to persist thread:', error);
        if (error.name === 'QuotaExceededError') {
            toast.error('Storage full. Please clear old conversations.', {
                duration: 5000,
                action: {
                    label: 'Clear Data',
                    onClick: () => console.log('Trigger clear data')
                }
            });
        }
    }
}

/**
 * Debounced persist to Dexie (500ms default)
 * Performance optimization for frequent updates during chat
 */
const debouncedPersistToDexie = debounce(
    async (conversation: ConversationState) => {
        await persistToDexie(conversation);
    },
    500,
    { leading: false, trailing: true }
);

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Conversation store with IndexedDB (Dexie) persistence
 * 
 * Uses the same pattern as useProviderStore and useAgentsStore.
 * 
 * @example
 * ```tsx
 * const { activeConversationId, addMessage } = useConversationStore();
 * ```
 */
export const useConversationStore = create<ConversationStoreState>()(
    persist(
        (set, get) => ({
            activeConversationId: null,
            conversations: {},
            scrollPositions: {},
            pendingToolApprovals: [],
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            createConversation: (projectId = null, agentId = null) => {
                const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const now = Date.now();

                const newConversation: ConversationState = {
                    metadata: {
                        id,
                        projectId,
                        title: 'New Conversation',
                        preview: '',
                        agentId,
                        messageCount: 0,
                        scrollPosition: 0,
                        createdAt: now,
                        updatedAt: now,
                    },
                    messages: [],
                };

                console.log('[ConversationStore] Creating conversation:', id);

                set((state) => ({
                    conversations: {
                        ...state.conversations,
                        [id]: newConversation,
                    },
                    activeConversationId: id,
                }));

                // Initial persist
                persistToDexie(newConversation);

                return id;
            },

            setActiveConversation: (id) => {
                console.log('[ConversationStore] Setting active:', id);
                set({ activeConversationId: id });
            },

            addMessage: (conversationId, message) => {
                // console.log('[ConversationStore] Adding message to:', conversationId);

                set((state) => {
                    const conversation = state.conversations[conversationId];
                    if (!conversation) {
                        console.warn('[ConversationStore] Conversation not found:', conversationId);
                        return state;
                    }

                    // Deduplicate by ID
                    if (conversation.messages.some(m => m.id === message.id)) {
                        return state;
                    }

                    // Enforce limit (AC-5)
                    let updatedMessages = [...conversation.messages, message];
                    if (updatedMessages.length > MAX_CONVERSATIONS) {
                        // Simple pruning: remove from start (index 0)
                        updatedMessages = updatedMessages.slice(updatedMessages.length - 50);
                    }

                    const preview = message.content.substring(0, 100);
                    const title = conversation.metadata.title === 'New Conversation' && message.role === 'user'
                        ? message.content.substring(0, 50)
                        : conversation.metadata.title;

                    const newState = {
                        conversations: {
                            ...state.conversations,
                            [conversationId]: {
                                ...conversation,
                                messages: updatedMessages,
                                metadata: {
                                    ...conversation.metadata,
                                    title,
                                    preview,
                                    messageCount: updatedMessages.length,
                                    updatedAt: Date.now(),
                                },
                            },
                        },
                    };

                    // Optimistic persist
                    persistToDexie(newState.conversations[conversationId]);
                    return newState;
                });
            },

            updateMessage: (conversationId, messageId, updates) => {
                set((state) => {
                    const conversation = state.conversations[conversationId];
                    if (!conversation) return state;

                    const updatedMessages = conversation.messages.map(m =>
                        m.id === messageId ? { ...m, ...updates } : m
                    );

                    const newState = {
                        conversations: {
                            ...state.conversations,
                            [conversationId]: {
                                ...conversation,
                                messages: updatedMessages,
                                metadata: {
                                    ...conversation.metadata,
                                    updatedAt: Date.now(),
                                },
                            },
                        },
                    };

                    // Optimistic persist
                    persistToDexie(newState.conversations[conversationId]);
                    return newState;
                });
            },

            updateScrollPosition: (conversationId, scrollTop) => {
                set((state) => {
                    const scrollState = {
                        scrollPositions: {
                            ...state.scrollPositions,
                            [conversationId]: scrollTop,
                        }
                    };

                    const conversation = state.conversations[conversationId];
                    if (conversation) {
                        return {
                            ...scrollState,
                            conversations: {
                                ...state.conversations,
                                [conversationId]: {
                                    ...conversation,
                                    metadata: {
                                        ...conversation.metadata,
                                        scrollPosition: scrollTop
                                    }
                                }
                            }
                        };
                    }
                    return scrollState;
                });
            },

            addPendingToolApproval: (approval) => {
                const id = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                const fullApproval: PendingToolApproval = {
                    ...approval,
                    id,
                    createdAt: Date.now(),
                };

                console.log('[ConversationStore] Adding tool approval:', id, approval.toolName);

                set((state) => ({
                    pendingToolApprovals: [...state.pendingToolApprovals, fullApproval],
                }));

                return id;
            },

            resolveToolApproval: (id, status) => {
                console.log('[ConversationStore] Resolving tool approval:', id, status);

                set((state) => ({
                    pendingToolApprovals: state.pendingToolApprovals.map(a =>
                        a.id === id ? { ...a, status } : a
                    ),
                }));
            },

            getConversation: (id) => {
                return get().conversations[id];
            },

            loadConversation: async (id) => {
                const state = get();
                if (state.conversations[id]) {
                    set({ activeConversationId: id });
                    return;
                }

                try {
                    const thread = await getThread(id);
                    if (thread) {
                        set(state => ({
                            activeConversationId: id,
                            conversations: {
                                ...state.conversations,
                                [id]: {
                                    metadata: {
                                        id: thread.id,
                                        projectId: thread.projectId,
                                        title: thread.title,
                                        preview: thread.preview,
                                        agentId: thread.agentsUsed[0] || null,
                                        messageCount: thread.messageCount,
                                        scrollPosition: 0,
                                        createdAt: thread.createdAt,
                                        updatedAt: thread.updatedAt,
                                    },
                                    messages: thread.messages as ThreadMessageRecord[],
                                }
                            }
                        }));
                    }
                } catch (err) {
                    console.error('[ConversationStore] Failed to load conversation:', err);
                    toast.error('Failed to load conversation history');
                }
            },

            deleteConversation: async (id) => {
                console.log('[ConversationStore] Deleting conversation:', id);

                try {
                    await deleteDexieThread(id);
                } catch (err) {
                    console.error('[ConversationStore] Failed to delete from Dexie:', err);
                }

                set((state) => {
                    const { [id]: deleted, ...remaining } = state.conversations;
                    const { [id]: deletedScroll, ...remainingScrolls } = state.scrollPositions;

                    // If deleting active, switch to most recent remaining
                    const newActiveId = state.activeConversationId === id
                        ? Object.keys(remaining).sort((a, b) =>
                            (remaining[b]?.metadata.updatedAt || 0) - (remaining[a]?.metadata.updatedAt || 0)
                        )[0] || null
                        : state.activeConversationId;

                    return {
                        conversations: remaining,
                        scrollPositions: remainingScrolls,
                        activeConversationId: newActiveId,
                        pendingToolApprovals: state.pendingToolApprovals.filter(
                            a => a.conversationId !== id
                        ),
                    };
                });
            },

            reset: () => {
                console.log('[ConversationStore] Resetting to empty state');
                set({
                    activeConversationId: null,
                    conversations: {},
                    scrollPositions: {},
                    pendingToolApprovals: [],
                });
            },
        }),
        {
            name: 'conversation-state',
            // Use Dexie storage adapter for IndexedDB persistence
            storage: createJSONStorage(() => createDexieStorage('conversationState')),

            // Persist all essential state
            partialize: (state) => ({
                activeConversationId: state.activeConversationId,
                conversations: state.conversations,
                scrollPositions: state.scrollPositions,
                // Don't persist pending approvals - they should be reprocessed on reload
            }),

            // Hydration handler
            onRehydrateStorage: () => (state) => {
                console.log('[ConversationStore] Rehydrated from IndexedDB:',
                    Object.keys(state?.conversations || {}).length, 'conversations');

                if (state) {
                    // Clean up old conversations (keep last MAX_CONVERSATIONS)
                    const conversationIds = Object.keys(state.conversations);
                    if (conversationIds.length > MAX_CONVERSATIONS) {
                        const sorted = conversationIds.sort((a, b) =>
                            (state.conversations[b]?.metadata.updatedAt || 0) -
                            (state.conversations[a]?.metadata.updatedAt || 0)
                        );

                        const toDelete = sorted.slice(MAX_CONVERSATIONS);
                        toDelete.forEach(id => {
                            delete state.conversations[id];
                            delete state.scrollPositions[id];
                        });

                        console.log('[ConversationStore] Cleaned up', toDelete.length, 'old conversations');
                    }

                    // Validate activeConversationId
                    if (state.activeConversationId && !state.conversations[state.activeConversationId]) {
                        const firstId = Object.keys(state.conversations)[0];
                        state.activeConversationId = firstId || null;
                    }

                    state.setHasHydrated(true);
                }
            },
        }
    )
);

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to wait for hydration from IndexedDB
 * 
 * @example
 * ```tsx
 * const hasHydrated = useConversationStoreHydration();
 * if (!hasHydrated) return <Loading />;
 * ```
 */
export function useConversationStoreHydration() {
    return useConversationStore((state) => state._hasHydrated);
}

/**
 * Hook to get active conversation
 */
export function useActiveConversation() {
    return useConversationStore((state) => {
        if (!state.activeConversationId) return null;
        return state.conversations[state.activeConversationId] || null;
    });
}

/**
 * Hook to get pending approvals for a conversation
 */
export function usePendingApprovals(conversationId: string | null) {
    return useConversationStore((state) =>
        state.pendingToolApprovals.filter(
            a => a.conversationId === conversationId && a.status === 'pending'
        )
    );
}
