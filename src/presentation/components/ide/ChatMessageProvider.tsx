/**
 * ChatMessageProvider Component
 * Message formatting, persistence, and display management
 * Max 120 lines
 */

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../EnhancedChatInterface';
import { useConversationStore } from '@/lib/state/conversation-store';
import type { CoreMessage } from '@tanstack/react-loaders';

interface ChatMessageProviderProps {
  projectId: string | null;
  projectName: string;
  activeAgentId: string | null;
  hookMessages: CoreMessage[];
  rawMessages: CoreMessage[];
  isInitialized: boolean;
}

interface UseChatMessagesResult {
  allMessages: ChatMessage[];
  createWelcomeMessage: () => ChatMessage;
  updateScrollPosition: (conversationId: string, position: number) => void;
}

export function useChatMessages({
  projectId,
  projectName,
  activeAgentId,
  hookMessages,
  rawMessages,
  isInitialized
}: ChatMessageProviderProps): UseChatMessagesResult {
  const { t } = useTranslation();

  const {
    activeConversationId,
    conversations,
    updateScrollPosition
  } = useConversationStore();

  // Extract tool executions from raw messages
  const extractToolExecutions = useCallback((msgIndex: number) => {
    const rawMsg = rawMessages[msgIndex];
    if (!rawMsg || !rawMsg.toolCalls) return undefined;

    return rawMsg.toolCalls.map(tc => ({
      toolName: tc.toolName,
      arguments: JSON.stringify(tc.args),
      result: tc.result || undefined,
      status: tc.result ? 'complete' : 'pending' as const,
      timestamp: new Date()
    }));
  }, [rawMessages]);

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
      toolExecutions: msg.role === 'assistant' ? extractToolExecutions(index) : undefined,
    }));
  }, [hookMessages, extractToolExecutions]);

  // Combine persisted messages with hook messages for display
  const allMessages = useMemo((): ChatMessage[] => {
    if (!isInitialized || !activeConversationId) {
      return [createWelcomeMessage()];
    }

    const storeMessages = conversations[activeConversationId]?.messages || [];

    // Map ThreadMessageRecord to ChatMessage
    const history: ChatMessage[] = storeMessages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp),
      // Add tool executions from metadata if available
      toolExecutions: m.toolCalls ? m.toolCalls.map(tc => ({
        toolName: tc.toolName,
        arguments: JSON.stringify(tc.arguments),
        result: tc.result ? JSON.stringify(tc.result) : undefined,
        status: 'complete' as const,
        timestamp: new Date(tc.timestamp)
      })) : undefined
    }));

    return [...history, ...currentSessionMessages];
  }, [isInitialized, activeConversationId, conversations, currentSessionMessages, createWelcomeMessage]);

  return {
    allMessages,
    createWelcomeMessage,
    updateScrollPosition
  };
}
