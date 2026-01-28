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
import { maxIterations } from '@tanstack/ai';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createAgentClientTools, type ToolFactoryOptions, type ToolCallInfo } from '../factory';
import { SystemPromptComposer, type LayerContext } from '../prompt-composer';
// Story 40-08: Import ModeClassifier for dynamic mode switching
import { classifyMode } from '../mode-classifier';
import { getAgentModeForClassifier, toComposerFormat } from '../system-prompt';
import type { AgentFileTools, AgentTerminalTools, AgentNoteTools } from '../facades';
import type { WorkspaceEventEmitter } from '../../events/workspace-events';
import { buildMultimodalMessage, type ImageContent } from '../multimodal/message-builder';
// EPIC-40 MM-03: Tool execution persistence to unified chat store
import { useUnifiedChatStore } from '@/infrastructure/persistence/stores/chat';
import { adaptToolsToClientTools } from '@/domain/adapters';

/**
 * Options for useAgentChatWithTools hook
 */
export interface UseAgentChatWithToolsOptions {
    /** Provider ID (default: 'openrouter') */
    providerId?: string;
    /** Model ID (default: free Llama model) */
    modelId?: string;
    /** API key for the provider (required - from credentialVault) */
    apiKey?: string;
    /** Custom API endpoint (default: '/api/chat') */
    endpoint?: string;
    /** Initial system message */
    systemMessage?: string;
    /** File tools facade (required for tool execution) */
    fileTools?: AgentFileTools | null;
    /** Terminal tools facade (required for tool execution) */
    terminalTools?: AgentTerminalTools | null;
    /** Note tools facade (required for note CRUD in Notes workspace) - EPIC-40 */
    noteTools?: AgentNoteTools | null;
    /** Event bus for emitting tool events */
    eventBus?: WorkspaceEventEmitter | null;
    // OpenAI Compatible Provider support
    /** Custom base URL for openai-compatible providers */
    customBaseURL?: string;
    /** Custom headers for openai-compatible providers */
    customHeaders?: Record<string, string>;
    /** Whether to enable native tools (default: true) */
    enableTools?: boolean;
    // Story 40-08: Workspace type for mode classification
    /** Workspace type for mode classification (knowledge, ide, notes, study) */
    workspaceType?: "ide" | "notes" | "knowledge" | "study";
    // EPIC-40 MM-03: Tool execution persistence
    /** Conversation ID for persisting tool calls */
    conversationId?: string | null;
    /** Thread ID for persisting tool calls */
    threadId?: string | null;
}

/**
 * Information about a tool call pending user approval
 * @story 25-5 - Implement Approval Flow
 */
export interface PendingApprovalInfo {
    /** Unique ID for this approval request */
    approvalId: string;
    /** Tool call ID */
    toolCallId: string;
    /** Name of the tool requiring approval */
    toolName: string;
    /** Tool arguments (parsed) */
    toolArgs: Record<string, unknown>;
    /** Risk level for UI display */
    riskLevel: 'low' | 'medium' | 'high';
    /** Description of what the tool will do */
    description: string;
    /** For write_file: proposed new content */
    proposedContent?: string;
}

/**
 * Return type for useAgentChatWithTools hook
 */
export interface UseAgentChatWithToolsReturn {
    /** Current chat messages (typed) */
    messages: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>;
    /** Raw TanStack AI messages with parts */
    rawMessages: unknown[];
    /**
     * Send a new message
     * E2-8: Supports optional images for multimodal chat
     */
    sendMessage: (content: string, images?: ImageContent[]) => void;
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
    /** Tool calls awaiting user approval (Story 25-5) */
    pendingApprovals: PendingApprovalInfo[];
    /** Approve a pending tool call using its approvalId */
    approveToolCall: (approvalId: string, toolCallId?: string) => void;
    /** Reject a pending tool call using its approvalId */
    rejectToolCall: (approvalId: string, reason?: string, toolCallId?: string) => void;
}

// Default values
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'mistralai/devstral-2512:free';
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
        apiKey,
        endpoint = DEFAULT_ENDPOINT,
        // systemMessage,
        fileTools = null,
        terminalTools = null,
        noteTools = null, // EPIC-40: Note tools for Notes workspace
        eventBus = null,
        customBaseURL,
        customHeaders,
        enableTools = true,
        // EPIC-40 MM-03: Conversation context for persistence
        conversationId,
        threadId,
    } = options;

    // EPIC-40 MM-03: Tool execution persistence methods from unified store
    // CRITICAL FIX: Add optional chaining to prevent crash during store hydration
    // Zustand persist middleware returns undefined state before hydration completes
    const addPendingApproval = useUnifiedChatStore((state) => state?.addPendingApproval);
    const approveToolCallInStore = useUnifiedChatStore((state) => state?.approveToolCall);
    const denyToolCallInStore = useUnifiedChatStore((state) => state?.denyToolCall);
    const activeThreadIdInStore = useUnifiedChatStore((state) => state?.activeThreadId);

    // Track tool calls
    const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([]);
    const toolCallsRef = useRef(toolCalls);
    toolCallsRef.current = toolCalls;

    // Track agent activity status for event emission
    const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'executing' | 'error'>('idle');
    const agentStatusRef = useRef(agentStatus);
    agentStatusRef.current = agentStatus;

    // Emit agent activity status changes
    useEffect(() => {
        if (eventBus && agentStatus !== agentStatusRef.current) {
            eventBus.emit('agent:activity:changed', { status: agentStatus });
        }
    }, [eventBus, agentStatus]);

    // Check if tools are available (include noteTools for Notes workspace)
    const toolsAvailable = enableTools && (fileTools !== null || terminalTools !== null || noteTools !== null);

    // Create SystemPromptComposer instance for 5-layer system prompt generation
    const promptComposer = useMemo(() => {
        const composer = SystemPromptComposer.getInstance();
        if (eventBus) {
            composer.setEventBus(eventBus);
        }
        return composer;
    }, [eventBus]);

    // Build LayerContext from IDE state for system prompt generation
    // NOTE: This is a placeholder - actual integration with useIDEStore happens in consuming components
    const layerContext: LayerContext = {
        openFiles: [], // Will be populated from IDE state
        activeFile: undefined,
        projectPackageJson: undefined,
        workspaceReady: false,
    };

    // Create tool factory options
    const toolFactoryOptions = useMemo((): ToolFactoryOptions => ({
        getFileTools: () => fileTools,
        getTerminalTools: () => terminalTools,
        getNoteTools: () => noteTools, // EPIC-40: Note tools for Notes workspace
        getEventBus: () => eventBus,
    }), [fileTools, terminalTools, noteTools, eventBus]);

    // Create client tools using TanStack AI clientTools helper
    const agentTools = useMemo(() => {
        if (!toolsAvailable) {
            return null;
        }
        return createAgentClientTools(toolFactoryOptions);
    }, [toolsAvailable, toolFactoryOptions]);

    // Store latest config in ref to avoid stale closures in dynamic options callback
    const configRef = useRef({ providerId, modelId, apiKey, customBaseURL, customHeaders, enableTools });
    useEffect(() => {
        configRef.current = { providerId, modelId, apiKey, customBaseURL, customHeaders, enableTools };
    }, [providerId, modelId, apiKey, customBaseURL, customHeaders, enableTools]);

    // Create connection with dynamic body data using the supported callback pattern
    // This allows the connection to read the latest apiKey at request time without recreating the adapter
    // IMPORTANT: Messages are passed separately by useChat.connect() - do NOT include in body options!
    // The body options are merged with the messages by the connection adapter.
    const connection = useMemo(
        () => fetchServerSentEvents(
            endpoint,
            () => {
                const current = configRef.current;
                console.log('[useAgentChat] Fetching with config:', {
                    providerId: current.providerId,
                    modelId: current.modelId,
                    hasApiKey: !!current.apiKey,
                    apiKeyLength: current.apiKey?.length,
                    customBaseURL: current.customBaseURL,
                    hasCustomHeaders: !!current.customHeaders && Object.keys(current.customHeaders).length > 0,
                });
                return {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Only include auth/config data - messages are passed by useChat
                    body: {
                        providerId: current.providerId,
                        modelId: current.modelId,
                        apiKey: current.apiKey,
                        // OpenAI Compatible Provider support
                        customBaseURL: current.customBaseURL,
                        customHeaders: current.customHeaders,
                        // Toggle tools support (native function calling)
                        disableTools: !current.enableTools,
                        // System Prompts: Use SystemPromptComposer for 5-layer architecture
                        systemPrompts: promptComposer.compose(layerContext),
                    }
                };
            }
        ),
        [endpoint] // Helper only depends on endpoint, options are dynamic
    );

    // Create chat options using TanStack AI proper pattern
    const chatOptions = useMemo(() => {
        if (agentTools) {
            return {
                connection,
                tools: adaptToolsToClientTools(agentTools.getClientTools()),
                agentLoopStrategy: maxIterations(3), // MVP-3: Enable basic agentic loop (max 3 iterations)
            };
        }
        return {
            connection,
            agentLoopStrategy: maxIterations(3), // MVP-3: Enable basic agentic loop (max 3 iterations)
        };
    }, [connection, agentTools]);

    // Use TanStack AI chat hook with typed options
    const chatResult = useChat(chatOptions);

    // Destructure with fallbacks (API may vary between versions)
    const rawMessages = chatResult.messages ?? [];
    const rawSendMessage = chatResult.sendMessage;
    const rawIsLoading = chatResult.isLoading ?? false;
    const error = chatResult.error ?? null;
    const addToolApprovalResponse = chatResult.addToolApprovalResponse;

    // CRITICAL FIX: Add timeout protection to prevent isLoading from getting stuck
    // If the request hangs for > 30 seconds, force isLoading to false
    const [isLoadingOverride, setIsLoadingOverride] = useState(false);
    const isLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timeout when loading completes
    useEffect(() => {
        if (!rawIsLoading && isLoadingTimeoutRef.current) {
            clearTimeout(isLoadingTimeoutRef.current);
          isLoadingTimeoutRef.current = null;
          setIsLoadingOverride(false);
        }
    }, [rawIsLoading]);

    // Set timeout when loading starts
    useEffect(() => {
        if (rawIsLoading && !isLoadingOverride) {
          isLoadingTimeoutRef.current = setTimeout(() => {
            console.warn('[useAgentChat] Request timed out, forcing isLoading to false');
            setIsLoadingOverride(true); // This will cause isLoading to be false
          }, 30000); // 30 second timeout
          return () => {
            if (isLoadingTimeoutRef.current) {
              clearTimeout(isLoadingTimeoutRef.current);
            }
          };
        }
    }, [rawIsLoading, isLoadingOverride]);

    // Use the override to force isLoading to false after timeout
    const isLoading = isLoadingOverride ? false : rawIsLoading;

    // DEBUG: Log chat state
    useEffect(() => {
        console.log('[useAgentChat] Chat state:', {
            isLoading,
            hasError: !!error,
            error: error?.message,
            rawMessagesCount: rawMessages.length,
        });
    }, [isLoading, error, rawMessages]);

    // Update agent status based on loading state
    useEffect(() => {
        if (isLoading) {
            setAgentStatus('thinking');
        } else if (error) {
            setAgentStatus('error');
            console.error('[useAgentChat] Error:', error);
        } else {
            setAgentStatus('idle');
        }
    }, [isLoading, error]);

    // Transform messages to simple format
    // TanStack AI UIMessage uses 'parts' array, not 'content' string
    // CC-2025-12-26-005: System messages are NOT included in returned messages.
    // They are passed via the API request body, not displayed in UI.
    const messages = useMemo(() => {
        const result: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }> = [];

        // NOTE: Do NOT add systemMessage to result array - it's for API only, not UI display

        for (const msg of rawMessages) {
            const m = msg as { role?: string; parts?: unknown; content?: string };
            const role = (m.role || 'user') as 'user' | 'assistant' | 'system' | 'tool';

            // CC-2025-12-26-005: Filter out system messages from UI display
            if (role === 'system') {
                continue;
            }

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

        // DEBUG: Log message transformation with full details
        if (rawMessages.length > 0) {
            const lastRaw = rawMessages[rawMessages.length - 1];
            console.log('[useAgentChat] Messages transformed:', {
                rawCount: rawMessages.length,
                resultCount: result.length,
                lastRawRole: (lastRaw as { role?: string })?.role,
                lastRawHasParts: !!(lastRaw as { parts?: unknown })?.parts,
                lastRawContent: ((lastRaw as { content?: string })?.content || '').substring(0, 100),
                lastResultContent: result[result.length - 1]?.content?.substring(0, 100),
            });
            // Log full structure of last raw message for debugging
            console.log('[useAgentChat] Last raw message structure:', JSON.stringify(lastRaw, null, 2).substring(0, 500));
        }

        return result;
    }, [rawMessages]);

    // Story 40-08: Classify mode for dynamic agent switching
    const classifyCurrentMode = useCallback((userMessage: string, currentMessages: typeof rawMessages) => {
        // Build conversation history from messages
        const conversationHistory = currentMessages
            .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
            .slice(-10) // Last 10 messages for context
            .map((msg: any) => ({
                role: msg.role,
                content: (msg.content || '') as string,
                mode: undefined,
            }));

        // Classify mode using ModeClassifier
        const classification = classifyMode({
            prompt: userMessage,
            workspaceType: options.workspaceType || 'ide',
            activeDocument: layerContext.activeFile ? {
                path: layerContext.activeFile.path || layerContext.activeFile.name,
                name: layerContext.activeFile.name,
                extension: layerContext.activeFile.name.split('.').pop() || '',
            } : undefined,
            conversationHistory,
        });

        console.log('[useAgentChat] Mode classification:', {
            prompt: userMessage.substring(0, 50),
            classifiedMode: classification.mode,
            confidence: classification.confidence,
            reasoning: classification.reasoning,
        });

        // Map classifier mode to AgentMode
        return getAgentModeForClassifier(classification.mode);
    }, [layerContext.activeFile, options.workspaceType]);

    // Wrap sendMessage for simple string input
    // E2-8: Support multimodal messages with images
    const sendMessage = useCallback((content: string, images?: ImageContent[]) => {
        console.log('[useAgentChat] sendMessage called:', {
            contentLength: content.length,
            content: content.substring(0, 100),
            imageCount: images?.length || 0
        });

        // Story 40-08: Classify mode for this message and update SystemPromptComposer
        const agentMode = classifyCurrentMode(content, rawMessages);
        // Convert to SystemPromptComposer format
        promptComposer.updateConfig({ agentMode: toComposerFormat(agentMode) });

        console.log('[useAgentChat] Mode switched to:', agentMode.id, agentMode.name);

        // If images are provided, use buildMultimodalMessage
        if (images && images.length > 0) {
            const multimodalMessage = buildMultimodalMessage(content, images);
            // TanStack AI accepts CoreMessage format directly
            rawSendMessage(multimodalMessage as any);
        } else {
            // Text-only message (original behavior)
            rawSendMessage(content);
        }
    }, [rawSendMessage, classifyCurrentMode, rawMessages, promptComposer]);

    // Approve tool call - uses { id, approved } object format
    // CRITICAL FIX: Uses approvalId (from part.approval.id), NOT toolCallId
    // EPIC-40 MM-03: Also persist approval to unified store
    const approveToolCall = useCallback((approvalId: string, toolCallId?: string) => {
        if (addToolApprovalResponse) {
            addToolApprovalResponse({ id: approvalId, approved: true });

            // EPIC-40 MM-03: Persist approval to unified store
            // Find the pending approval from TanStack AI messages to get tool details
            const approvalMsg = rawMessages.find((msg: any) => {
                const m = msg as { parts?: unknown[] };
                if (!Array.isArray(m.parts)) return false;
                return m.parts.some((part: any) =>
                    part?.type === 'tool-call' &&
                    part?.state === 'approval-requested' &&
                    part?.approval?.id === approvalId
                );
            });

            if (approvalMsg && conversationId) {
                const effectiveThreadId = threadId || activeThreadIdInStore;
                if (effectiveThreadId) {
                    const parts = (approvalMsg as any).parts as any[];
                    const toolPart = parts.find((p: any) => p?.approval?.id === approvalId);

                    if (toolPart) {
                        // Create or update the approval in unified store
                        // The store handles the tool call status update automatically
                        // CRITICAL FIX: Guard against undefined during hydration
                        approveToolCallInStore?.(approvalId);
                    }
                }
            }

            // Update tool call status and emit event
            setToolCalls((prev) => {
                const updated = prev.map((tc) =>
                    tc.id === toolCallId ? { ...tc, status: 'executing' as const } : tc
                );

                // Emit tool started event
                const toolCall = updated.find(tc => tc.id === toolCallId);
                if (toolCall && eventBus) {
                    eventBus.emit('agent:tool:started', {
                        toolName: toolCall.name,
                        toolCallId: toolCall.id,
                        args: toolCall.args || {},
                    });
                    setAgentStatus('executing');
                }

                return updated;
            });
        }
    }, [addToolApprovalResponse, eventBus, rawMessages, conversationId, threadId, activeThreadIdInStore, approveToolCallInStore]);

    // Reject tool call - uses { id, approved } object format
    // CRITICAL FIX: Uses approvalId (from part.approval.id), NOT toolCallId
    // EPIC-40 MM-03: Also persist denial to unified store
    const rejectToolCall = useCallback((approvalId: string, reason?: string, toolCallId?: string) => {
        if (addToolApprovalResponse) {
            addToolApprovalResponse({ id: approvalId, approved: false });

            // EPIC-40 MM-03: Persist denial to unified store
            if (conversationId) {
                const effectiveThreadId = threadId || activeThreadIdInStore;
                if (effectiveThreadId) {
                    // CRITICAL FIX: Guard against undefined during hydration
                    denyToolCallInStore?.(approvalId, reason || 'User rejected');
                }
            }

            // Update tool call status and emit event
            setToolCalls((prev) => {
                const updated = prev.map((tc) =>
                    tc.id === toolCallId
                        ? { ...tc, status: 'error' as const, error: reason || 'User rejected' }
                        : tc
                );

                // Emit tool failed event
                const toolCall = updated.find(tc => tc.id === toolCallId);
                if (toolCall && eventBus) {
                    eventBus.emit('agent:tool:failed', {
                        toolName: toolCall.name,
                        toolCallId: toolCall.id,
                        error: reason || 'User rejected',
                    });
                }

                return updated;
            });
        }
    }, [addToolApprovalResponse, eventBus, conversationId, threadId, activeThreadIdInStore, denyToolCallInStore]);

    // Extract pending approvals from TanStack AI message parts (Story 25-5)
    const pendingApprovals = useMemo((): PendingApprovalInfo[] => {
        const approvals: PendingApprovalInfo[] = [];

        for (const msg of rawMessages) {
            const m = msg as { parts?: unknown[] };
            if (!Array.isArray(m.parts)) continue;

            for (const part of m.parts) {
                const p = part as {
                    type?: string;
                    id?: string;
                    name?: string;
                    state?: string;
                    approval?: { id: string; needsApproval?: boolean };
                    input?: Record<string, unknown>;
                    arguments?: string;
                };

                // Check if this is a tool-call part in approval-requested state
                if (
                    p.type === 'tool-call' &&
                    p.state === 'approval-requested' &&
                    p.approval?.id
                ) {
                    // Determine risk level based on tool name
                    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
                    if (p.name === 'execute_command') {
                        riskLevel = 'high';
                    } else if (p.name === 'read_file' || p.name === 'list_files') {
                        riskLevel = 'low';
                    }

                    // Parse arguments if needed
                    let toolArgs: Record<string, unknown> = {};
                    if (p.input) {
                        toolArgs = p.input;
                    } else if (p.arguments) {
                        try {
                            toolArgs = JSON.parse(p.arguments);
                        } catch {
                            toolArgs = { raw: p.arguments };
                        }
                    }

                    // Build description
                    let description = `Execute ${p.name}`;
                    if (p.name === 'write_file' && toolArgs.path) {
                        description = `Write to file: ${toolArgs.path}`;
                    } else if (p.name === 'execute_command' && toolArgs.command) {
                        description = `Run command: ${toolArgs.command}`;
                    }

                    approvals.push({
                        approvalId: p.approval.id,
                        toolCallId: p.id || '',
                        toolName: p.name || 'unknown',
                        toolArgs,
                        riskLevel,
                        description,
                        proposedContent: p.name === 'write_file' ? (toolArgs.content as string | undefined) : undefined,
                    });
                }
            }
        }

        return approvals;
    }, [rawMessages]);

    // EPIC-40 MM-03: Sync pending approvals to unified store
    // This ensures tool approvals persist across page refreshes
    // CA-006 FIX: Add deduplication to prevent memory leak
    const prevPendingApprovalsRef = useRef<string[]>([]);
    useEffect(() => {
        // CRITICAL FIX: Skip if store isn't hydrated yet (functions are undefined)
        if (!addPendingApproval || !conversationId) return;

        const effectiveThreadId = threadId || activeThreadIdInStore;
        if (!effectiveThreadId) return;

        // Get current approval IDs
        const currentApprovalIds = pendingApprovals.map(p => p.approvalId);
        const prevApprovalIds = prevPendingApprovalsRef.current;

        // Find new approvals (in current but not in previous)
        const newApprovals = pendingApprovals.filter(p => !prevApprovalIds.includes(p.approvalId));

        // CA-006 FIX: Check for existing approvals in store to prevent duplicates
        // This handles the case where the same approval appears multiple times in the message stream
        const existingApprovals = useUnifiedChatStore.getState().getPendingApprovals();
        const existingApprovalIds = new Set(
            existingApprovals
                .filter(a => a.conversationId === conversationId && a.threadId === effectiveThreadId)
                .map(a => a.id)
        );

        // Add only genuinely new approvals (not already in store)
        for (const approval of newApprovals) {
            if (existingApprovalIds.has(approval.approvalId)) {
                // Skip - already exists in store for this conversation/thread
                continue;
            }

            // We need a messageId for the approval - use a temporary one based on the approval
            // This will be updated when the message is actually added
            const messageId = `msg_${approval.approvalId}`;

            addPendingApproval({
                toolCallId: approval.toolCallId,
                toolName: approval.toolName,
                toolArgs: approval.toolArgs,
                conversationId,
                threadId: effectiveThreadId,
                messageId,
                status: 'pending',
            });
        }

        prevPendingApprovalsRef.current = currentApprovalIds;
    }, [pendingApprovals, conversationId, threadId, activeThreadIdInStore, addPendingApproval]);

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
        pendingApprovals,
        approveToolCall,
        rejectToolCall,
    };
}

export default useAgentChatWithTools;
