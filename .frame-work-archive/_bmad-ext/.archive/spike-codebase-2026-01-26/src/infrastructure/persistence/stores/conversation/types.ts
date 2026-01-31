/**
 * Conversation Store Types
 *
 * Shared types for conversation threads, messages, and hierarchy.
 * Extracted from conversation-threads-store.ts for reusability.
 *
 * @module conversation/types
 */

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
    workspaceType?: WorkspaceType; // CHAT-024: Standardized naming (was workspaceId)
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
 * Combined Conversation State
 *
 * Unified state combining all conversation slices:
 * - conversation-metadata-slice: Conversation CRUD operations
 * - thread-management-slice: Thread hierarchy and lifecycle (Story CC-1.2)
 * - message-crud-slice: Message operations within threads (Story CC-1.3)
 * - conversation-utils-slice: Utility functions (Story CC-1.4)
 * - conversation-validation-slice: Validation logic (Story CC-1.5)
 * - conversation-events-slice: Event emission (Story CC-1.6)
 *
 * NOTE: Using type-only imports to avoid circular dependencies.
 * These types are erased by TypeScript and don't exist at runtime.
 */
import type { ConversationMetadata } from './conversation-types';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ConversationEvent, ConversationEventType } from './event-types';

// Define slice-specific types inline using utility types to avoid circular imports
// Each slice will provide the actual implementation

// Extend ConversationMetadata with store-specific properties
// Note: We use Omit to handle type incompatibilities with base ConversationMetadata
export interface ConversationMetadataExtended
  extends Omit<ConversationMetadata, 'agentId'> {
  status: 'active' | 'archived' | 'deleted';
  // Override to make agentId required (non-null)
  agentId: string;

  // Additional properties used throughout the codebase
  pinned?: boolean;  // Whether conversation is pinned to top
  tags?: string[];  // User-defined tags for organization
  // Note: scrollPosition, title, createdAt, updatedAt are inherited from ConversationMetadata
}

// Extend ConversationThread with store-specific properties
export interface ThreadExtended extends ConversationThread {
  id: string;
  status: 'active' | 'archived' | 'deleted';
  conversationId: string;  // Back-reference to conversation
  parentThreadId?: string | null;
  childThreadIds?: string[];
  isRoot?: boolean;
}

// Extend ThreadMessage with store-specific properties
export interface MessageExtended extends ThreadMessage {
  id: string;
  threadId: string;  // Association with thread
}

export type ConversationMetadataWithId = ConversationMetadataExtended;
export type ThreadWithId = ThreadExtended;
export type MessageWithId = MessageExtended;

// Additional domain types moved here to avoid circular dependencies
export interface ConversationStats {
  messageCount: number;
  threadCount: number;
  totalTokens: number;
  durationMs: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CombinedConversationState {
    // ========== Conversation Metadata Slice ==========
    conversations: Record<string, ConversationMetadataWithId>;
    activeConversationId: string | null;
    activeProjectConversationIds: Record<string, string>;

    // ========== Conversation Metadata Methods ==========
    createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
    updateConversationMetadata: (id: string, updates: Partial<ConversationMetadataWithId>) => void;
    deleteConversation: (id: string) => void;
    setActiveConversation: (id: string) => void;
    getConversation: (id: string) => ConversationMetadataWithId | undefined;
    getAllConversations: () => ConversationMetadataWithId[];
    getConversationsByWorkspace: (workspaceType: WorkspaceType) => ConversationMetadataWithId[];
    getConversationsByProject: (projectId: string) => ConversationMetadataWithId[];

    // ========== E1-6: Conversation Persistence Across Workspaces ==========
    /** Set scroll position for a conversation (pixels from top) */
    setScrollPosition: (id: string, scrollPosition: number) => void;

    // ========== Thread Management Slice (Story CC-1.2) ==========
    threads: Record<string, ThreadWithId>;
    activeThreadId: string | null;

    // ========== Thread Management Methods ==========
    createThread: (conversationId: string, parentThreadId?: string) => string;
    deleteThread: (threadId: string) => void;
    setActiveThread: (threadId: string | null) => void;
    getThread: (threadId: string) => ThreadWithId | undefined;
    getThreadsByConversation: (conversationId: string) => ThreadWithId[];
    getRootThread: (conversationId: string) => ThreadWithId | undefined;
    getChildThreads: (parentThreadId: string) => ThreadWithId[];
    getThreadHierarchy: (threadId: string) => ThreadWithId[];

    // ========== Message CRUD Slice (Story CC-1.3) ==========
    messages: Record<string, MessageWithId>;

    // ========== Message CRUD Methods ==========
    addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => string;
    updateMessage: (messageId: string, updates: Partial<ThreadMessage>) => void;
    deleteMessage: (messageId: string) => void;
    getMessage: (messageId: string) => MessageWithId | undefined;
    getMessagesByThread: (threadId: string) => MessageWithId[];
    getLastMessage: (threadId: string) => MessageWithId | undefined;

    // ========== Conversation Utils Slice (Story CC-1.4) ==========
    filterConversations: (predicate: (conv: ConversationMetadataWithId) => boolean) => ConversationMetadataWithId[];
    sortConversations: (comparator: (a: ConversationMetadataWithId, b: ConversationMetadataWithId) => number) => ConversationMetadataWithId[];
    searchConversations: (query: string) => ConversationMetadataWithId[];
    searchConversationsByTag: (tags: string[]) => ConversationMetadataWithId[];
    getConversationStats: (conversationId: string) => ConversationStats;
    getRecentConversations: (limit?: number) => ConversationMetadataWithId[];
    loadConversation: (conversationId: string) => Promise<void>; // Story 51-3: Load conversation from Dexie
    loadConversationByProject: (projectId: string) => Promise<void>; // Story 51-3: Load most recent conversation for project

    // ========== Conversation Validation Slice (Story CC-1.5) ==========
    validateConversationId: (id: string) => ValidationResult;
    validateThreadId: (id: string) => ValidationResult;
    validateMessageId: (id: string) => ValidationResult;
    validateConversationStatus: (id: string, newStatus: 'active' | 'archived' | 'deleted') => ValidationResult;
    validateThreadStatus: (id: string, newStatus: 'active' | 'archived' | 'deleted') => ValidationResult;
    validateThreadHierarchy: (threadId: string) => ValidationResult;
    validateMessageThreadAssociation: (messageId: string) => ValidationResult;
    validateConversationIntegrity: (conversationId: string) => ValidationResult;

    // ========== Conversation Events Slice (Story CC-1.6) ==========
    eventHistory: ConversationEvent[];
    emitEvent: (type: ConversationEventType, entityId: string, data?: unknown) => void;
    emitConversationCreated: (id: string, conversation: ConversationMetadataWithId) => void;
    emitConversationUpdated: (id: string, updates: Partial<ConversationMetadataWithId>) => void;
    emitConversationDeleted: (id: string) => void;
    emitThreadCreated: (id: string, thread: ThreadWithId) => void;
    emitThreadUpdated: (id: string, updates: Partial<ThreadWithId>) => void;
    emitThreadDeleted: (id: string) => void;
    emitMessageAdded: (id: string, message: MessageWithId) => void;
    emitMessageUpdated: (id: string, updates: Partial<MessageWithId>) => void;
    emitMessageDeleted: (id: string) => void;
    addEventListener: (eventType: ConversationEventType, listener: (event: ConversationEvent) => void) => () => void;
    removeEventListener: (eventType: ConversationEventType, listener: (event: ConversationEvent) => void) => void;
    getEventHistory: (filter?: { type?: ConversationEventType; entityId?: string; limit?: number }) => ConversationEvent[];
    clearEventHistory: () => void;

    // ========== Auto-Persist (P0-4: Fix Conversation Auto-Persist) ==========
    /** Auto-persist current conversation to IndexedDB (debounced 500ms) */
    persistConversation: () => Promise<void>;

    /** Get current conversation state for persistence */
    getCurrentConversation: () => import('./conversation-types').ConversationState | null;

    // ========== Hydration & Tool Approval State (Story 51-3) ==========
    /** Hydration status for Zustand persist middleware */
    _hasHydrated: boolean;

    /** Pending tool approvals for conversation UI */
    pendingToolApprovals: PendingToolApproval[];
}

/**
 * Pending Tool Approval
 * Used to track tools awaiting user approval in the conversation UI
 */
export interface PendingToolApproval {
    id: string;
    toolName: string;
    toolArgs: Record<string, unknown>;
    conversationId: string;
    threadId: string;
    messageId: string;
    createdAt: number;
    status: 'pending' | 'approved' | 'denied';
}

