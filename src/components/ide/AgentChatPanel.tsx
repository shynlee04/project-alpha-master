import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Bot, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TruncatedText } from '@/components/ui/truncated-text';
import { useDeviceType } from '@/hooks/useMediaQuery';

import { getThreadsForProject } from '../../lib/workspace/threads-store'; // Keep for migration/fallback
import type { ConversationThread } from '@/stores/conversation-threads-store';
import { EnhancedChatInterface, ChatMessage, ToolExecution } from './EnhancedChatInterface';
import { ApprovalOverlay, BatchApprovalBar } from '../chat';
import { AutoApproveSettings } from '../chat/AutoApproveSettings';
import { useAgentChatWithTools, type PendingApprovalInfo } from '../../lib/agent/hooks/use-agent-chat-with-tools';
import { useAutoApproveStore } from '@/stores/auto-approve-store';
import { useAgentSelection } from '@/stores/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { useConversationStore } from '@/lib/state/conversation-store';
import { getCodingAgentSystemPrompt } from '@/lib/agent/system-prompt';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

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
    const { isMobile, isTablet } = useDeviceType();

    // Local state for conversation persistence
    // initialHistory holds messages loaded on mount (or after clear)
    // Local state for initialization
    const [isInitialized, setIsInitialized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Store State
    const {
        activeConversationId,
        conversations,
        addMessage,
        updateMessage,
        updateScrollPosition,
        createConversation,
        loadConversation
    } = useConversationStore();

    // Derive active conversation from store
    const activeConversation = activeConversationId ? conversations[activeConversationId] : null;

    // CC-2025-12-26-006: Key for forcing chat hook remount on clear/thread switch
    // Incrementing this causes the chat hook to reset its internal state
    const [chatResetKey, setChatResetKey] = useState(0);

    // Generate stable key combining thread ID and reset key for forced remounts
    const chatInstanceKey = useMemo(() => {
        return `${activeConversationId || 'no-thread'}-${chatResetKey}`;
    }, [activeConversationId, chatResetKey]);

    // Prompt Enhancement State
    const { isEnabled: isEnhancementEnabled, toggle: toggleEnhancement } = usePromptEnhancementStore();
    const { enhancePrompt, isEnhancing: isEnhancingPrompt } = usePromptEnhancer();

    // Auto-Approve Settings (toggle-based UX)
    const { shouldAutoApprove } = useAutoApproveStore();

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
                    setIsInitialized(true);
                    return;
                }

                // If we have an active conversation already, use it (hot state)
                if (activeConversationId) {
                    setIsInitialized(true);
                    return;
                }

                // Otherwise, try to load from store persistence (cold state already handled by persist middleware)
                // If middleware hasn't hydrated active ID, we might need to create one.

                // For now, if no active conversation, create one.
                // In future, we could look up the "last active" from a project pref.
                const newId = createConversation(projectId, activeAgentId); // Create empty
                setIsInitialized(true);
            } catch (err) {
                console.error('[AgentChatPanel] Failed to load threads:', err);
                if (isCancelled) return;
                setIsInitialized(true);
            }
        };

        load();
        return () => { isCancelled = true; };
    }, [projectId, activeConversationId]); // Only check on mount/project change

    // Sync activeAgentId with conversation metadata (if needed) and handle scroll restoration
    useEffect(() => {
        if (activeConversation?.metadata.scrollPosition && scrollRef.current) {
            // Restore scroll position
            scrollRef.current.scrollTop = activeConversation.metadata.scrollPosition;
        }
    }, [activeConversation?.metadata.id]); // Run when conversation switches

    // Scroll tracker
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (activeConversationId) {
            // Debounce this in real app, relying on React event pooling/freq for now?
            // Since we use Zustand set, it's fast, but ideally debounce via lodash/custom hook.
            // For now, simple update.
            updateScrollPosition(activeConversationId, e.currentTarget.scrollTop);
        }
    }, [activeConversationId, updateScrollPosition]);

    // Combine persisted messages with hook messages for display
    const allMessages = useMemo((): ChatMessage[] => {
        if (!isInitialized || !activeConversationId) {
            return [createWelcomeMessage()];
        }

        const storeMessages = conversations[activeConversationId]?.messages || [];

        // Map ThreadMessageRecord to ChatMessage
        const history: ChatMessage[] = storeMessages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.timestamp),
            toolExecutions: m.toolCalls?.map(tc => ({
                id: tc.id,
                name: tc.name, // Fixed: use name instead of undefined
                status: tc.status as any,
                input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
                output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
            }))
        }));

        // Combine with current streaming session (if any)
        // Note: useAgentChatWithTools keeps its own state ("hookMessages").
        // Ideally, we sync hook messages TO the store, and only read from store.
        // But hookMessages are "streaming". Updating store 60fps is bad.
        // So we display (Store + HookPending).
        // BUT the store persistence logic we added (addMessage) is called when?
        // We need to call `addMessage` when the hook finishes a message.

        // Let's rely on the store having the "committed" messages, and hook having "streaming" ones.
        // We need to detect when hook adds a "done" message and push it to store.

        // Actually, for simplicity and stability, let's keep the existing pattern:
        // Display = StoreHistory + HookCurrentSession

        const combined = [...history, ...currentSessionMessages];

        const seen = new Set<string>();
        return combined.filter(msg => {
            if (seen.has(msg.id)) return false;
            // Filter out empty assistant messages that aren't pending
            if (msg.role === 'assistant' && (!msg.content || msg.content.trim() === '') && !msg.toolExecutions?.length) {
                // If it's the very last message and loading, keep it (typing indicator)
                // But generally filter empty ones
                return false;
            }
            seen.add(msg.id);
            return true;
        });

    }, [activeConversationId, conversations, currentSessionMessages, isInitialized, createWelcomeMessage]);

    // Effect to sync completed messages from hook to store
    useEffect(() => {
        // Find messages in currentSessionMessages that are NOT in store
        // And push them to store? 
        // Better: Hook does not auto-push. We must intercept.
        // `useAgentChatWithTools` exposes `sendMessage`.
        // The *responses* are in `hookMessages`.

        // We need to sync hookMessages to store when they are "done" (e.g. not last one, or !isLoading).
        // Since `useAgentChatWithTools` manages the conversation state internally, 
        // we might just want to sync the *entire* state when it changes?
        // No, incremental add is better.

        if (!activeConversationId) return;

        // Logic: specific effect to push new messages
        // Taking a shortcut: We replaced the complex local persistence with store.
        // We still need to call `addMessage` when a message is completed.
        // This integration is tricky without refactoring the hook.
        // For now, we will rely on `currentSessionMessages` being displayed, 
        // and ONLY persist when the turn is "Complete" (isLoading -> false).

        if (!isLoading && currentSessionMessages.length > 0) {
            // Appending all session messages to store?
            // Need to be careful not to add duplicates. `store.addMessage` has dedupe!

            currentSessionMessages.forEach(msg => {
                const record: any = {
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp.getTime(),
                    agentId: activeAgentId || undefined,
                    toolCalls: msg.toolExecutions?.map(te => ({
                        id: te.id,
                        name: te.name,
                        status: te.status,
                        input: te.input,
                        output: te.output
                    }))
                };
                addMessage(activeConversationId, record);
            });
        }
    }, [isLoading, currentSessionMessages, activeConversationId, addMessage, activeAgentId]);

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
    // CRITICAL FIX: Use approvalId (not toolCallId) for TanStack AI approval response
    const handleApprove = useCallback((approval: PendingApprovalInfo) => {
        console.log('[AgentChatPanel] Approving tool call:', approval.toolName, 'approvalId:', approval.approvalId);
        approveToolCall(approval.approvalId, approval.toolCallId);
    }, [approveToolCall]);

    // Handle tool rejection
    // CRITICAL FIX: Use approvalId (not toolCallId) for TanStack AI approval response
    const handleReject = useCallback((approval: PendingApprovalInfo) => {
        console.log('[AgentChatPanel] Rejecting tool call:', approval.toolName, 'approvalId:', approval.approvalId);
        rejectToolCall(approval.approvalId, 'User rejected', approval.toolCallId);
    }, [rejectToolCall]);

    // Auto-approve effect: when a pending approval arrives and auto-approve is enabled for that tool
    useEffect(() => {
        if (pendingApprovals.length === 0) return;

        for (const approval of pendingApprovals) {
            if (shouldAutoApprove(approval.toolName)) {
                console.log('[AgentChatPanel] Auto-approving tool call:', approval.toolName);
                approveToolCall(approval.approvalId, approval.toolCallId);
            }
        }
    }, [pendingApprovals, shouldAutoApprove, approveToolCall]);

    // Handle artifact preview
    const handlePreviewArtifact = useCallback((code: string) => {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.info(t('preview.newTabInfo', 'Opened preview in new tab'));
    }, [t]);

    // Handle artifact save
    const handleSaveArtifact = useCallback(async (code: string, language: string) => {
        // Mobile-specific error handling
        if (isMobile || isTablet) {
            toast.error(
                t('errors.ide.openOnMobile.title', 'Desktop Feature'),
                t('errors.ide.openOnMobile.description', 'This feature is available on desktop browsers only. Please access from Chrome, Edge, or Safari on a computer.')
            );
            return;
        }

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
                    toast.error(t('errors.fs.notSupported.description'), t('errors.fs.notSupported.mobileHint'));
                }
            } catch (err) {
                console.error('Failed to save artifact:', err);
                if (isMobile || isTablet) {
                    toast.error(
                        t('errors.ide.openOnMobile.title', 'Desktop Feature'),
                        t('errors.ide.openOnMobile.description', 'This feature is available on desktop browsers only. Please access from Chrome, Edge, or Safari on a computer.')
                    );
                } else {
                    toast.error(t('errors.generic.unexpected.description'), t('errors.actions.retry'));
                }
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

    // Batch approval state
    const [approvalMode, setApprovalMode] = useState<'batch' | 'individual'>('batch');
    const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0);

    // Get the current approval for the overlay
    const currentApproval = pendingApprovals.length > 0
        ? pendingApprovals[approvalMode === 'batch' ? 0 : currentApprovalIndex]
        : null;

    // Handle batch approval actions
    const handleApproveAll = useCallback(() => {
        for (const approval of pendingApprovals) {
            approveToolCall(approval.approvalId, approval.toolCallId);
        }
        setApprovalMode('batch');
        setCurrentApprovalIndex(0);
    }, [pendingApprovals, approveToolCall]);

    const handleRejectAll = useCallback(() => {
        for (const approval of pendingApprovals) {
            rejectToolCall(approval.approvalId, 'Batch rejected by user', approval.toolCallId);
        }
        setApprovalMode('batch');
        setCurrentApprovalIndex(0);
    }, [pendingApprovals, rejectToolCall]);

    const handleReviewEach = useCallback(() => {
        setApprovalMode('individual');
        setCurrentApprovalIndex(0);
    }, []);

    // Handle individual approval in review-each mode
    const handleApproveInReview = useCallback((approval: PendingApprovalInfo) => {
        approveToolCall(approval.approvalId, approval.toolCallId);
        // Move to next or reset to batch mode if done
        if (currentApprovalIndex >= pendingApprovals.length - 1) {
            setApprovalMode('batch');
            setCurrentApprovalIndex(0);
        } else {
            setCurrentApprovalIndex(prev => prev + 1);
        }
    }, [approveToolCall, currentApprovalIndex, pendingApprovals.length]);

    const handleRejectInReview = useCallback((approval: PendingApprovalInfo) => {
        rejectToolCall(approval.approvalId, 'Rejected by user', approval.toolCallId);
        // Move to next or reset to batch mode if done
        if (currentApprovalIndex >= pendingApprovals.length - 1) {
            setApprovalMode('batch');
            setCurrentApprovalIndex(0);
        } else {
            setCurrentApprovalIndex(prev => prev + 1);
        }
    }, [rejectToolCall, currentApprovalIndex, pendingApprovals.length]);

    // Reset approval mode when pending approvals change
    useEffect(() => {
        if (pendingApprovals.length === 0) {
            setApprovalMode('batch');
            setCurrentApprovalIndex(0);
        }
    }, [pendingApprovals.length]);

    return (
        <div className="flex flex-col h-full bg-surface-dark relative">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 flex items-center justify-center border border-primary/30 flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <TruncatedText
                        text={t('agent.title')}
                        className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel max-w-[80px]"
                    />
                    {/* Show connection status */}
                    {toolsAvailable && (
                        <TruncatedText
                            text={t('agent.tools_ready', 'TOOLS READY')}
                            className="text-[10px] text-green-400 font-pixel max-w-[80px]"
                        />
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
                    <TruncatedText
                        text={modelId.split('/').pop()?.substring(0, 20) || ''}
                        className="text-[10px] text-muted-foreground font-mono max-w-[100px]"
                    />
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
                        {error.message || t('errors.agent.toolExecutionFailed.description', 'Agent tool execution failed. Please try again.')}
                    </span>
                </div>
            )}

            {/* API Key Missing Warning */}
            {apiKeyError && (
                <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <TruncatedText
                        text={t('agent.key_missing', `API Key missing for ${providerId}. Please configure it in the Agents panel.`)}
                        className="text-xs text-yellow-500 font-medium"
                    />
                </div>
            )}

            {/* Auto-Approve Settings (toggle-based UX like Roo Code) */}
            <AutoApproveSettings className="mx-2 mt-2" compact />

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
                    onScroll={handleScroll}
                    setScrollRef={scrollRef}
                />
            </div>

            {/* Batch Approval Bar - shown when multiple approvals pending */}
            {pendingApprovals.length > 1 && (
                <BatchApprovalBar
                    pendingApprovals={pendingApprovals}
                    onApproveAll={handleApproveAll}
                    onRejectAll={handleRejectAll}
                    onReviewEach={handleReviewEach}
                    mode={approvalMode}
                    currentIndex={currentApprovalIndex}
                    className="mx-2"
                />
            )}

            {/* Approval Overlay - triggered by real pending approvals */}
            {currentApproval && (approvalMode === 'individual' || pendingApprovals.length === 1) && (
                <ApprovalOverlay
                    isOpen={true}
                    onApprove={() => approvalMode === 'individual'
                        ? handleApproveInReview(currentApproval)
                        : handleApprove(currentApproval)
                    }
                    onReject={() => approvalMode === 'individual'
                        ? handleRejectInReview(currentApproval)
                        : handleReject(currentApproval)
                    }
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
