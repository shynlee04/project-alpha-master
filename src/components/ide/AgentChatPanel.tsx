/**
 * @fileoverview Agent Chat Panel - AI Chat Interface with Tool Execution
 * @module components/ide/AgentChatPanel
 * 
 * Chat panel component that provides AI agent conversation interface
 * with integrated tool execution, approval flows, and streaming responses.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-R1 - Integrate useAgentChatWithTools to AgentChatPanel
 * @incident INC-2025-12-24-001 - E2E Validation Failure Fix
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { appendConversationMessage, clearConversation, getConversation } from '../../lib/workspace';
import { EnhancedChatInterface, ChatMessage, ToolExecution } from './EnhancedChatInterface';
import { ApprovalOverlay } from '../chat/ApprovalOverlay';
import { useAgentChatWithTools, type PendingApprovalInfo } from '../../lib/agent/hooks/use-agent-chat-with-tools';
import { useAgentSelection } from '@/stores/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

// Map agent provider display names to provider IDs
const PROVIDER_ID_MAP: Record<string, string> = {
    'OpenRouter': 'openrouter',
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
    'Google': 'gemini',
    'Mistral': 'openrouter', // Mistral via OpenRouter
};

/**
 * Props for AgentChatPanel component
 */
interface AgentChatPanelProps {
    /** Project ID for conversation storage */
    projectId: string | null;
    /** Project name for display */
    projectName?: string;
}

/**
 * AgentChatPanel - AI conversation interface with tool execution
 * 
 * Integrates useAgentChatWithTools hook for real TanStack AI streaming
 * instead of mock setTimeout responses.
 * 
 * @story 25-R1 - Replace mock with real hook integration
 */
export function AgentChatPanel({ projectId, projectName = 'Project' }: AgentChatPanelProps) {
    const { t } = useTranslation();

    // Local state for conversation persistence
    const [persistedMessages, setPersistedMessages] = useState<ChatMessage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Get selected agent from Zustand store
    const { activeAgentId } = useAgentSelection();
    const { agents } = useAgents();
    const activeAgent = agents.find(a => a.id === activeAgentId);

    // API key state - fetched from credentialVault
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    // Get provider ID from agent's provider name
    const providerId = useMemo(() => {
        if (!activeAgent?.provider) return 'openrouter';
        return PROVIDER_ID_MAP[activeAgent.provider] || 'openrouter';
    }, [activeAgent?.provider]);

    // Fetch API key when agent or provider changes
    useEffect(() => {
        let isCancelled = false;

        async function fetchApiKey() {
            console.log('[AgentChatPanel] DEBUG START -------------');
            console.log('[AgentChatPanel] 1. Active Agent:', activeAgent?.name, 'Provider:', activeAgent?.provider);
            console.log('[AgentChatPanel] 2. Computed providerId:', providerId);

            try {
                await credentialVault.initialize();
                const storedProviders = await credentialVault.getStoredProviders();
                console.log('[AgentChatPanel] 3. Vault contains keys for:', storedProviders);

                let key = await credentialVault.getCredentials(providerId);
                console.log('[AgentChatPanel] 4. Retrieval attempt for', providerId, 'Result:', key ? `FOUND (${key.length} chars)` : 'MISSING');
                console.log('[AgentChatPanel] DEBUG END ---------------');

                if (!isCancelled) {
                    setApiKey(key);
                    if (!key) {
                        setApiKeyError(`No API key for ${providerId}. Click the settings icon on the agent in the Agents panel to configure it.`);
                    } else {
                        setApiKeyError(null);
                    }
                }
            } catch (err) {
                console.error('[AgentChatPanel] Failed to fetch API key:', err);
                if (!isCancelled) {
                    setApiKeyError('Failed to fetch API key');
                }
            }
        }

        fetchApiKey();

        // Listen for credential updates from AgentConfigDialog
        const handleCredentialsUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail.providerId === providerId) {
                console.log('[AgentChatPanel] Credentials updated event received, refetching...');
                fetchApiKey();
            }
        };

        window.addEventListener('credentials-updated', handleCredentialsUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener('credentials-updated', handleCredentialsUpdate);
        };
    }, [providerId]);

    // Use the real TanStack AI hook with tools
    // Story 25-R1: Replace mock setTimeout with real hook
    const {
        messages: hookMessages,
        rawMessages,
        sendMessage,
        isLoading,
        error,
        toolCalls: _toolCalls, // Unused for now, will use in future story
        toolsAvailable,
        pendingApprovals,
        approveToolCall,
        rejectToolCall,
        modelId,
    } = useAgentChatWithTools({
        // Pass null for tools initially - they will be wired in a future story
        // when FileToolsFacade and TerminalToolsFacade are connected
        fileTools: null,
        terminalTools: null,
        eventBus: null,
        // Pass provider ID, model ID, and API key
        providerId,
        modelId: activeAgent?.model,
        apiKey: apiKey || undefined,
    });

    // Create welcome message
    const createWelcomeMessage = useCallback((): ChatMessage => ({
        id: 'welcome',
        role: 'assistant',
        content: t('agent.welcome_message', { projectName }),
        timestamp: new Date(),
    }), [projectName, t]);


    // Load persisted conversation on mount
    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                if (!projectId) {
                    setPersistedMessages([createWelcomeMessage()]);
                    setIsInitialized(true);
                    return;
                }

                const convo = await getConversation(projectId);
                if (isCancelled) return;

                if (convo && convo.messages.length > 0) {
                    // Map legacy messages to ChatMessage type if needed
                    const mappedMessages = convo.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }));
                    setPersistedMessages(mappedMessages);
                } else {
                    setPersistedMessages([createWelcomeMessage()]);
                }
                setIsInitialized(true);
            } catch {
                if (isCancelled) return;
                setPersistedMessages([createWelcomeMessage()]);
                setIsInitialized(true);
            }
        };

        load();
        return () => { isCancelled = true; };
    }, [projectId, projectName, createWelcomeMessage]);

    // Combine persisted messages with hook messages
    // Hook messages are the live conversation, persisted are historical
    const allMessages = useMemo((): ChatMessage[] => {
        if (!isInitialized) {
            return [createWelcomeMessage()];
        }

        // If no hook messages yet, show persisted messages
        if (hookMessages.length === 0) {
            return persistedMessages.length > 0 ? persistedMessages : [createWelcomeMessage()];
        }

        // Transform hook messages to ChatMessage format
        const transformedMessages: ChatMessage[] = hookMessages.map((msg, index) => ({
            id: `msg_${index}_${Date.now()}`,
            role: msg.role === 'tool' ? 'assistant' : (msg.role as 'user' | 'assistant'),
            content: msg.content,
            timestamp: new Date(),
            // Add tool executions from current tool calls
            toolExecutions: msg.role === 'assistant' ? extractToolExecutions(rawMessages, index) : undefined,
        }));

        // Prepend welcome if no persisted messages
        if (persistedMessages.length === 0) {
            return [createWelcomeMessage(), ...transformedMessages];
        }

        // For now, show hook messages (they include the current conversation)
        return transformedMessages.length > 0 ? transformedMessages : persistedMessages;
    }, [hookMessages, rawMessages, persistedMessages, isInitialized, createWelcomeMessage]);

    // Extract tool executions from raw messages for display
    function extractToolExecutions(msgs: unknown[], currentIndex: number): ToolExecution[] | undefined {
        const executions: ToolExecution[] = [];

        // Look for tool-call parts in the message
        const msg = msgs[currentIndex] as { parts?: unknown[] } | undefined;
        if (!msg?.parts || !Array.isArray(msg.parts)) {
            return undefined;
        }

        for (const part of msg.parts) {
            const p = part as {
                type?: string;
                id?: string;
                name?: string;
                state?: string;
                input?: Record<string, unknown>;
                output?: unknown;
            };

            if (p.type === 'tool-call' && p.name) {
                let status: 'pending' | 'running' | 'success' | 'error' = 'pending';

                switch (p.state) {
                    case 'executing':
                        status = 'running';
                        break;
                    case 'result':
                        status = 'success';
                        break;
                    case 'error':
                        status = 'error';
                        break;
                    case 'approval-requested':
                        status = 'pending';
                        break;
                }

                executions.push({
                    id: p.id || `tool_${executions.length}`,
                    name: p.name,
                    status,
                    input: p.input ? JSON.stringify(p.input) : undefined,
                    output: p.output ? JSON.stringify(p.output) : undefined,
                });
            }
        }

        return executions.length > 0 ? executions : undefined;
    }

    // Handle sending messages - uses real hook now
    const handleSendMessage = useCallback(async (content: string) => {
        // Add user message to local state for immediate feedback
        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        // Persist user message
        if (projectId) {
            await appendConversationMessage(projectId, {
                ...userMessage,
                timestamp: userMessage.timestamp.getTime()
            });
        }

        // Send via TanStack AI hook - this triggers the real API call
        sendMessage(content);
    }, [projectId, sendMessage]);

    // Handle tool approval - Story 25-5 integration
    const handleApprove = useCallback((approval: PendingApprovalInfo) => {
        console.log('[AgentChatPanel] Approving tool call:', approval.toolName);
        approveToolCall(approval.toolCallId);
    }, [approveToolCall]);

    // Handle tool rejection
    const handleReject = useCallback((approval: PendingApprovalInfo) => {
        console.log('[AgentChatPanel] Rejecting tool call:', approval.toolName);
        rejectToolCall(approval.toolCallId, 'User rejected');
    }, [rejectToolCall]);

    // Clear conversation
    const handleClear = useCallback(async () => {
        if (projectId) await clearConversation(projectId);
        setPersistedMessages([createWelcomeMessage()]);
    }, [projectId, createWelcomeMessage]);

    // Get the first pending approval for the overlay (if any)
    const currentApproval = pendingApprovals.length > 0 ? pendingApprovals[0] : null;

    return (
        <div className="flex flex-col h-full bg-surface-dark relative">
            {/* Header */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel">
                        {t('agent.title')}
                    </span>
                    {/* Show connection status */}
                    {toolsAvailable && (
                        <span className="text-[10px] text-green-400 font-pixel">
                            {t('agent.tools_ready', 'TOOLS READY')}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Model indicator */}
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {modelId.split('/').pop()?.substring(0, 20)}
                    </span>
                    <button
                        onClick={handleClear}
                        title={t('agent.clear')}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    >
                        {t('agent.clear')}
                    </button>
                    {/* Debug Button - Temporary for troubleshooting */}
                    <button
                        onClick={async () => {
                            console.log('DEBUG CLICKED');
                            await credentialVault.initialize();
                            const providers = await credentialVault.getStoredProviders();
                            const currentKey = await credentialVault.getCredentials(providerId);

                            const debugInfo = [
                                `Agent: ${activeAgent?.name}`,
                                `Provider (UI): ${activeAgent?.provider}`,
                                `Provider (ID): ${providerId}`,
                                `Vault Providers: ${JSON.stringify(providers)}`,
                                `Has Key for '${providerId}'?: ${!!currentKey}`,
                                `Key Length: ${currentKey?.length || 0}`
                            ].join('\n');

                            alert('DEBUG INFO:\n' + debugInfo);
                        }}
                        className="text-[10px] text-red-500 hover:text-red-400 font-mono px-2"
                    >
                        DEBUG
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive">
                        {error.message || t('agent.error_generic', 'An error occurred')}
                    </span>
                </div>
            )}

            {/* API Key Missing Warning */}
            {apiKeyError && (
                <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-500 font-medium">
                        {t('agent.key_missing', `API Key missing for ${providerId}. Please configure it in the Agents panel.`)}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <EnhancedChatInterface
                    messages={allMessages}
                    onSendMessage={handleSendMessage}
                    isTyping={isLoading}
                />
            </div>

            {/* Approval Overlay - triggered by real pending approvals */}
            {currentApproval && (
                <ApprovalOverlay
                    isOpen={true}
                    onApprove={() => handleApprove(currentApproval)}
                    onReject={() => handleReject(currentApproval)}
                    toolName={currentApproval.toolName}
                    description={currentApproval.description}
                    code={currentApproval.proposedContent}
                    mode="inline"
                    riskLevel={currentApproval.riskLevel}
                />
            )}
        </div>
    );
}
