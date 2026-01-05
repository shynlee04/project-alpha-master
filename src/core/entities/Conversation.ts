/**
 * Conversation Entity (Domain Layer)
 */

export interface Conversation {
  id: string;
  workspaceType: WorkspaceType;
  threadId: string;             // Root thread (for branching)

  // Agent
  agentId: string;              // Which agent is participating

  // Messages
  messages: Message[];

  // Context Management
  context: ConversationContext;

  // Metadata
  metadata: ConversationMetadata;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';

  // Content (multimodal)
  content: MessageContent[];

  // Attachments (files, images, documents)
  attachments: Attachment[];

  // Tool Interactions
  toolCalls: ToolCall[];
  toolResults: ToolResult[];

  // Timestamp
  timestamp: Date;

  // Status
  status: MessageStatus;
}

export type MessageContent =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string; language: string }
  | { type: 'image'; value: string; mimeType: string }
  | { type: 'file'; value: string; fileName: string };

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface Thread {
  id: string;
  parentConversationId: string;
  branchFromMessageId: string;
  name: string;
  isArchived: boolean;

  // Context tracking
  contextTokens: number;

  createdAt: Date;
}

export interface ConversationContext {
  tokenBudget: number;           // Max tokens for context
  usedTokens: number;

  // Summarization
  summaries: ContextSummary[];

  // Attached resources
  attachedFiles: string[];
  attachedDocuments: string[];    // For knowledge workspace
  ragSources: string[];           // Active RAG sources
}

export interface ContextSummary {
  summaryId: string;
  content: string;
  tokenCount: number;
  messageRange: {
    startIndex: number;
    endIndex: number;
  };
}

export interface ConversationMetadata {
  title?: string;
  tags?: string[];
  pinned?: boolean;
  /** E1-6: Scroll position in pixels (for restoring conversation view) */
  scrollPosition?: number;
}

export interface Attachment {
  id: string;
  type: 'file' | 'image' | 'document';
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  timestamp: Date;
}

export interface ToolResult {
  toolCallId: string;
  output: unknown;
  error?: string;
  timestamp: Date;
}

export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
