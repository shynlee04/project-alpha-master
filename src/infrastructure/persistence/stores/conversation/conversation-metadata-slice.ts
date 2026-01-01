import { StateCreator } from 'zustand';
import type { ConversationMetadata, WorkspaceType } from '@/core/entities/Conversation';
import type { CombinedConversationState } from './types';

export interface ConversationMetadataWithId extends ConversationMetadata {
  id: string;
  workspaceType: WorkspaceType;
  projectId: string | null;
  agentId: string;
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

// Slice state (subset of CombinedConversationState)
type ConversationMetadataSliceState = Pick<CombinedConversationState,
  'conversations' | 'activeConversationId' | 'activeProjectConversationIds'
>;

// Slice methods
type ConversationMetadataSliceMethods = {
  createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
  updateConversationMetadata: (id: string, updates: Partial<ConversationMetadata>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
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
    const now = new Date().toISOString();
    const conversationId = generateId();
    const newConversation: ConversationMetadataWithId = {
      id: conversationId, workspaceType, projectId, agentId,
      status: 'active', createdAt: now, updatedAt: now,
      title: undefined, tags: undefined, pinned: false,
    };
    console.log('[ConversationMetadataSlice] Creating:', conversationId);
    set((state) => ({
      conversations: { ...state.conversations, [conversationId]: newConversation },
      ...(projectId ? { activeProjectConversationIds: { ...state.activeProjectConversationIds, [projectId]: conversationId } } : {}),
    }));
    return conversationId;
  },

  updateConversationMetadata: (id, updates) => {
    const existing = get().conversations[id];
    if (!existing) { console.warn('[ConversationMetadataSlice] Not found:', id); return; }
    console.log('[ConversationMetadataSlice] Updating:', id);
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { ...existing, ...updates, updatedAt: new Date().toISOString() },
      },
    }));
  },

  deleteConversation: (id) => {
    console.log('[ConversationMetadataSlice] Soft-deleting:', id);
    get().updateConversationMetadata(id, { status: 'deleted' });
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

  getConversation: (id) => get().conversations[id],

  getAllConversations: () =>
    Object.values(get().conversations).filter((c) => c.status !== 'deleted'),

  getConversationsByWorkspace: (workspaceType) =>
    get().getAllConversations().filter((c) => c.workspaceType === workspaceType),

  getConversationsByProject: (projectId) =>
    get().getAllConversations().filter((c) => c.projectId === projectId),
});
