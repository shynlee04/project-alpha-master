import { useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';

import { useConversationStore as useThreadsStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { EnhancedChatInterface, ChatMessage } from './EnhancedChatInterface';
import { AutoApproveSettings } from '../chat/AutoApproveSettings';
import { useAgentChatWithTools, type PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAutoApproveStore } from '@/infrastructure/persistence/stores/auto-approve-store';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { getCodingAgentSystemPrompt } from '@/lib/agent/system-prompt';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
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

    // Get selected agent from Zustand store
    const { activeAgentId } = useAgentSelection();
    const { agents } = useAgents();
    const activeAgent = agents.find(a => a.id === activeAgentId);

    // API key management
    const { apiKey, apiKeyError, providerId } = useAgentChatAPIKeyManager({
        agentProviderId: activeAgent?.providerId
    });

    // Get workspace context for tool facades
    const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspace();

    // Create tool facades when workspace is ready
    const { fileTools, terminalTools } = useAgentChatToolFacades({
        localAdapterRef,
        syncManagerRef,
        eventBus,
        initialSyncCompleted
    });

    // Get system prompt
    const systemPrompt = useMemo(() => {
        return getCodingAgentSystemPrompt(`Project: ${projectName}`);
    }, [projectName]);

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
    const { scrollRef, allMessages, handleScroll } = useAgentChatConversationManager({
        projectId,
        hookMessages,
        rawMessages
    });

    // Prompt Enhancement
    const { isEnabled: isEnhancementEnabled, toggle: toggleEnhancement } = usePromptEnhancementStore();
    const { enhancePrompt, isEnhancing: isEnhancingPrompt } = usePromptEnhancer();

    // Auto-Approve Settings
    const { shouldAutoApprove } = useAutoApproveStore();

    // Create welcome message
    const createWelcomeMessage = useCallback((): ChatMessage => ({
        id: 'welcome',
        role: 'assistant',
        content: t('agent.welcome_message', { projectName }),
        timestamp: new Date(),
    }), [projectName, t]);

    // Effect to sync completed messages from hook to store
    const { addMessage, activeConversationId } = useThreadsStore();

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

        sendMessage(messageToSend);
    }, [sendMessage, isEnhancementEnabled, isEnhancingPrompt, allMessages, enhancePrompt]);

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
