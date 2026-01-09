/**
 * @fileoverview Chat Metadata Slice
 * @module infrastructure/persistence/stores/chat/slices
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Conversation CRUD operations for unified chat store.
 * Manages conversation lifecycle, project association, and workspace scoping.
 *
 * @story MM-01: Create Unified Chat Store
 * @created 2026-01-10
 */

import { StateCreator } from 'zustand';
import type { WorkspaceType } from '@/domain/entities/chat';
import type { CombinedUnifiedChatState, ConversationWithId } from '../unified-chat-types';

// Slice state (subset of CombinedUnifiedChatState)
type ChatMetadataSliceState = Pick<CombinedUnifiedChatState,
  'conversations' | 'activeConversationId' | 'activeProjectConversationIds'
>;

// Slice methods
type ChatMetadataSliceMethods = {
  createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
  updateConversation: (id: string, updates: Partial<ConversationWithId>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  setScrollPosition: (id: string, scrollPosition: number) => void;
  getConversation: (id: string) => ConversationWithId | undefined;
  getAllConversations: () => ConversationWithId[];
  getConversationsByWorkspace: (workspaceType: WorkspaceType) => ConversationWithId[];
  getConversationsByProject: (projectId: string) => ConversationWithId[];
};

/**
 * Generate cryptographically unique conversation ID
 * CA-003 FIX: Uses crypto.randomUUID() instead of Math.random()
 * Falls back to timestamp + random for SSR compatibility
 */
const generateId = () => {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `chat_${uuid}`;
};

export const createChatMetadataSlice: StateCreator<
  CombinedUnifiedChatState,
  [],
  [],
  ChatMetadataSliceState & ChatMetadataSliceMethods
> = (set, get) => ({
  conversations: {},
  activeConversationId: null,
  activeProjectConversationIds: {},

  createConversation: (workspaceType, projectId, agentId) => {
    const now = Date.now();
    const conversationId = generateId();
    const newConversation: ConversationWithId = {
      id: conversationId,
      workspaceType,
      projectId,
      agentId,
      title: 'New Chat',
      preview: '',
      messageCount: 0,
      scrollPosition: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    console.log('[ChatMetadataSlice] Creating:', conversationId);
    set((state) => ({
      conversations: { ...state.conversations, [conversationId]: newConversation },
      ...(projectId ? { activeProjectConversationIds: { ...state.activeProjectConversationIds, [projectId]: conversationId } } : {}),
    }));

    // Auto-persist after creation
    get().persistConversation();

    return conversationId;
  },

  updateConversation: (id, updates) => {
    const existing = get().conversations[id];
    if (!existing) { console.warn('[ChatMetadataSlice] Not found:', id); return; }
    console.log('[ChatMetadataSlice] Updating:', id);
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...existing, ...updates, updatedAt: Date.now() },
      },
    }));

    // Auto-persist after update
    get().persistConversation();
  },

  deleteConversation: (id) => {
    console.log('[ChatMetadataSlice] Soft-deleting:', id);
    get().updateConversation(id, { status: 'deleted' });
  },

  setActiveConversation: (id) => {
    const conversation = get().conversations[id];
    if (!conversation) { console.warn('[ChatMetadataSlice] Not found:', id); return; }
    console.log('[ChatMetadataSlice] Setting active:', id);
    set((state) => ({
      activeConversationId: id,
      ...(conversation.projectId ? {
        activeProjectConversationIds: {
          ...state.activeProjectConversationIds,
          [conversation.projectId]: id,
        },
      } : {}),
    }));
  },

  setScrollPosition: (id, scrollPosition) => {
    const existing = get().conversations[id];
    if (!existing) { console.warn('[ChatMetadataSlice] Cannot set scroll: not found:', id); return; }
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...existing, scrollPosition, updatedAt: Date.now() },
      },
    }));
    get().persistConversation();
  },

  getConversation: (id) => get().conversations[id],

  getAllConversations: () =>
    Object.values(get().conversations).filter((c) => c.status !== 'deleted'),

  getConversationsByWorkspace: (workspaceType) =>
    get().getAllConversations().filter((c) => c.workspaceType === workspaceType),

  getConversationsByProject: (projectId) =>
    get().getAllConversations().filter((c) => c.projectId === projectId),
});
