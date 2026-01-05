import { useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { eventBus as crossWorkspaceEventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { DebugSessionData } from '@/infrastructure/events/event-bus';
import { useChatEventBridge } from '@/lib/events/use-chat-event-bridge';
import { useConversationPersistence } from '@/lib/events/use-conversation-persistence';
import { useChatStateSync } from '@/lib/events/use-chat-state-sync';
import type { WorkspaceChangeEvent, ChatStateUpdateEvent } from '@/lib/events';

import { useConversationStore as useThreadsStore, getConversationStoreState } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { EnhancedChatInterface, ChatMessage } from './EnhancedChatInterface';
import { AutoApproveSettings } from '../chat/AutoApproveSettings';
import { useAgentChatWithTools, type PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAutoApproveStore } from '@/infrastructure/persistence/stores/auto-approve-store';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { getCodingAgentSystemPrompt, getNotesAgentSystemPrompt } from '@/lib/agent/system-prompt';
// E1-8: Workspace-specific chat settings
import { useWorkspaceChatSettings } from '@/infrastructure/persistence/stores/chat';
/**
 * @workspace ide-only
 *
 * This component uses the unified workspace context (IDE-only).
 * Do NOT use this component outside of IDE workspace routes.
 */
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { usePromptEnhancementStore } from '@/infrastructure/persistence/stores/prompt-enhancement-store';
import { usePromptEnhancer } from '@/lib/agent/hooks/use-prompt-enhancer';

// Import sub-components
import {
    AgentChatHeader,
    AgentChatStatus,
    useAgentChatAPIKeyManager,
    useAgentChatToolFacades,
    AgentChatApprovals,
    useAgentChatConversationManager,
    AgentChatEnhancingUI
} from './AgentChatPanel/index';

/**
 * Workspace type for chat context
 */
export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

/**
 * Props for AgentChatPanel component
 */
interface AgentChatPanelProps {
    /** Project ID for conversation storage */
    projectId: string | null;
    /** Project name for display */
    projectName?: string;
    /** Workspace type for context-aware system prompt */
    workspaceType?: WorkspaceType;
}

/**
 * AgentChatPanel - AI conversation interface with tool execution
 *
 * Integrates useAgentChatWithTools hook for real TanStack AI streaming
 * instead of mock setTimeout responses.
 *
 * @story 25-R1 - Replace mock with real hook integration
 * @story E1-2 - Workspace-specific chat context
 */
export function AgentChatPanel({
    projectId,
    projectName = 'Project',
    workspaceType = 'ide'
}: AgentChatPanelProps) {
    const { t } = useTranslation();
    const { isMobile, isTablet } = useDeviceType();

    // Get selected agent from Zustand store
    const { activeAgentId } = useAgentSelection();
    const { agents } = useAgents();
    const activeAgent = agents.find(a => a.id === activeAgentId);

    // API key management
    const { apiKey, apiKeyError, providerId } = useAgentChatAPIKeyManager({
        agentProviderId: activeAgent?.providerId
    });

    // Get workspace context for tool facades (IDE workspace only)
    const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspaceSync();

    // Create tool facades when workspace is ready
    // Notes workspace only gets file read tools, not write/terminal
    const { fileTools, terminalTools } = useAgentChatToolFacades({
        localAdapterRef,
        syncManagerRef,
        eventBus,
        initialSyncCompleted,
        workspaceType
    });

    // Get workspace-specific system prompt
    const systemPrompt = useMemo(() => {
        const context = workspaceType === 'notes'
            ? `Notebook: ${projectName}`
            : `Project: ${projectName}`;

        return workspaceType === 'notes'
            ? getNotesAgentSystemPrompt(context)
            : getCodingAgentSystemPrompt(context);
    }, [projectName, workspaceType]);

    // Use the real TanStack AI hook with tools
    const {
        messages: hookMessages,
        rawMessages,
        sendMessage,
        isLoading,
        error,
        toolCalls: _toolCalls,
        toolsAvailable,
        pendingApprovals,
        approveToolCall,
        rejectToolCall,
        modelId,
    } = useAgentChatWithTools({
        fileTools,
        terminalTools,
        eventBus: eventBus || null,
        systemMessage: systemPrompt,
        providerId,
        modelId: activeAgent?.modelId ?? undefined,
        apiKey: apiKey || undefined,
        // NOTE: customBaseURL, customHeaders, enableNativeTools are NOT part of Agent entity
        // They are provider-level configuration, NOT agent-level
        enableTools: true,
    });

    // Conversation management
    const { scrollRef, allMessages, handleScroll, currentScrollPosition } = useAgentChatConversationManager({
        projectId,
        hookMessages,
        rawMessages
    });

    // Prompt Enhancement
    const { isEnabled: isEnhancementEnabled, toggle: toggleEnhancement } = usePromptEnhancementStore();
    const { enhancePrompt, isEnhancing: isEnhancingPrompt } = usePromptEnhancer();

    // Auto-Approve Settings
    const { shouldAutoApprove } = useAutoApproveStore();

    // E1-8: Workspace-specific chat settings (model, temperature, autoScroll)
    const chatSettings = useWorkspaceChatSettings(workspaceType);

    // Create welcome message
    const createWelcomeMessage = useCallback((): ChatMessage => ({
        id: 'welcome',
        role: 'assistant',
        content: t('agent.welcome_message', { projectName }),
        timestamp: new Date(),
    }), [projectName, t]);

    // Effect to sync completed messages from hook to store
    const { addMessage, activeConversationId } = useThreadsStore();

    // E1-5: Chat event bridge - emit events when messages sent, listen for workspace changes
    const { emitMessageSent } = useChatEventBridge({
        workspaceId: workspaceType,
        projectId,
        agentId: activeAgentId || null,
        conversationId: activeConversationId || null,
        onWorkspaceChange: useCallback(async (event: WorkspaceChangeEvent) => {
            console.log('[AgentChatPanel] Workspace changing:', event);
            // E1-6: Save conversation state before workspace switch
            try {
                const store = getConversationStoreState();
                const currentConversation = store.getCurrentConversation();
                if (currentConversation) {
                    // Capture scroll position before saving
                    if (scrollRef.current) {
                        store.setScrollPosition(currentConversation.metadata.id, scrollRef.current.scrollTop);
                    }
                    await store.persistConversation();
                    console.log('[AgentChatPanel] Conversation saved before workspace switch');
                }
            } catch (error) {
                console.error('[AgentChatPanel] Failed to save conversation before switch:', error);
            }
        }, []),
    });

    // E1-6: Conversation persistence - restore on mount, track scroll position
    const { restoreConversation, setScrollPosition, getScrollPosition } = useConversationPersistence({
        workspaceId: workspaceType,
        projectId,
    });

    // E1-7: Chat state sync - emit updates to other workspaces, listen for updates
    const { emitStateUpdate } = useChatStateSync({
        workspaceId: workspaceType,
        projectId,
        conversationId: activeConversationId,
        onStateUpdate: useCallback((update: ChatStateUpdateEvent) => {
            console.log('[AgentChatPanel] Received state update from another workspace:', {
                from: update.workspaceId,
                updateType: update.updateType,
                conversationId: update.conversationId,
            });
            // Refresh conversation to get latest state from IndexedDB
            // The conversation store will emit its own events when updated
            if (update.updateType === 'message_added' || update.updateType === 'message_updated') {
                // Trigger conversation reload by calling persist
                // This ensures the store re-hydrates from IndexedDB with latest data
                const store = getConversationStoreState();
                store.loadConversation?.(update.conversationId);
            }
        }, []),
    });

    // E1-7: Get emitStateUpdate for broadcasting state changes to other workspaces
    const handleEmitStateUpdate = useCallback((
        updateType: 'message_added' | 'message_updated' | 'thread_created' | 'conversation_updated',
        data: { messageId?: string; threadId?: string; messageContent?: string }
    ) => {
        if (!activeConversationId) return;
        emitStateUpdate(updateType, data);
    }, [activeConversationId, emitStateUpdate]);

    // E1-6: Restore conversation when component mounts or workspace/project changes
    useEffect(() => {
        restoreConversation();
    }, [workspaceType, projectId, restoreConversation]);

    useEffect(() => {
        if (!activeConversationId) return;

        if (!isLoading && hookMessages.length > 0) {
            const currentSessionMessages = hookMessages.map((msg, index) => ({
                id: `msg_${index}_${Date.now()}`,
                role: msg.role === 'tool' ? 'assistant' : (msg.role as 'user' | 'assistant'),
                content: msg.content,
                timestamp: new Date(),
                toolExecutions: msg.role === 'assistant' ? [] : undefined,
            }));

            currentSessionMessages.forEach(msg => {
                const record: any = {
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp.getTime(),
                    agentId: activeAgentId || undefined,
                    toolCalls: msg.toolExecutions?.map((te: any) => ({
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
    }, [isLoading, hookMessages, activeConversationId, addMessage, activeAgentId]);

    // E1-6: Restore scroll position when conversation changes
    useEffect(() => {
        if (!activeConversationId || !scrollRef.current) return;

        const savedScrollPosition = getScrollPosition(activeConversationId);
        if (savedScrollPosition > 0) {
            // Small delay to ensure messages are rendered first
            const timeoutId = setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = savedScrollPosition;
                    console.log('[AgentChatPanel] Restored scroll position:', savedScrollPosition);
                }
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [activeConversationId, getScrollPosition]);

    // E1-6: Save scroll position when user scrolls (debounced)
    useEffect(() => {
        if (!activeConversationId || currentScrollPosition === 0) return;

        const timeoutId = setTimeout(() => {
            setScrollPosition(activeConversationId, currentScrollPosition);
        }, 500); // Debounce scroll position saves

        return () => clearTimeout(timeoutId);
    }, [activeConversationId, currentScrollPosition, setScrollPosition]);

    // Handle sending messages with prompt enhancement
    const handleSendMessage = useCallback(async (content: string) => {
        let messageToSend = content;

        if (isEnhancementEnabled && !isEnhancingPrompt) {
            const contextHistory = allMessages.slice(-5).map(m => ({
                role: m.role,
                content: m.content || ''
            }));

            const { enhancedText, wasEnhanced } = await enhancePrompt(content, contextHistory);

            if (wasEnhanced) {
                messageToSend = enhancedText;
            }
        }

        // E1-5: Emit chat message sent event before sending
        emitMessageSent(messageToSend);

        // E1-7: Emit state update to other workspaces before sending
        handleEmitStateUpdate('message_added', {
            messageContent: messageToSend.slice(0, 200) // Truncate for event payload
        });

        sendMessage(messageToSend);
    }, [sendMessage, isEnhancementEnabled, isEnhancingPrompt, allMessages, enhancePrompt, emitMessageSent, handleEmitStateUpdate]);

    // Handle tool approval
    const handleApprove = useCallback((approval: PendingApprovalInfo) => {
        console.log('[AgentChatPanel] Approving tool call:', approval.toolName, 'approvalId:', approval.approvalId);
        approveToolCall(approval.approvalId, approval.toolCallId);
    }, [approveToolCall]);

    // Handle tool rejection
    const handleReject = useCallback((approval: PendingApprovalInfo) => {
        console.log('[AgentChatPanel] Rejecting tool call:', approval.toolName, 'approvalId:', approval.approvalId);
        rejectToolCall(approval.approvalId, 'User rejected', approval.toolCallId);
    }, [rejectToolCall]);

    // Auto-approve effect
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
        if (isMobile || isTablet) {
            toast.error(
                t('errors.ide.openOnMobile.title', 'Desktop Feature'),
                {
                    description: t('errors.ide.openOnMobile.description', 'This feature is available on desktop browsers only.')
                }
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
                    toast.error(t('errors.fs.notSupported.description'), {
                        description: t('errors.fs.notSupported.mobileHint')
                    });
                }
            } catch (err) {
                console.error('Failed to save artifact:', err);
                toast.error(t('errors.generic.unexpected.description'), {
                    description: t('errors.actions.retry')
                });
            }
        }
    }, [isMobile, isTablet, t, localAdapterRef]);

    // Clear conversation
    const createThread = useThreadsStore(state => state.createThread);
    const setActiveThread = useThreadsStore(state => state.setActiveThread);

    const handleClear = useCallback(async () => {
        if (projectId) {
            const threadId = createThread(projectId);
            setActiveThread(threadId);
            toast.success(t('agent.cleared', 'Conversation cleared'));
        }
    }, [projectId, createThread, setActiveThread, t]);

    // P2-6: Capture Debug Session for IDE → Knowledge bridge
    const handleCaptureDebugSession = useCallback(async () => {
        if (!projectId) {
            toast.error('No project open', {
                description: 'Please open a project to capture debug sessions'
            });
            return;
        }

        // Collect debug context from recent messages
        const recentErrors = allMessages
            .filter(m => m.role === 'assistant' && m.content.toLowerCase().includes('error'))
            .slice(-3)
            .map(m => m.content)
            .join('\n\n');

        // Collect terminal output if available
        // TODO: Integrate with terminal output capture
        // const terminalOutput = '';

        // Collect stack traces from error messages
        const stackTrace = recentErrors.includes('Stack trace')
            ? recentErrors.substring(recentErrors.indexOf('Stack trace'))
            : recentErrors;

        // Create debug session data
        const debugData: DebugSessionData = {
            workspaceType: 'ide',
            projectId,
            timestamp: new Date(),
            errorType: 'TypeError', // TODO: Parse from error messages
            errorMessage: recentErrors.substring(0, 200) + '...',
            stackTrace,
            environment: {
                browser: navigator.userAgent,
                os: navigator.platform,
                framework: 'React 18.2.0', // TODO: Detect from package.json
            },
            codeContext: {
                filePath: 'src/components/Component.tsx', // TODO: Get from active file
                lineNumber: 1,
                snippet: '// TODO: Capture actual code snippet',
            },
            attemptedFixes: [],
            finalFix: '',
            symptoms: recentErrors.substring(0, 100),
            tags: ['debug', 'error', 'ide'],
        };

        // Publish event to cross-workspace event bus
        crossWorkspaceEventBus.emit(DomainEventType.IDE_DEBUG_SESSION_CAPTURED, debugData);

        toast.success('Debug session captured', {
            description: 'Creating Debug Note in Knowledge workspace...'
        });

        console.log('[AgentChatPanel] Debug session captured:', debugData);
    }, [projectId, allMessages, t]);

    // Display messages with welcome fallback
    const displayMessages = allMessages.length > 0 ? allMessages : [createWelcomeMessage()];

    return (
        <div className="flex flex-col h-full bg-surface-dark relative">
            {/* Header */}
            <AgentChatHeader
                modelId={modelId}
                toolsAvailable={toolsAvailable}
                isEnhancementEnabled={isEnhancementEnabled}
                onToggleEnhancement={toggleEnhancement}
                onClear={handleClear}
                onCaptureDebugSession={handleCaptureDebugSession}
            />

            {/* Status */}
            <AgentChatStatus
                error={error}
                apiKeyError={apiKeyError}
                providerId={providerId}
            />

            {/* Auto-Approve Settings */}
            <AutoApproveSettings className="mx-2 mt-2" compact />

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {/* Enhancement Blocking UI */}
                <AgentChatEnhancingUI isEnhancing={isEnhancingPrompt} />

                <EnhancedChatInterface
                    messages={displayMessages}
                    onSendMessage={handleSendMessage}
                    isTyping={isLoading}
                    onPreviewArtifact={handlePreviewArtifact}
                    onSaveArtifact={handleSaveArtifact}
                    onScroll={handleScroll}
                    setScrollRef={scrollRef}
                    autoScroll={chatSettings.autoScroll} // E1-8: Workspace-specific auto-scroll
                />
            </div>

            {/* Approvals */}
            <AgentChatApprovals
                pendingApprovals={pendingApprovals}
                onApprove={handleApprove}
                onReject={handleReject}
                className="mx-2"
            />
        </div>
    );
}
