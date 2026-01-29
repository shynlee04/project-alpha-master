/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/presentation/components/ide/hooks/useAgentChatMessages.ts
 * 
 * This hook is disabled during Phase 1A. Agent chat messages functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

import { useRef, useCallback, useMemo } from 'react';

console.log('[Phase 2] useAgentChatMessages disabled during Phase 1A');

interface ToolExecution {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    input?: string;
    output?: string;
    duration?: number;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolExecutions?: ToolExecution[];
}

export interface UseAgentChatMessagesProps {
    projectId: string | null;
    activeAgentId: string | null;
    projectName: string;
    hookMessages: Array<{ role: string; content: string }>;
    rawMessages: unknown[];
    isLoading: boolean;
    isInitialized: boolean;
    addMessage: (conversationId: string, message: unknown) => void;
    createConversation: (projectId: string, agentId: string | null) => string;
    updateScrollPosition: (conversationId: string, position: number) => void;
}

export interface UseAgentChatMessagesReturn {
    allMessages: ChatMessage[];
    createWelcomeMessage: () => ChatMessage;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    isEnhancementEnabled: boolean;
    toggleEnhancement: () => void;
    isEnhancingPrompt: boolean;
    enhancePrompt: (prompt: string, context: Array<{ role: string; content: string }>) => Promise<{ enhancedText: string; wasEnhanced: boolean }>;
}

export function useAgentChatMessages(_props: UseAgentChatMessagesProps): UseAgentChatMessagesReturn {
    console.log('[Phase 2] useAgentChatMessages feature disabled during Phase 1A');
    const scrollRef = useRef<HTMLDivElement>(null);

    const createWelcomeMessage = useCallback((): ChatMessage => ({
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome! Agent chat is disabled during Phase 1A.',
        timestamp: new Date(),
    }), []);

    const handleScroll = useCallback(() => {}, []);

    const allMessages = useMemo(() => [createWelcomeMessage()], [createWelcomeMessage]);

    return {
        allMessages,
        createWelcomeMessage,
        scrollRef,
        handleScroll,
        isEnhancementEnabled: false,
        toggleEnhancement: () => {},
        isEnhancingPrompt: false,
        enhancePrompt: async () => ({ enhancedText: '', wasEnhanced: false }),
    };
}

export default useAgentChatMessages;
