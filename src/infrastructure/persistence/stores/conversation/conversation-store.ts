/**
 * @fileoverview Conversation State Management (Zustand)
 * @module infrastructure/persistence/stores/conversation/conversation-store
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
import type { ThreadMessageRecord, ConversationThreadRecord } from '../../dexie-db';
import { createDexieStorage } from '../../dexie-storage';
import { getThread, deleteThread as deleteDexieThread } from '@/lib/workspace/threads-store';
import type { ConversationThread } from '@/infrastructure/persistence/stores/conversation-threads-store';
import type {
  ConversationState,
  ConversationStoreState,
  ConversationMetadata,
} from './conversation-types';
import {
  MAX_CONVERSATIONS,
  createDebouncedPersist,
} from './conversation-helpers';

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Debounced persist to Dexie (500ms default)
 * Performance optimization for frequent updates during chat
 */
const debouncedPersistToDexie = createDebouncedPersist(500);

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
      currentWorkspaceType: 'ide', // NEW: Default workspace
      currentProjectId: null, // NEW: Default project
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // ========== Workspace & Project Actions ==========

      setCurrentWorkspace: (workspaceType: WorkspaceType) => {
        console.log('[ConversationStore] Setting workspace:', workspaceType);
        set({ currentWorkspaceType: workspaceType });
      },

      setCurrentProject: (projectId: string | null) => {
        console.log('[ConversationStore] Setting project:', projectId);
        set({ currentProjectId: projectId });
      },

      createConversation: (projectId = null, agentId = null) => {
        const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        // Use current workspace from store
        const workspaceType = get().currentWorkspaceType;

        const newConversation: ConversationState = {
          metadata: {
            id,
            projectId,
            workspaceType, // NEW: Store workspace type
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

        console.log('[ConversationStore] Creating conversation:', id, 'workspace:', workspaceType);

        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: newConversation,
          },
          activeConversationId: id,
        }));

        // Initial persist (debounced for performance)
        debouncedPersistToDexie(newConversation);

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

          // Optimistic persist (debounced for performance)
          debouncedPersistToDexie(newState.conversations[conversationId]);
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

          // Optimistic persist (debounced for performance)
          debouncedPersistToDexie(newState.conversations[conversationId]);
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

        const fullApproval = {
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

      // ========== Queries ==========

      getConversationsForWorkspace: (workspaceType: WorkspaceType, projectId = null) => {
        const { conversations } = get();
        return Object.values(conversations).filter(conv => {
          const matchesWorkspace = conv.metadata.workspaceType === workspaceType;
          const matchesProject = projectId === null || conv.metadata.projectId === projectId;
          return matchesWorkspace && matchesProject;
        }).sort((a, b) => b.metadata.updatedAt - a.metadata.updatedAt);
      },

      reset: () => {
        console.log('[ConversationStore] Resetting to empty state');
        set({
          activeConversationId: null,
          conversations: {},
          scrollPositions: {},
          pendingToolApprovals: [],
          currentWorkspaceType: 'ide', // Reset to default workspace
          currentProjectId: null,
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
        currentWorkspaceType: state.currentWorkspaceType, // NEW
        currentProjectId: state.currentProjectId, // NEW
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
// Cleanup
// ============================================================================

/**
 * Flush pending debounced saves on page unload
 * Ensures any pending persistence calls are completed
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    debouncedPersistToDexie.flush();
  });
}

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
