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
}

export interface ConversationThread {
  id: string;
  messages: ThreadMessage[];
  parentId?: string;
}

export interface ThreadHierarchyNode {
  id: string;
  children: ThreadHierarchyNode[];
}

export interface ContextWindowConfig {
  maxTokens: number;
  reserveTokens: number;
}
