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
