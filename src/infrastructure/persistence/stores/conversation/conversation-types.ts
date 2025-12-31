/**
 * @fileoverview Unified Conversation Store Types
 * @module infrastructure/persistence/stores/conversation/conversation-types
 * @governance Architectural Specification v3.0
 *
 * Consolidated types for conversation and thread management.
 * Supports workspace-aware conversations with tool approval tracking.
 *
 * December 2025 Best Practices:
 * - Workspace-aware conversation management
 * - Tool approval tracking for agent workflows
 * - Optimized for large message histories
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ThreadMessageRecord } from '../../dexie-db';

// ============================================================================
// Tool Approval Types
// ============================================================================

/**
 * Tool call record within a message
 * Tracks execution of AI tools during conversation
 */
export interface ConversationToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input?: unknown;
  output?: unknown;
  duration?: number;
}

/**
 * Pending tool approval requiring user action
 * Generated when agent requests tool execution
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
 * Extended with workspace awareness for multi-workspace architecture
 */
export interface ConversationMetadata {
  id: string;
  projectId: string | null;
  workspaceType: WorkspaceType; // NEW: Workspace awareness

  title: string;
  preview: string;

  agentId: string | null;
  messageCount: number;

  scrollPosition: number; // For restoration (FR-STATE-02)
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
 * Extended with workspace and project tracking
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

  /** Current workspace type */
  currentWorkspaceType: WorkspaceType; // NEW

  /** Current project ID */
  currentProjectId: string | null; // NEW

  /** Whether store has hydrated from persistence */
  _hasHydrated: boolean;

  // ========== Actions ==========

  /** Set hydration status */
  setHasHydrated: (state: boolean) => void;

  // ========== Workspace & Project ==========

  /** Set current workspace type */
  setCurrentWorkspace: (workspaceType: WorkspaceType) => void; // NEW

  /** Set current project ID */
  setCurrentProject: (projectId: string | null) => void; // NEW

  // ========== Conversation CRUD ==========

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

  // ========== Queries ==========

  /** Get conversations for workspace */
  getConversationsForWorkspace: (
    workspaceType: WorkspaceType,
    projectId?: string | null
  ) => ConversationState[]; // NEW

  /** Reset store to empty state */
  reset: () => void;
}
