/**
 * @fileoverview Enhanced Agent Chat Hook with Tools
 * @module lib/agent/hooks/use-agent-chat-with-tools
 * 
 * Extended useAgentChat hook that integrates client-side tools,
 * tracks tool call state, and provides approval functions.
 * 
 * Uses TanStack AI createChatClientOptions for type-safe chat configuration.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-4 - Wire Tool Execution to UI
 */

import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';
import { createChatClientOptions } from '@tanstack/ai-client';
import { useCallback, useMemo, useState, useRef } from 'react';
import { createAgentClientTools, type ToolFactoryOptions, type ToolCallInfo } from '../factory';
import type { AgentFileTools, AgentTerminalTools } from '../facades';
import type { WorkspaceEventEmitter } from '../../events/workspace-events';

/**
 * Options for useAgentChatWithTools hook
 */
export interface UseAgentChatWithToolsOptions {
    /** Provider ID (default: 'openrouter') */
    providerId?: string;
    /** Model ID (default: free Llama model) */
    modelId?: string;
    /** Custom API endpoint (default: '/api/chat') */
    endpoint?: string;
    /** Initial system message */
    systemMessage?: string;
    /** File tools facade (required for tool execution) */
    fileTools?: AgentFileTools | null;
    /** Terminal tools facade (required for tool execution) */
    terminalTools?: AgentTerminalTools | null;
    /** Event bus for emitting tool events */
    eventBus?: WorkspaceEventEmitter | null;
}

/**
 * Return type for useAgentChatWithTools hook
 */
export interface UseAgentChatWithToolsReturn {
    /** Current chat messages (typed) */
    messages: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>;
    /** Raw TanStack AI messages with parts */
    rawMessages: unknown[];
    /** Send a new message */
    sendMessage: (content: string) => void;
    /** Whether a message is being processed */
    isLoading: boolean;
    /** Error state if any */
    error: Error | null;
    /** Provider being used */
    providerId: string;
    /** Model being used */
    modelId: string;
    /** Active tool calls */
    toolCalls: ToolCallInfo[];
    /** Tools available status */
    toolsAvailable: boolean;
    /** Approve a pending tool call (for needsApproval tools) */
    approveToolCall: (toolCallId: string) => void;
    /** Reject a pending tool call */
    rejectToolCall: (toolCallId: string) => void;
}

// Default values
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
const DEFAULT_ENDPOINT = '/api/chat';

/**
 * Extract text content from TanStack AI UIMessage parts
 */
function extractMessageContent(parts: unknown): string {
    if (!Array.isArray(parts)) {
        return '';
    }

    const textParts = parts
        .filter((part: unknown) => {
            const p = part as { type?: string };
            return p.type === 'text';
        })
        .map((part: unknown) => {
            const p = part as { content?: string };
            return p.content || '';
        });

    return textParts.join('');
}

/**
 * Enhanced hook for AI agent chat with integrated tool execution
 * 
 * Uses TanStack AI createChatClientOptions for type-safe configuration
 * and clientTools for properly typed tool arrays.
 * 
 * @example
 * ```tsx
 * const { syncManagerRef, eventBus } = useWorkspace();
 * const fileTools = useMemo(() => 
 *     createFileToolsFacade(localFSAdapter, syncManagerRef.current, eventBus),
 *     [localFSAdapter, syncManagerRef, eventBus]
 * );
 * 
 * const {
 *     messages,
 *     sendMessage,
 *     toolCalls,
 *     toolsAvailable,
 * } = useAgentChatWithTools({
 *     fileTools,
 *     terminalTools,
 *     eventBus,
 * });
 * ```
 */
export function useAgentChatWithTools(
    options: UseAgentChatWithToolsOptions = {}
): UseAgentChatWithToolsReturn {
    const {
        providerId = DEFAULT_PROVIDER,
        modelId = DEFAULT_MODEL,
        endpoint = DEFAULT_ENDPOINT,
        systemMessage,
        fileTools = null,
        terminalTools = null,
        eventBus = null,
    } = options;

    // Track tool calls
    const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([]);
    const toolCallsRef = useRef(toolCalls);
    toolCallsRef.current = toolCalls;

    // Check if tools are available
    const toolsAvailable = fileTools !== null || terminalTools !== null;

    // Create tool factory options
    const toolFactoryOptions = useMemo((): ToolFactoryOptions => ({
        getFileTools: () => fileTools,
        getTerminalTools: () => terminalTools,
        getEventBus: () => eventBus,
    }), [fileTools, terminalTools, eventBus]);

    // Create client tools using TanStack AI clientTools helper
    const agentTools = useMemo(() => {
        if (!toolsAvailable) {
            return null;
        }
        return createAgentClientTools(toolFactoryOptions);
    }, [toolsAvailable, toolFactoryOptions]);

    // Create connection with body data
    const connection = useMemo(
        () => fetchServerSentEvents(endpoint, {
            body: { providerId, modelId },
        }),
        [endpoint, providerId, modelId]
    );

    // Create chat options using TanStack AI createChatClientOptions
    const chatOptions = useMemo(() => {
        if (agentTools) {
            return createChatClientOptions({
                connection,
                tools: agentTools.getClientTools(),
            });
        }
        return { connection };
    }, [connection, agentTools]);

    // Use TanStack AI chat hook with typed options
    const chatResult = useChat(chatOptions);

    // Destructure with fallbacks (API may vary between versions)
    const rawMessages = chatResult.messages ?? [];
    const rawSendMessage = chatResult.sendMessage;
    const isLoading = chatResult.isLoading ?? false;
    const error = chatResult.error ?? null;
    const addToolApprovalResponse = chatResult.addToolApprovalResponse;

    // Transform messages to simple format
    // TanStack AI UIMessage uses 'parts' array, not 'content' string
    const messages = useMemo(() => {
        const result: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }> = [];

        if (systemMessage) {
            result.push({ role: 'system', content: systemMessage });
        }

        for (const msg of rawMessages) {
            const m = msg as { role?: string; parts?: unknown; content?: string };
            const role = (m.role || 'user') as 'user' | 'assistant' | 'system' | 'tool';

            // Extract content from parts (v0.2.0 format) or fallback to content string
            let content = '';
            if (m.parts) {
                content = extractMessageContent(m.parts);
            } else if (typeof m.content === 'string') {
                content = m.content;
            }

            if (content || role !== 'tool') {
                result.push({ role, content });
            }
        }

        return result;
    }, [rawMessages, systemMessage]);

    // Wrap sendMessage for simple string input
    const sendMessage = useCallback((content: string) => {
        rawSendMessage(content);
    }, [rawSendMessage]);

    // Approve tool call - uses { id, approved } object format
    const approveToolCall = useCallback((toolCallId: string) => {
        if (addToolApprovalResponse) {
            addToolApprovalResponse({ id: toolCallId, approved: true });

            // Update tool call status
            setToolCalls((prev) =>
                prev.map((tc) =>
                    tc.id === toolCallId ? { ...tc, status: 'executing' as const } : tc
                )
            );
        }
    }, [addToolApprovalResponse]);

    // Reject tool call - uses { id, approved } object format
    const rejectToolCall = useCallback((toolCallId: string) => {
        if (addToolApprovalResponse) {
            addToolApprovalResponse({ id: toolCallId, approved: false });

            // Update tool call status
            setToolCalls((prev) =>
                prev.map((tc) =>
                    tc.id === toolCallId
                        ? { ...tc, status: 'error' as const, error: 'User rejected' }
                        : tc
                )
            );
        }
    }, [addToolApprovalResponse]);

    return {
        messages,
        rawMessages,
        sendMessage,
        isLoading,
        error: error ?? null,
        providerId,
        modelId,
        toolCalls,
        toolsAvailable,
        approveToolCall,
        rejectToolCall,
    };
}

export default useAgentChatWithTools;
