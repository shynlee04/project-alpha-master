import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Bot, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { saveThread, getThreadsForProject } from '../../lib/workspace/threads-store';
import type { ConversationThread, ThreadMessage } from '@/stores/conversation-threads-store';
import { EnhancedChatInterface, ChatMessage, ToolExecution } from './EnhancedChatInterface';
import { ApprovalOverlay } from '../chat/ApprovalOverlay';
import { useAgentChatWithTools, type PendingApprovalInfo } from '../../lib/agent/hooks/use-agent-chat-with-tools';
import { useAgentSelection } from '@/stores/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';
import { getCodingAgentSystemPrompt } from '@/lib/agent/system-prompt';
import { usePromptEnhancementStore } from '@/stores/prompt-enhancement-store';
import { usePromptEnhancer } from '@/lib/agent/hooks/use-prompt-enhancer';

// Map agent provider display names to provider IDs
const PROVIDER_ID_MAP: Record<string, string> = {
    'OpenRouter': 'openrouter',
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
    'Google': 'gemini',
    'Mistral': 'openrouter', // Mistral via OpenRouter
    'OpenAI Compatible': 'openai-compatible', // Custom OpenAI-compatible endpoints
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
    // initialHistory holds messages loaded on mount (or after clear)
    const [initialHistory, setInitialHistory] = useState<ChatMessage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Track the active thread context
    const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);

    // CC-2025-12-26-006: Key for forcing chat hook remount on clear/thread switch
    // Incrementing this causes the chat hook to reset its internal state
    const [chatResetKey, setChatResetKey] = useState(0);

    // Generate stable key combining thread ID and reset key for forced remounts
    const chatInstanceKey = useMemo(() => {
        return `${activeThread?.id || 'no-thread'}-${chatResetKey}`;
    }, [activeThread?.id, chatResetKey]);

    // Prompt Enhancement State
    const { isEnabled: isEnhancementEnabled, toggle: toggleEnhancement } = usePromptEnhancementStore();
    const { enhancePrompt, isEnhancing: isEnhancingPrompt } = usePromptEnhancer();

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
            try {
                await credentialVault.initialize();
                let key = await credentialVault.getCredentials(providerId);

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
                fetchApiKey();
            }
        };

        window.addEventListener('credentials-updated', handleCredentialsUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener('credentials-updated', handleCredentialsUpdate);
        };
    }, [providerId]);

    // Get workspace context for tool facades
    // Story MVP-1: Wire real tool facades to agent
    // CC-2025-12-25-003: Use initialSyncCompleted as dep instead of ref.current (React anti-pattern)
    const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspace();

    // Create tool facades when workspace is ready
    // IMPORTANT: ref.current in deps doesn't trigger re-renders
    // Use initialSyncCompleted state which changes when sync completes and refs are populated
    const fileTools = useMemo(() => {
        const localAdapter = localAdapterRef.current;
        const syncManager = syncManagerRef.current;
        if (localAdapter && syncManager && eventBus) {
            console.log('[AgentChatPanel] fileTools created - workspace ready');
            return createFileToolsFacade(localAdapter, syncManager, eventBus);
        }
        console.log('[AgentChatPanel] fileTools null - waiting for workspace', {
            hasLocalAdapter: !!localAdapter,
            hasSyncManager: !!syncManager,
            hasEventBus: !!eventBus
        });
        return null;
    }, [localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted]);

    const terminalTools = useMemo(() => {
        if (eventBus) {
            return createTerminalToolsFacade(eventBus);
        }
        return null;
    }, [eventBus]);

    // Get system prompt
    const systemPrompt = useMemo(() => {
        return getCodingAgentSystemPrompt(`Project: ${projectName}`);
    }, [projectName]);

    // Use the real TanStack AI hook with tools
    // Story MVP-1: Wire real facades and system prompt
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
        // Wire real tool facades from WorkspaceContext
        fileTools,
        terminalTools,
        eventBus: eventBus || null,
        // System message for coding agent behavior
        systemMessage: systemPrompt,
        // Pass provider ID, model ID, and API key
        providerId,
        modelId: activeAgent?.model,
        apiKey: apiKey || undefined,
        // OpenAI Compatible Provider support
        customBaseURL: activeAgent?.customBaseURL,
        customHeaders: activeAgent?.customHeaders,
        enableTools: activeAgent?.enableNativeTools ?? true,
    });

    // Create welcome message
    const createWelcomeMessage = useCallback((): ChatMessage => ({
        id: 'welcome',
        role: 'assistant',
        content: t('agent.welcome_message', { projectName }),
        timestamp: new Date(),
    }), [projectName, t]);

    // Format hook messages to ChatMessage
    const currentSessionMessages = useMemo((): ChatMessage[] => {
        return hookMessages.map((msg, index) => ({
            id: `msg_${index}_${Date.now()}`,
            role: msg.role === 'tool' ? 'assistant' : (msg.role as 'user' | 'assistant'),
            content: msg.content,
            timestamp: new Date(),
            // Add tool executions from current tool calls
            toolExecutions: msg.role === 'assistant' ? extractToolExecutions(rawMessages, index) : undefined,
        }));
    }, [hookMessages, rawMessages]);

    // Load persisted conversation (Threads) on mount
    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                if (!projectId) {
                    setInitialHistory([createWelcomeMessage()]);
                    setIsInitialized(true);
                    return;
                }

                // Load latest thread
                const threads = await getThreadsForProject(projectId);

                if (isCancelled) return;

                if (threads && threads.length > 0) {
                    const latestThread = threads[0];
                    setActiveThread(latestThread);

                    // Map thread messages to ChatMessage
                    const mappedMessages: ChatMessage[] = latestThread.messages.map(m => ({
                        id: m.id,
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                        timestamp: new Date(m.timestamp),
                        toolExecutions: m.toolCalls?.map(tc => ({
                            id: tc.id,
                            name: tc.name,
                            status: tc.status,
                            input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
                            output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
                        }))
                    }));
                    setInitialHistory(mappedMessages);
                } else {
                    // Create new empty thread structure (don't save yet until first message)
                    const newThreadId = crypto.randomUUID();
                    setActiveThread({
                        id: newThreadId,
                        projectId,
                        title: 'New Conversation',
                        preview: '',
                        messages: [],
                        agentsUsed: [],
                        messageCount: 0,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                    setInitialHistory([createWelcomeMessage()]);
                }
                setIsInitialized(true);
            } catch (err) {
                console.error('[AgentChatPanel] Failed to load threads:', err);
                if (isCancelled) return;
                setInitialHistory([createWelcomeMessage()]);
                setIsInitialized(true);
            }
        };

        load();
        return () => { isCancelled = true; };
    }, [projectId, createWelcomeMessage]);

    // Persist conversation when messages change or loading finishes
    useEffect(() => {
        if (!projectId || !activeThread) return;

        // Skip initial load
        if (!isInitialized) return;

        // Don't save if no new messages and just initial welcome
        const hasNewMessages = currentSessionMessages.length > 0;
        if (!hasNewMessages && initialHistory.length <= 1 && initialHistory[0]?.id === 'welcome') return;

        const persist = async () => {
            // Combine history + current
            // Limit history to filter out welcome message if we have real messages now? 
            // Actually, welcome message is fine to keep or discard. Let's keep it for now.
            const fullHistory = [...initialHistory, ...currentSessionMessages];

            // Generate preview from last message
            const lastMsg = fullHistory[fullHistory.length - 1];
            const preview = lastMsg?.content?.substring(0, 100) || 'New Conversation';
            const title = fullHistory.find(m => m.role === 'user')?.content?.substring(0, 50) || 'New Conversation';

            // Convert back to ThreadMessage format for storage
            const threadMessages: ThreadMessage[] = fullHistory.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp.getTime(),
                agentId: (m.role === 'assistant' && activeAgentId) ? activeAgentId : undefined,
                agentName: m.role === 'assistant' ? activeAgent?.name : undefined,
                agentModel: m.role === 'assistant' ? activeAgent?.model : undefined,
                toolCalls: m.toolExecutions?.map(te => ({
                    id: te.id,
                    name: te.name,
                    status: te.status,
                    input: te.input ? JSON.parse(te.input) : undefined,
                    output: te.output ? JSON.parse(te.output) : undefined,
                }))
            }));

            // Identify used agents
            const agentsUsed = Array.from(new Set(
                threadMessages
                    .filter(m => m.role === 'assistant' && m.agentId)
                    .map(m => m.agentId as string)
            ));

            const updatedThread: ConversationThread = {
                ...activeThread,
                title,
                preview,
                messages: threadMessages,
                messageCount: threadMessages.length,
                agentsUsed,
                updatedAt: Date.now(),
            };

            await saveThread(updatedThread);

            // Update active thread ref in case we need it immediately
            setActiveThread(updatedThread);
        };

        // Save when loading finishes (response complete) or every few seconds if streaming?
        // Simpler: Save when isLoading becomes false (response done) OR when user sends message (immediately)
        // currentSessionMessages updates on every token. We should debounce.
        // But `isLoading` is the best trigger for "turn complete".

        if (!isLoading && currentSessionMessages.length > 0) {
            persist();
        }

    }, [projectId, initialHistory, currentSessionMessages, isLoading, activeAgentId, activeAgent]);

    // Combine persisted messages with hook messages for display
    // CC-2025-12-26-007: Deduplicate messages by ID to prevent duplication bugs
    const allMessages = useMemo((): ChatMessage[] => {
        if (!isInitialized) {
            return [createWelcomeMessage()];
        }

        // Combine history and current session
        const combined = [...initialHistory, ...currentSessionMessages];

        // Deduplicate by message ID to prevent duplication
        const seen = new Set<string>();
        const deduplicated = combined.filter(msg => {
            if (seen.has(msg.id)) {
                return false;
            }
            seen.add(msg.id);
            return true;
        });

        return deduplicated;
    }, [initialHistory, currentSessionMessages, isInitialized, createWelcomeMessage]);

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
        // Prompt Enhancement Logic
        let messageToSend = content;

        if (isEnhancementEnabled && !isEnhancingPrompt) {
            const contextHistory = allMessages.slice(-5).map(m => ({
                role: m.role,
                content: m.content || ''
            }));

            const { enhancedText, wasEnhanced } = await enhancePrompt(content, contextHistory);

            if (wasEnhanced) {
                // Ideally show a toast or indication that it was enhanced
                // But since we override the variable, it just sends the enhanced one.
                // The delay happened during `await enhancePrompt`.
                messageToSend = enhancedText;
            }
        }

        // Send via TanStack AI hook - this triggers the real API call
        sendMessage(messageToSend);
        // Persistence is handled by effect
    }, [sendMessage, isEnhancementEnabled, isEnhancingPrompt, allMessages, enhancePrompt]);

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

    // Handle artifact preview
    const handlePreviewArtifact = useCallback((code: string) => {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.info(t('preview.newTabInfo', 'Opened preview in new tab'));
    }, [t]);

    // Handle artifact save
    const handleSaveArtifact = useCallback(async (code: string, language: string) => {
        const extension = language === 'html' ? '.html' :
            language === 'css' ? '.css' :
                language === 'javascript' || language === 'js' ? '.js' :
                    language === 'typescript' || language === 'ts' ? '.ts' :
                        language === 'json' ? '.json' :
                            language === 'md' || language === 'markdown' ? '.md' : '.txt';

        const suggestedPath = `artifact-${Date.now()}${extension}`;
        const path = window.prompt(t('chat.artifact.savePrompt', 'Enter file path'), suggestedPath);

        if (path) {
            try {
                if (localAdapterRef.current) {
                    await localAdapterRef.current.writeFile(path, code);
                    toast.success(t('chat.codeBlock.saved', 'File saved successfully'));
                } else {
                    toast.error(t('errors.fsNotSupported', 'File System access not available'));
                }
            } catch (err) {
                console.error('Failed to save artifact:', err);
                toast.error(t('errors.generic', 'Failed to save file'));
            }
        }
    }, [localAdapterRef, t]);

    // Clear conversation
    // CC-2025-12-26-008: Fixed clear button by using key-based remounting
    const handleClear = useCallback(async () => {
        if (projectId) {
            const newThreadId = crypto.randomUUID();

            // Create new thread - this will change chatInstanceKey
            setActiveThread({
                id: newThreadId,
                projectId,
                title: 'New Conversation',
                preview: '',
                messages: [],
                agentsUsed: [],
                messageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            // Reset local history to just welcome message
            setInitialHistory([createWelcomeMessage()]);

            // Increment reset key to force useChat hook remount via key change
            // This clears the internal hook state (messages, streaming state, etc.)
            setChatResetKey(prev => prev + 1);

            toast.success(t('agent.cleared', 'Conversation cleared'));
        }
    }, [projectId, createWelcomeMessage, t]);

    // Get the first pending approval for the overlay (if any)
    const currentApproval = pendingApprovals.length > 0 ? pendingApprovals[0] : null;

    return (
        <div className="flex flex-col h-full bg-surface-dark relative">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker">
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
                <div className="flex items-center gap-3">
                    {/* Prompt Enhancement Toggle */}
                    <div className="flex items-center gap-2 border-r border-border-dark pr-3">
                        <Switch
                            id="prompt-enhance"
                            checked={isEnhancementEnabled}
                            onCheckedChange={toggleEnhancement}
                            className="h-4 w-7 data-[state=checked]:bg-primary"
                        />
                        <Label
                            htmlFor="prompt-enhance"
                            className="text-[10px] cursor-pointer text-muted-foreground flex items-center gap-1"
                            title={t('agent.enhance_tooltip')}
                        >
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            {t('agent.enhance_prompt')}
                        </Label>
                    </div>

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
                    {/* This button was removed as per the diff */}
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
            <div className="flex-1 overflow-hidden relative">
                {/* Enhancement Blocking UI */}
                {isEnhancingPrompt && (
                    <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center gap-3 p-4 bg-surface-dark border border-border-dark rounded-lg shadow-xl">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                            <span className="text-sm font-medium text-foreground">{t('agent.enhancing')}</span>
                        </div>
                    </div>
                )}

                <EnhancedChatInterface
                    messages={allMessages}
                    onSendMessage={handleSendMessage}
                    isTyping={isLoading}
                    onPreviewArtifact={handlePreviewArtifact}
                    onSaveArtifact={handleSaveArtifact}
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
