/**
 * Agent Chat Conversation Manager Hook
 *
 * Manages conversation loading and scroll restoration.
 *
 * @layer Presentation
 * @hook useAgentChatConversationManager
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useThreadsStore } from '@/stores/conversation-threads-store';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/conversation-store';
import { ChatMessage } from '../EnhancedChatInterface';
import { mapHookMessages, mapStoreMessages } from './message-mappers';

interface ConversationManagerProps {
    projectId: string | null;
    activeAgentId: string | undefined;
    hookMessages: any[];
    rawMessages: unknown[];
}

interface ConversationManagerResult {
    isInitialized: boolean;
    scrollRef: React.RefObject<HTMLDivElement>;
    allMessages: ChatMessage[];
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Hook to manage conversation persistence and loading
 */
export function useAgentChatConversationManager({
    projectId,
    activeAgentId,
    hookMessages,
    rawMessages
}: ConversationManagerProps): ConversationManagerResult {
    const [isInitialized, setIsInitialized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        activeConversationId,
        conversations,
        updateScrollPosition,
        createConversation
    } = useConversationStore();

    const createThread = useThreadsStore(state => state.createThread);
    const setActiveThread = useThreadsStore(state => state.setActiveThread);

    // Load persisted conversation on mount
    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                if (!projectId) {
                    setIsInitialized(true);
                    return;
                }

                if (activeConversationId) {
                    setIsInitialized(true);
                    return;
                }

                createConversation(projectId, activeAgentId);
                setIsInitialized(true);
            } catch (err) {
                console.error('[AgentChatPanel] Failed to load threads:', err);
                if (isCancelled) return;
                setIsInitialized(true);
            }
        };

        load();
        return () => { isCancelled = true; };
    }, [projectId, activeConversationId, activeAgentId, createConversation]);

    // Sync scroll position on conversation switch
    useEffect(() => {
        const activeConversation = activeConversationId ? conversations[activeConversationId] : null;
        if (activeConversation?.metadata.scrollPosition && scrollRef.current) {
            scrollRef.current.scrollTop = activeConversation.metadata.scrollPosition;
        }
    }, [activeConversationId, conversations]);

    // Scroll tracker
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (activeConversationId) {
            updateScrollPosition(activeConversationId, e.currentTarget.scrollTop);
        }
    }, [activeConversationId, updateScrollPosition]);

    // Combine persisted messages with hook messages for display
    const allMessages = useMemo((): ChatMessage[] => {
        if (!isInitialized || !activeConversationId) {
            return [];
        }

        const storeMessages = conversations[activeConversationId]?.messages || [];
        const history = mapStoreMessages(storeMessages);
        const currentSessionMessages = mapHookMessages(hookMessages, rawMessages);

        const combined = [...history, ...currentSessionMessages];

        const seen = new Set<string>();
        return combined.filter(msg => {
            if (seen.has(msg.id)) return false;
            if (msg.role === 'assistant' && (!msg.content || msg.content.trim() === '') && !msg.toolExecutions?.length) {
                return false;
            }
            seen.add(msg.id);
            return true;
        });
    }, [activeConversationId, conversations, hookMessages, rawMessages, isInitialized]);

    return { isInitialized, scrollRef, allMessages, handleScroll };
}
