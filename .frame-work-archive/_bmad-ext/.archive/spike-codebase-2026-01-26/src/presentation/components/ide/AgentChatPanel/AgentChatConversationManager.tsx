/**
 * Agent Chat Conversation Manager Hook
 *
 * Manages conversation loading and scroll restoration.
 *
 * @layer Presentation
 * @hook useAgentChatConversationManager
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { ChatMessage } from '../EnhancedChatInterface';
import { mapHookMessages, mapStoreMessages } from './message-mappers';

interface ConversationManagerProps {
    projectId: string | null;
    hookMessages: any[];
    rawMessages: unknown[];
}

interface ConversationManagerResult {
    isInitialized: boolean;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    allMessages: ChatMessage[];
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    currentScrollPosition: number;
}

/**
 * Hook to manage conversation persistence and loading
 */
export function useAgentChatConversationManager({
    projectId,
    hookMessages,
    rawMessages
}: ConversationManagerProps): ConversationManagerResult {
    const [isInitialized, setIsInitialized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

    const {
        activeThreadId,
        threads,
    } = useConversationStore();

    // E1-6: Handle scroll events and track position
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        setCurrentScrollPosition(target.scrollTop);
    }, []);

    // Load persisted conversation on mount
    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                if (!projectId) {
                    setIsInitialized(true);
                    return;
                }

                if (activeThreadId) {
                    setIsInitialized(true);
                    return;
                }

                // No active thread - will be created when user sends first message
                setIsInitialized(true);
            } catch (err) {
                console.error('[AgentChatPanel] Failed to load threads:', err);
                if (isCancelled) return;
                setIsInitialized(true);
            }
        };

        load();
        return () => { isCancelled = true; };
    }, [projectId, activeThreadId]);

    // Combine persisted messages with hook messages for display
    const allMessages = useMemo((): ChatMessage[] => {
        if (!isInitialized || !activeThreadId) {
            return [];
        }

        const thread = threads[activeThreadId];
        const storeMessages = thread?.messages || [];
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
    }, [activeThreadId, threads, hookMessages, rawMessages, isInitialized]);

    return { isInitialized, scrollRef, allMessages, handleScroll, currentScrollPosition };
}
