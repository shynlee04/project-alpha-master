/**
 * @fileoverview useAgentChatMessages Hook
 * @module components/ide/hooks/useAgentChatMessages
 * @governance EPIC-31
 * @ai-observable true
 *
 * Custom hook for managing messages in AgentChatPanel.
 * Handles message formatting, persistence, and synchronization between hook and store.
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage, ToolExecution } from '../EnhancedChatInterface';
import { useConversationStore } from '@/lib/state/conversation-store';
import { usePromptEnhancementStore } from '@/stores/prompt-enhancement-store';
import { usePromptEnhancer } from '@/lib/agent/hooks/use-prompt-enhancer';

export interface UseAgentChatMessagesProps {
    /** Current project ID */
    projectId: string | null;
    /** Active agent ID */
    activeAgentId: string | null;
    /** Project name */
    projectName: string;
    /** Messages from the chat hook */
    hookMessages: Array<{ role: string; content: string }>;
    /** Raw messages from the chat hook (for tool extraction) */
    rawMessages: unknown[];
    /** Whether the hook is loading */
    isLoading: boolean;
    /** Whether initialization is complete */
    isInitialized: boolean;
    /** Function to add message to store */
    addMessage: (conversationId: string, message: any) => void;
    /** Function to create a new conversation */
    createConversation: (projectId: string, agentId: string | null) => string;
    /** Function to update scroll position */
    updateScrollPosition: (conversationId: string, position: number) => void;
}

export interface UseAgentChatMessagesReturn {
    /** All combined messages for display */
    allMessages: ChatMessage[];
    /** Function to create welcome message */
    createWelcomeMessage: () => ChatMessage;
    /** Scroll ref for tracking scroll position */
    scrollRef: React.RefObject<HTMLDivElement | null>;
    /** Handle scroll event */
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    /** Whether prompt enhancement is enabled */
    isEnhancementEnabled: boolean;
    /** Toggle prompt enhancement */
    toggleEnhancement: () => void;
    /** Whether prompt is currently enhancing */
    isEnhancingPrompt: boolean;
    /** Enhance prompt */
    enhancePrompt: (prompt: string, context: Array<{ role: string; content: string }>) => Promise<{ enhancedText: string; wasEnhanced: boolean }>;
}

/**
 * Extract tool executions from raw messages for display
 */
function extractToolExecutions(msgs: unknown[], currentIndex: number): ToolExecution[] | undefined {
    const executions: ToolExecution[] = [];

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

/**
 * Hook for managing messages in AgentChatPanel
 */
export function useAgentChatMessages({
    activeAgentId,
    projectName,
    hookMessages,
    rawMessages,
    isLoading,
    isInitialized,
    addMessage,
    updateScrollPosition,
}: UseAgentChatMessagesProps): UseAgentChatMessagesReturn {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Store state
    const { activeConversationId, conversations } = useConversationStore();
    const activeConversation = activeConversationId ? conversations[activeConversationId] : null;

    // Prompt Enhancement State
    const { isEnabled: isEnhancementEnabled, toggle: toggleEnhancement } = usePromptEnhancementStore();
    const { enhancePrompt, isEnhancing: isEnhancingPrompt } = usePromptEnhancer();

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
            toolExecutions: msg.role === 'assistant' ? extractToolExecutions(rawMessages, index) : undefined,
        }));
    }, [hookMessages, rawMessages]);

    // Scroll tracker
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (activeConversationId) {
            updateScrollPosition(activeConversationId, e.currentTarget.scrollTop);
        }
    }, [activeConversationId, updateScrollPosition]);

    // Restore scroll position when conversation switches
    useEffect(() => {
        if (activeConversation?.metadata.scrollPosition && scrollRef.current) {
            scrollRef.current.scrollTop = activeConversation.metadata.scrollPosition;
        }
    }, [activeConversation?.metadata.id]);

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
                name: tc.name,
                status: tc.status as any,
                input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
                output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
            }))
        }));

        // Combine with current streaming session
        const combined = [...history, ...currentSessionMessages];

        const seen = new Set<string>();
        return combined.filter(msg => {
            if (seen.has(msg.id)) return false;
            // Filter out empty assistant messages that aren't pending
            if (msg.role === 'assistant' && (!msg.content || msg.content.trim() === '') && !msg.toolExecutions?.length) {
                return false;
            }
            seen.add(msg.id);
            return true;
        });
    }, [activeConversationId, conversations, currentSessionMessages, isInitialized, createWelcomeMessage]);

    // Effect to sync completed messages from hook to store
    useEffect(() => {
        if (!activeConversationId) return;
        if (!isLoading && currentSessionMessages.length > 0) {
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

    return {
        allMessages,
        createWelcomeMessage,
        scrollRef,
        handleScroll,
        isEnhancementEnabled,
        toggleEnhancement,
        isEnhancingPrompt,
        enhancePrompt,
    };
}
