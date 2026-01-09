/**
 * @fileoverview Chat Domain Entities
 * @module domain/entities/chat
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Unified chat entities combining hierarchical threads from System A
 * with tool execution capabilities from System B.
 *
 * @story MM-01: Create Unified Chat Store
 * @created 2026-01-10
 */

/**
 * Workspace type enumeration
 * Re-exports from value-objects for convenience
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Message role enumeration
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Tool call status
 */
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error' | 'cancelled';

/**
 * Tool approval status
 */
export type ToolApprovalStatus = 'pending' | 'approved' | 'denied' | 'auto_approved';

/**
 * Tool call record
 *
 * Represents a single tool execution within a message.
 * Persists across refreshes, unlike transient hook state.
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** Tool/function name being called */
  name: string;
  /** Current execution status */
  status: ToolCallStatus;
  /** Input arguments for the tool */
  input?: Record<string, unknown>;
  /** Output result from the tool */
  output?: unknown;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Error message if status is 'error' */
  error?: string;
  /** When the tool call was initiated */
  createdAt: number;
  /** When the tool call completed (null if pending/running) */
  completedAt?: number;
}

/**
 * Chat message with optional tool calls
 *
 * Represents a single message in a conversation thread.
 * Extends the basic message with agent attribution and tool calls.
 */
export interface ChatMessage {
  /** Unique identifier for this message */
  id: string;
  /** Message role */
  role: MessageRole;
  /** Message content (text or structured data) */
  content: string;
  /** Thread this message belongs to */
  threadId: string;
  /** Agent that generated this response (for assistant messages) */
  agentId?: string;
  /** Agent display name */
  agentName?: string;
  /** Agent model used */
  agentModel?: string;
  /** Tool calls made during this response */
  toolCalls?: ToolCall[];
  /** When the message was created */
  timestamp: number;
  /** Message metadata for future extensibility */
  metadata?: Record<string, unknown>;
}

/**
 * Tool approval request
 *
 * Represents a tool call awaiting user approval.
 * These persist across refreshes and can be restored.
 */
export interface ToolApproval {
  /** Unique identifier for this approval request */
  id: string;
  /** Associated tool call ID */
  toolCallId: string;
  /** Tool/function name */
  toolName: string;
  /** Tool arguments */
  toolArgs: Record<string, unknown>;
  /** Conversation this approval belongs to */
  conversationId: string;
  /** Thread this approval belongs to */
  threadId: string;
  /** Message this approval belongs to */
  messageId: string;
  /** Current approval status */
  status: ToolApprovalStatus;
  /** When the approval was requested */
  createdAt: number;
  /** When the approval was resolved (null if pending) */
  resolvedAt?: number;
}

/**
 * Context window configuration
 *
 * Manages token limits for long conversations.
 * Used by RAG system to prevent context overflow.
 */
export interface ContextWindowConfig {
  /** Maximum tokens allowed in context */
  maxTokens: number;
  /** Current token count estimate */
  currentTokens: number;
  /** Strategy for handling overflow */
  compressionStrategy: 'drop_oldest' | 'summarize' | 'truncate';
}

/**
 * Conversation thread with hierarchical support
 *
 * Represents a thread within a conversation.
 * Supports hierarchical organization (cascade flow).
 */
export interface ChatThread {
  /** Unique identifier for this thread */
  id: string;
  /** Parent conversation ID */
  conversationId: string;
  /** Associated project ID */
  projectId: string;
  /** Workspace type (for workspace-scoped threads) */
  workspaceId?: WorkspaceType;
  /** Thread title */
  title: string;
  /** Preview of thread content */
  preview: string;
  /** Parent thread ID for hierarchical organization (null = root) */
  parentThreadId?: string | null;
  /** Child thread IDs for cascade navigation */
  childThreadIds?: string[];
  /** Folder path for thread organization (e.g., "/Frontend/Components") */
  folderPath?: string;
  /** Context window management for long conversations */
  contextWindow?: ContextWindowConfig;
  /** Thread status */
  status: 'active' | 'archived' | 'deleted';
  /** When the thread was created */
  createdAt: number;
  /** When the thread was last updated */
  updatedAt: number;
  /** Number of messages in this thread */
  messageCount: number;
}

/**
 * Conversation metadata
 *
 * Represents a top-level conversation container.
 * Multiple threads can exist within a conversation.
 */
export interface ChatConversation {
  /** Unique identifier for this conversation */
  id: string;
  /** Associated project ID (null for global conversations) */
  projectId: string | null;
  /** Workspace type */
  workspaceType: WorkspaceType;
  /** Conversation title */
  title: string;
  /** Preview of conversation content */
  preview: string;
  /** Agent ID for this conversation */
  agentId: string;
  /** Number of messages across all threads */
  messageCount: number;
  /** Scroll position in pixels (for workspace switching) */
  scrollPosition: number;
  /** Conversation status */
  status: 'active' | 'archived' | 'deleted';
  /** Whether conversation is pinned to top */
  pinned?: boolean;
  /** User-defined tags for organization */
  tags?: string[];
  /** When the conversation was created */
  createdAt: number;
  /** When the conversation was last updated */
  updatedAt: number;
}

/**
 * Thread hierarchy node for tree navigation
 *
 * Used for rendering cascade flow UI.
 */
export interface ThreadHierarchyNode {
  /** Thread data */
  thread: ChatThread;
  /** Child nodes (recursive) */
  children: ThreadHierarchyNode[];
  /** Depth in hierarchy (0 = root) */
  depth: number;
}

/**
 * Conversation state for persistence
 *
 * Aggregated state for saving/loading conversations from IndexedDB.
 * Includes all related threads and messages.
 */
export interface ConversationState {
  /** Conversation metadata */
  metadata: {
    id: string;
    projectId: string | null;
    workspaceId: WorkspaceType;
    workspaceType: WorkspaceType;
    title: string;
    preview: string;
    agentId: string;
    messageCount: number;
    scrollPosition: number;
    createdAt: number;
    updatedAt: number;
  };
  /** All messages in this conversation */
  messages: ChatMessage[];
}
