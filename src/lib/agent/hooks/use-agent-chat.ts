/**
 * @fileoverview Agent Chat Hook
 * @module lib/agent/hooks/use-agent-chat
 * 
 * React hook wrapping TanStack AI useChat for agent communication.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - TanStack AI Integration Setup
 */

import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';
import { useCallback, useMemo } from 'react';

/**
 * Configuration for the agent chat hook
 */
export interface UseAgentChatOptions {
    /** Provider ID (default: 'openrouter') */
    providerId?: string;
    /** Model ID (default: free Llama model) */
    modelId?: string;
    /** Custom API endpoint (default: '/api/chat') */
    endpoint?: string;
    /** Initial system message */
    systemMessage?: string;
}

/**
 * Message format for chat
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Return type for useAgentChat hook
 */
export interface UseAgentChatReturn {
    /** Current chat messages */
    messages: ChatMessage[];
    /** Send a new message */
    sendMessage: (content: string) => void;
    /** Whether a message is being processed */
    isLoading: boolean;
    /** Error state if any */
    error: Error | null;
    /** Clear all messages */
    clearMessages: () => void;
    /** Provider being used */
    providerId: string;
    /** Model being used */
    modelId: string;
}

// Default values
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
const DEFAULT_ENDPOINT = '/api/chat';

/**
 * Hook for AI agent chat functionality
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = useAgentChat({
 *   modelId: 'google/gemini-2.0-flash-exp:free',
 * });
 * 
 * // Send a message
 * sendMessage('Create a new React component');
 * ```
 */
export function useAgentChat(options: UseAgentChatOptions = {}): UseAgentChatReturn {
    const {
        providerId = DEFAULT_PROVIDER,
        modelId = DEFAULT_MODEL,
        endpoint = DEFAULT_ENDPOINT,
        systemMessage,
    } = options;

    // Create connection adapter for SSE
    const connection = useMemo(
        () => fetchServerSentEvents(endpoint, {
            body: { providerId, modelId },
        }),
        [endpoint, providerId, modelId]
    );

    // Use TanStack AI chat hook
    const {
        messages: rawMessages,
        sendMessage: rawSendMessage,
        isLoading,
        error,
        clearMessages,
    } = useChat({
        connection,
    });

    // Transform messages to our format
    const messages = useMemo((): ChatMessage[] => {
        const result: ChatMessage[] = [];

        // Add system message if provided
        if (systemMessage) {
            result.push({ role: 'system', content: systemMessage });
        }

        // Add all chat messages
        for (const msg of rawMessages) {
            result.push({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: typeof msg.content === 'string' ? msg.content : '',
            });
        }

        return result;
    }, [rawMessages, systemMessage]);

    // Wrap sendMessage to accept simple string
    const sendMessage = useCallback((content: string) => {
        rawSendMessage({ role: 'user', content });
    }, [rawSendMessage]);

    return {
        messages,
        sendMessage,
        isLoading,
        error: error ?? null,
        clearMessages,
        providerId,
        modelId,
    };
}

/**
 * Default export for convenience
 */
export default useAgentChat;
