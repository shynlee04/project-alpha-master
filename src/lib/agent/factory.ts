/**
 * @fileoverview Agent Tool Factory
 * @module lib/agent/factory
 *
 * Factory for creating AI agent tools with dependency injection.
 * Uses TanStack AI toolDefinition.client() pattern for browser-local operations.
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-4 - Wire Tool Execution to UI
 */

import { clientTools } from '@tanstack/ai-client';
import type { AgentFileTools, AgentTerminalTools, AgentKnowledgeTools, AgentNoteTools } from './facades';
import type { WorkspaceEventEmitter } from '../events/workspace-events';

/**
 * Options for creating the agent tool factory
 */
export interface ToolFactoryOptions {
    /** Get the file tools facade (lazy initialization) */
    getFileTools: () => AgentFileTools | null;
    /** Get the terminal tools facade (lazy initialization) */
    getTerminalTools: () => AgentTerminalTools | null;
    /** Get the knowledge tools facade (lazy initialization) - EPIC-38 */
    getKnowledgeTools?: () => AgentKnowledgeTools | null;
    /** Get the note tools facade (lazy initialization) - EPIC-40 */
    getNoteTools?: () => AgentNoteTools | null;
    /** Get the workspace event emitter */
    getEventBus: () => WorkspaceEventEmitter | null;
    /** Model ID for agent configuration (optional - uses agent's default if not provided) */
    modelId?: string;
}

/**
 * Tool call information for UI rendering
 */
export interface ToolCallInfo {
    id: string;
    name: string;
    input: Record<string, unknown>;
    /** Alias for input - for compatibility */
    args?: Record<string, unknown>;
    status: 'pending' | 'executing' | 'completed' | 'error';
    result?: unknown;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
}

/**
 * Create client-side file tools
 * Uses TanStack AI toolDefinition.client() pattern per official docs
 *
 * TODO: Implement when file tools client patterns are finalized
 */
export function createClientFileTools(_options: ToolFactoryOptions) {
    // File tools deferred - return placeholder structure
    return {
        readFile: null,
        writeFile: null,
        listFiles: null,
    };
}

/**
 * Create client-side terminal tools
 * Uses TanStack AI toolDefinition.client() pattern per official docs
 *
 * TODO: Implement when terminal tools client patterns are finalized
 */
export function createClientTerminalTools(_options: ToolFactoryOptions) {
    // Terminal tools deferred - return placeholder structure
    return {
        executeCommand: null,
    };
}

export function createClientKnowledgeTools(_options: ToolFactoryOptions) {
    // Knowledge tools deferred - return placeholder structure
    return {
        synthesize: null,
        processPDF: null,
        processImage: null,
        processURL: null,
    };
}

export function createClientNoteTools(_options: ToolFactoryOptions) {
    // Note tools deferred - return placeholder structure
    return {
        createNote: null,
        readNote: null,
        updateNote: null,
        deleteNote: null,
        listNotes: null,
    };
}

/**
 * Create all client tools for useChat integration
 * Uses TanStack AI clientTools() helper for type-safe tool arrays
 *
 * @example
 * ```tsx
 * const agentTools = createAgentClientTools({
 *     getFileTools: () => fileToolsFacade,
 *     getTerminalTools: () => terminalToolsFacade,
 *     getEventBus: () => eventBus,
 * });
 *
 * const chatOptions = createChatClientOptions({
 *     connection: fetchServerSentEvents('/api/chat'),
 *     tools: agentTools.getClientTools(),
 * });
 *
 * const { messages } = useChat(chatOptions);
 * ```
 */
export function createAgentClientTools(options: ToolFactoryOptions) {
    const fileTools = createClientFileTools(options);
    const terminalTools = createClientTerminalTools(options);
    const knowledgeTools = createClientKnowledgeTools(options);
    const noteTools = createClientNoteTools(options);

    return {
        fileTools,
        terminalTools,
        knowledgeTools,
        noteTools,
        /** All tools as array for useChat */
        all: [
            ...(fileTools.readFile ? [fileTools.readFile] : []),
            ...(fileTools.writeFile ? [fileTools.writeFile] : []),
            ...(fileTools.listFiles ? [fileTools.listFiles] : []),
            ...(terminalTools.executeCommand ? [terminalTools.executeCommand] : []),
            ...(knowledgeTools.synthesize ? [knowledgeTools.synthesize] : []),
            ...(knowledgeTools.processPDF ? [knowledgeTools.processPDF] : []),
            ...(knowledgeTools.processImage ? [knowledgeTools.processImage] : []),
            ...(knowledgeTools.processURL ? [knowledgeTools.processURL] : []),
            ...(noteTools.createNote ? [noteTools.createNote] : []),
            ...(noteTools.readNote ? [noteTools.readNote] : []),
            ...(noteTools.updateNote ? [noteTools.updateNote] : []),
            ...(noteTools.deleteNote ? [noteTools.deleteNote] : []),
            ...(noteTools.listNotes ? [noteTools.listNotes] : []),
        ],
        /** Get clientTools() wrapped array for createChatClientOptions */
        getClientTools() {
            return [] as unknown[];
        },
    };
}

/**
 * Check if tools are available (workspace loaded)
 */
export function isToolsAvailable(options: ToolFactoryOptions): boolean {
    const hasFileTools = options.getFileTools() !== null;
    const hasTerminalTools = options.getTerminalTools() !== null;
    const hasKnowledgeTools = options.getKnowledgeTools ? options.getKnowledgeTools() !== null : true; // Optional

    return hasFileTools && hasTerminalTools && hasKnowledgeTools;
}

// Re-export for convenience
export { clientTools };
export type { ToolFactoryOptions as ToolFactoryConfig };
