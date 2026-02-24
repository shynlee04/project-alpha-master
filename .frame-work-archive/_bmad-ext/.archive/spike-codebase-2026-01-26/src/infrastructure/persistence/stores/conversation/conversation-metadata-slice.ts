import { StateCreator } from 'zustand';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { CombinedConversationState, ConversationMetadataExtended } from './types';

// Use the exported type from types.ts to avoid conflicts
export type ConversationMetadataWithId = ConversationMetadataExtended;

// Slice state (subset of CombinedConversationState)
type ConversationMetadataSliceState = Pick<CombinedConversationState,
  'conversations' | 'activeConversationId' | 'activeProjectConversationIds'
>;

// Slice methods
type ConversationMetadataSliceMethods = {
  createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
  updateConversationMetadata: (id: string, updates: Partial<ConversationMetadataWithId>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  setScrollPosition: (id: string, scrollPosition: number) => void;
  getConversation: (id: string) => ConversationMetadataWithId | undefined;
  getAllConversations: () => ConversationMetadataWithId[];
  getConversationsByWorkspace: (workspaceType: WorkspaceType) => ConversationMetadataWithId[];
  getConversationsByProject: (projectId: string) => ConversationMetadataWithId[];
};

const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createConversationMetadataSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  ConversationMetadataSliceState & ConversationMetadataSliceMethods
> = (set, get) => ({
  conversations: {},
  activeConversationId: null,
  activeProjectConversationIds: {},

  createConversation: (workspaceType, projectId, agentId) => {
    const now = Date.now();
    const conversationId = generateId();
    const newConversation: ConversationMetadataWithId = {
      id: conversationId,
      workspaceType, // CHAT-024: Standardized naming
      projectId,
      agentId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      title: 'New Conversation', // Default title (required field)
      preview: '', // Default preview (required field)
      messageCount: 0, // Default message count (required field)
      scrollPosition: 0, // E1-6: Initialize scroll position
      pinned: false,
      tags: undefined,
    };
    console.log('[ConversationMetadataSlice] Creating:', conversationId);
    set((state) => ({
      conversations: { ...state.conversations, [conversationId]: newConversation },
      ...(projectId ? { activeProjectConversationIds: { ...state.activeProjectConversationIds, [projectId]: conversationId } } : {}),
    }));
    get().emitConversationCreated(conversationId, newConversation);

    // P0-4: Auto-persist conversation to IndexedDB (debounced 500ms)
    get().persistConversation();

    return conversationId;
  },

  updateConversationMetadata: (id, updates) => {
    const existing = get().conversations[id];
    if (!existing) { console.warn('[ConversationMetadataSlice] Not found:', id); return; }
    console.log('[ConversationMetadataSlice] Updating:', id);
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...existing, ...updates, updatedAt: Date.now() },
      },
    }));
    get().emitConversationUpdated(id, updates);

    // P0-4: Auto-persist conversation to IndexedDB (debounced 500ms)
    get().persistConversation();
  },

  deleteConversation: (id) => {
    console.log('[ConversationMetadataSlice] Soft-deleting:', id);
    get().updateConversationMetadata(id, { status: 'deleted' });
    get().emitConversationDeleted(id);

    // P0-4: Auto-persist conversation to IndexedDB (debounced 500ms)
    get().persistConversation();
  },

  setActiveConversation: (id) => {
    const conversation = get().conversations[id];
    if (!conversation) { console.warn('[ConversationMetadataSlice] Not found:', id); return; }
    console.log('[ConversationMetadataSlice] Setting active:', id);
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

  // E1-6: Set scroll position for a conversation
  setScrollPosition: (id, scrollPosition) => {
    const existing = get().conversations[id];
    if (!existing) {
      console.warn('[ConversationMetadataSlice] Cannot set scroll position: conversation not found:', id);
      return;
    }
    console.log('[ConversationMetadataSlice] Setting scroll position:', { id, scrollPosition });
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...existing, scrollPosition, updatedAt: Date.now() },
      },
    }));

    // Auto-persist after scroll position update (debounced)
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
