/**
 * @fileoverview Message Search Utilities
 * @module lib/chat/message-search
 *
 * Full-text search across conversation messages with filters.
 */

import type { ThreadMessage } from '@/infrastructure/persistence/stores/conversation/types';

/**
 * Search filter options
 */
export interface MessageSearchFilters {
  /** Search query string */
  query: string;

  /** Filter by date range */
  dateRange?: {
    start: number;
    end: number;
  };

  /** Filter by agent ID */
  agentId?: string;

  /** Filter by message role */
  role?: 'user' | 'assistant' | 'system';

  /** Filter by tags (on conversation) */
  tags?: string[];

  /** Case insensitive search */
  caseSensitive?: boolean;
}

/**
 * Message search result with context
 */
export interface MessageSearchResult {
  /** The message that matched */
  message: ThreadMessage;

  /** Thread ID containing the message */
  threadId: string;

  /** Conversation ID containing the message */
  conversationId: string;

  /** Matched text snippet with highlighted term */
  snippet: string;

  /** Match position in message content */
  matchIndex: number;

  /** Relevance score (0-1) */
  score: number;
}

/**
 * Search messages in a thread
 *
 * @param messages - Messages to search
 * @param filters - Search filters
 * @returns Array of matching messages with metadata
 */
export function searchMessages(
  messages: ThreadMessage[],
  threadId: string,
  conversationId: string,
  filters: MessageSearchFilters
): MessageSearchResult[] {
  const {
    query,
    dateRange,
    agentId,
    role,
    caseSensitive = false,
  } = filters;

  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const results: MessageSearchResult[] = [];

  for (const message of messages) {
    // Apply filters
    if (role && message.role !== role) continue;
    if (agentId && message.agentId !== agentId) continue;
    if (dateRange) {
      const msgTimestamp = typeof message.timestamp === 'string' 
        ? new Date(message.timestamp).getTime() 
        : message.timestamp;
      if (msgTimestamp < dateRange.start || msgTimestamp > dateRange.end) {
        continue;
      }
    }

    // Search in content
    const content = caseSensitive ? message.content : message.content.toLowerCase();
    const matchIndex = content.indexOf(searchQuery);

    if (matchIndex !== -1) {
      // Calculate relevance score
      const score = calculateRelevanceScore(message.content, searchQuery, matchIndex);

      // Generate snippet with context
      const snippet = generateSnippet(message.content, matchIndex, searchQuery.length);

      results.push({
        message,
        threadId,
        conversationId,
        snippet,
        matchIndex,
        score,
      });
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Calculate relevance score for a match
 *
 * @param content - Full message content
 * @param query - Search query
 * @param matchIndex - Index of match in content
 * @returns Relevance score (0-1)
 */
function calculateRelevanceScore(
  content: string,
  query: string,
  matchIndex: number
): number {
  let score = 0.5; // Base score

  // Earlier matches score higher
  const positionScore = 1 - (matchIndex / content.length);
  score += positionScore * 0.3;

  // Exact word matches score higher
  const wordMatchRegex = new RegExp(`\\b${query}\\b`, 'i');
  if (wordMatchRegex.test(content)) {
    score += 0.2;
  }

  return Math.min(score, 1);
}

/**
 * Generate snippet with context around match
 *
 * @param content - Full message content
 * @param matchIndex - Index of match
 * @param matchLength - Length of match
 * @param contextLength - Context characters before/after (default: 50)
 * @returns Snippet string
 */
function generateSnippet(
  content: string,
  matchIndex: number,
  matchLength: number,
  contextLength: number = 50
): string {
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(content.length, matchIndex + matchLength + contextLength);

  let snippet = content.substring(start, end);

  // Add ellipsis if truncated
  if (start > 0) {
    snippet = '...' + snippet;
  }
  if (end < content.length) {
    snippet = snippet + '...';
  }

  return snippet;
}

/**
 * Search all conversations for messages
 *
 * @param conversations - Map of conversation ID to messages
 * @param threadMap - Map of thread ID to conversation ID
 * @param filters - Search filters
 * @returns Array of search results
 */
export function searchAllMessages(
  conversations: Record<string, ThreadMessage[]>,
  threadMap: Record<string, { conversationId: string }>,
  filters: MessageSearchFilters
): MessageSearchResult[] {
  const allResults: MessageSearchResult[] = [];

  for (const [conversationId, messages] of Object.entries(conversations)) {
    // For simplicity, assume first thread = conversation
    // In real implementation, you'd look up thread ID properly
    const threadId = Object.keys(threadMap).find(
      tid => threadMap[tid].conversationId === conversationId
    ) || conversationId;

    const results = searchMessages(messages, threadId, conversationId, filters);
    allResults.push(...results);
  }

  // Sort by score across all conversations
  return allResults.sort((a, b) => b.score - a.score);
}
