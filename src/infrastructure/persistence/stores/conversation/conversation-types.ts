/**
 * @fileoverview Conversation store type definitions
 * @module infrastructure/persistence/stores/conversation/conversation-types
 */

import type { ThreadMessageRecord } from '../../dexie-db';

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
export interface ConversationStoreState {
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
