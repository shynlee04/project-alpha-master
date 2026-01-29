/**
 * PHASE 2 STUB: Conversation Types
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/conversation/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export interface PendingToolApproval {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  status?: 'active' | 'archived';
  tags?: string[];
}

// Extended metadata type for useChatHistory compatibility
export interface ConversationMetadataWithId extends ConversationMetadata {
  // Already has id from ConversationMetadata
}

export interface ConversationMetadataExtended extends ConversationMetadata {
  projectId?: string;
  agentId?: string;
  workspaceType?: string;
}

export interface ConversationState {
  conversations: Record<string, unknown>;
  activeConversationId: string | null;
  pendingApprovals: PendingToolApproval[];
  _hasHydrated: boolean;
  getConversation: (id: string) => ConversationMetadataWithId | null;
  getConversationsByProject: (projectId: string) => unknown[];
  getConversationsByWorkspace: (workspaceType: string) => unknown[];
  setActiveConversation: (id: string | null) => void;
  createConversation: (workspaceType: string, projectId: string | null, agentId: string) => string;
  loadConversationByProject: (projectId: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  addMessage: (conversationId: string, message: unknown) => void;
  updateMessage: (conversationId: string, messageId: string, updates: unknown) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
  // Additional methods for compatibility
  getAllConversations: () => ConversationMetadataWithId[];
  updateConversationMetadata: (id: string, updates: Partial<ConversationMetadata>) => void;
  searchConversations: (query: string) => ConversationMetadataWithId[];
  searchConversationsByTag: (tags: string[]) => ConversationMetadataWithId[];
  // Additional methods used by consumers
  getCurrentConversation: () => ConversationState | null;
  persistConversation: () => Promise<void>;
  // Thread-related methods
  activeThreadId?: string | null;
  threads?: Record<string, unknown>;
  setActiveThread?: (threadId: string | null) => void;
}

export type ConversationStoreState = ConversationState;
