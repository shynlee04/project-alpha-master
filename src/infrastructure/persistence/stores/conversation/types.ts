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
 */
export interface CombinedConversationState {
    // ========== Conversation Metadata Slice ==========
    conversations: Record<string, import('./conversation-metadata-slice').ConversationMetadataWithId>;
    activeConversationId: string | null;
    activeProjectConversationIds: Record<string, string>;

    // ========== Conversation Metadata Methods ==========
    createConversation: (workspaceType: import('@/core/entities/Conversation').WorkspaceType, projectId: string | null, agentId: string) => string;
    updateConversationMetadata: (id: string, updates: Partial<import('./conversation-metadata-slice').ConversationMetadataWithId>) => void;
    deleteConversation: (id: string) => void;
    setActiveConversation: (id: string) => void;
    getConversation: (id: string) => import('./conversation-metadata-slice').ConversationMetadataWithId | undefined;
    getAllConversations: () => import('./conversation-metadata-slice').ConversationMetadataWithId[];
    getConversationsByWorkspace: (workspaceType: import('@/core/entities/Conversation').WorkspaceType) => import('./conversation-metadata-slice').ConversationMetadataWithId[];
    getConversationsByProject: (projectId: string) => import('./conversation-metadata-slice').ConversationMetadataWithId[];

    // ========== Thread Management Slice (Story CC-1.2) ==========
    threads: Record<string, any>; // TODO: Implement ThreadWithId type in CC-1.2
    activeThreadId: string | null;

    // ========== Message CRUD Slice (Story CC-1.3) ==========
    messages: Record<string, any>; // TODO: Implement MessageWithId type in CC-1.3

    // ========== Placeholder for other slices ==========
    // These will be implemented in subsequent stories
}

