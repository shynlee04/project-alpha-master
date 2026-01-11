/**
 * @fileoverview Unified Chat Store Types
 * @module infrastructure/persistence/stores/chat
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Type definitions for the unified chat store.
 * Combines hierarchical thread management with tool execution.
 *
 * @story MM-01: Create Unified Chat Store
 * @created 2026-01-10
 */

import type {
  ChatConversation,
  ChatMessage,
  ChatThread,
  ToolCall,
  ToolApproval,
  ConversationState,
  WorkspaceType,
} from '@/domain/entities/chat';

// ============================================================================
// Extended Store Types (with store-specific properties)
// ============================================================================

/**
 * Conversation with store-specific properties
 */
export interface ConversationWithId extends ChatConversation {
  id: string;
}

/**
 * Thread with store-specific properties
 */
export interface ThreadWithId extends ChatThread {
  id: string;
  conversationId: string;
  isRoot?: boolean;
}

/**
 * Message with store-specific properties
 */
export interface MessageWithId extends ChatMessage {
  id: string;
  threadId: string;
}

/**
 * Tool call with store-specific properties
 */
export interface ToolCallWithId extends ToolCall {
  id: string;
  messageId: string;
}

// ============================================================================
// Combined State Interface
// ============================================================================

/**
 * Unified Chat Store State
 *
 * Combines all slices into a single state interface:
 * - Chat Metadata Slice: Conversation CRUD operations
 * - Thread Management Slice: Thread hierarchy and lifecycle
 * - Message CRUD Slice: Message operations within threads
 * - Tool Execution Slice: Tool call tracking and approvals
 */
export interface CombinedUnifiedChatState {
  // ========== Chat Metadata Slice ==========
  /** All conversations indexed by ID */
  conversations: Record<string, ConversationWithId>;
  /** Currently active conversation ID */
  activeConversationId: string | null;
  /** Active conversation ID per project */
  activeProjectConversationIds: Record<string, string>;

  // ========== Chat Metadata Methods ==========
  createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
  updateConversation: (id: string, updates: Partial<ConversationWithId>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  setScrollPosition: (id: string, scrollPosition: number) => void;
  getConversation: (id: string) => ConversationWithId | undefined;
  getAllConversations: () => ConversationWithId[];
  getConversationsByWorkspace: (workspaceType: WorkspaceType) => ConversationWithId[];
  getConversationsByProject: (projectId: string) => ConversationWithId[];

  // ========== Thread Management Slice ==========
  /** All threads indexed by ID */
  threads: Record<string, ThreadWithId>;
  /** Currently active thread ID */
  activeThreadId: string | null;

  // ========== Thread Management Methods ==========
  createThread: (conversationId: string, parentThreadId?: string) => string;
  deleteThread: (threadId: string) => void;
  updateThread: (threadId: string, updates: Partial<Omit<ThreadWithId, 'id' | 'conversationId' | 'createdAt'>>) => void;
  /** CHAT-006: Archive a thread (sets status to 'archived') */
  archiveThread: (threadId: string) => void;
  /** CHAT-006: Unarchive a thread (sets status back to 'active') */
  unarchiveThread: (threadId: string) => void;
  setActiveThread: (threadId: string | null) => void;
  getThread: (threadId: string) => ThreadWithId | undefined;
  getThreadsByConversation: (conversationId: string) => ThreadWithId[];
  getThreadsByWorkspace: (workspaceType: ThreadWithId['workspaceType']) => ThreadWithId[];
  getRootThread: (conversationId: string) => ThreadWithId | undefined;
  getChildThreads: (parentThreadId: string) => ThreadWithId[];
  getThreadHierarchy: (threadId: string) => ThreadWithId[];

  // ========== Message CRUD Slice ==========
  /** All messages indexed by ID */
  messages: Record<string, MessageWithId>;

  // ========== Message CRUD Methods ==========
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'threadId'>) => string;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  getMessage: (messageId: string) => MessageWithId | undefined;
  getMessagesByThread: (threadId: string) => MessageWithId[];
  getLastMessage: (threadId: string) => MessageWithId | undefined;

  // ========== Tool Execution Slice ==========
  /** All tool calls indexed by ID */
  toolCalls: Record<string, ToolCallWithId>;
  /** Pending tool approvals awaiting user action */
  pendingApprovals: ToolApproval[];
  /** Approval history (including approved/denied) */
  approvalHistory: Record<string, ToolApproval>;

  // ========== Tool Execution Methods ==========
  createToolCall: (messageId: string, toolCall: Omit<ToolCall, 'id' | 'messageId' | 'createdAt'>) => string;
  updateToolCall: (toolCallId: string, updates: Partial<ToolCall>) => void;
  getToolCallsByMessage: (messageId: string) => ToolCallWithId[];
  getPendingToolCalls: () => ToolCallWithId[];
  addPendingApproval: (approval: Omit<ToolApproval, 'id' | 'createdAt'>) => string;
  approveToolCall: (approvalId: string) => void;
  denyToolCall: (approvalId: string, reason?: string) => void;
  autoApproveToolCall: (approvalId: string) => void;
  getPendingApprovals: () => ToolApproval[];
  clearPendingApprovals: () => void;

  // ========== Context Window Methods (MM-09) ==========
  /** Get context usage for a thread */
  getContextUsage: (threadId: string) => {
    current: number;
    max: number;
    remaining: number;
    percentage: number;
  } | null;
  /** Update context window for a thread after adding a message */
  updateContextWindow: (threadId: string) => void;
  /** Compress context for a thread using its strategy */
  compressContext: (
    threadId: string,
    strategy?: 'drop_oldest' | 'summarize' | 'truncate'
  ) => { removed: number; remaining: number };
  /** Check if thread context is near limit */
  isContextNearLimit: (threadId: string, threshold?: number) => boolean;
  /** Set max tokens for a thread's context window */
  setThreadMaxTokens: (threadId: string, maxTokens: number) => void;
  /** Set compression strategy for a thread */
  setThreadCompressionStrategy: (
    threadId: string,
    strategy: 'drop_oldest' | 'summarize' | 'truncate'
  ) => void;

  // ========== Persistence Methods ==========
  /** Persist current conversation to IndexedDB */
  persistConversation: () => Promise<void>;
  /** Get current conversation state for persistence */
  getCurrentConversation: () => ConversationState | null;
  /** Load conversation from IndexedDB */
  loadConversation: (conversationId: string) => Promise<void>;
  /** Load most recent conversation for a project */
  loadConversationByProject: (projectId: string) => Promise<void>;

  // ========== Hydration State ==========
  /** Hydration status for Zustand persist middleware */
  _hasHydrated: boolean;
}

// ============================================================================
// Validation Result Type
// ============================================================================

/**
 * Validation result for store operations
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Re-export domain types for convenience
// ============================================================================

export type {
  ChatConversation,
  ChatMessage,
  ChatThread,
  ToolCall,
  ToolApproval,
  ConversationState,
  WorkspaceType,
  MessageRole,
  ToolCallStatus,
  ToolApprovalStatus,
  ThreadHierarchyNode,
  ContextWindowConfig,
} from '@/domain/entities/chat';
