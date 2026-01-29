/**
 * PHASE 2 STUB: Conversation Thread Types
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/conversation/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  // Extended properties for compatibility
  agentId?: string;
  agentName?: string;
  agentModel?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    status: string;
    input?: unknown;
    output?: unknown;
    duration?: number;
  }>;
}

export interface ConversationThread {
  id: string;
  messages: ThreadMessage[];
  parentId?: string;
  // Extended properties for threads-store compatibility
  projectId?: string;
  workspaceType?: string;
  title?: string;
  preview?: string;
  agentsUsed?: string[];
  messageCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface ThreadHierarchyNode {
  id: string;
  children: ThreadHierarchyNode[];
}

export interface ContextWindowConfig {
  maxTokens: number;
  reserveTokens?: number;
  compressionStrategy?: 'drop_oldest' | 'summarize' | 'truncate';
  currentTokens?: number;
}

// Re-export types needed by external consumers
export type { 
  ConversationMetadataWithId,
  ConversationMetadataExtended,
  ConversationMetadata,
  PendingToolApproval,
  ConversationState
} from './conversation-types';
