/**
 * Context Window Manager
 *
 * Ralph Loop Cycle 5: Cascade Flow Support
 *
 * Manages context window pruning for long conversations.
 * Implements three compression strategies:
 * - drop_oldest: Remove oldest messages
 * - summarize: Summarize old messages (placeholder for LLM summarization)
 * - truncate: Truncate message content
 *
 * @module lib/chat/context-window-manager
 */

import type { ThreadMessage, ContextWindowConfig } from '@/infrastructure/persistence/stores/conversation/useConversationStore';

/**
 * Simple token counter (approximate)
 * ~4 characters per token for English text
 */
function estimateTokens(text: string): number {
    if (!text) return 0;
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}

/**
 * Count total tokens in a list of messages
 */
export function countMessageTokens(messages: ThreadMessage[]): number {
    return messages.reduce((total, msg) => {
        const contentTokens = estimateTokens(msg.content);
        const toolCallsTokens = msg.toolCalls
            ? msg.toolCalls.reduce((sum, tc) => {
                  const inputTokens = estimateTokens(JSON.stringify(tc.input) || '');
                  const outputTokens = estimateTokens(JSON.stringify(tc.output) || '');
                  return sum + inputTokens + outputTokens;
              }, 0)
            : 0;
        return total + contentTokens + toolCallsTokens;
    }, 0);
}

/**
 * Drop oldest messages until under target token count
 */
export function dropOldestMessages(
    messages: ThreadMessage[],
    targetTokens: number
): ThreadMessage[] {
    let tokenCount = countMessageTokens(messages);

    // Keep dropping oldest until under target
    let messagesToKeep = [...messages];
    while (tokenCount > targetTokens && messagesToKeep.length > 1) {
        const dropped = messagesToKeep.shift();
        if (dropped) {
            tokenCount -= estimateTokens(dropped.content);
            // Also remove tool call tokens
            if (dropped.toolCalls) {
                tokenCount -= dropped.toolCalls.reduce(
                    (sum, tc) =>
                        sum +
                        estimateTokens(JSON.stringify(tc.input) || '') +
                        estimateTokens(JSON.stringify(tc.output) || ''),
                    0
                );
            }
        }
    }

    return messagesToKeep;
}

/**
 * Truncate message contents to fit target token count
 */
export function truncateMessages(
    messages: ThreadMessage[],
    targetTokens: number
): ThreadMessage[] {
    const currentTokens = countMessageTokens(messages);

    if (currentTokens <= targetTokens) {
        return messages;
    }

    // Calculate truncation ratio
    const ratio = targetTokens / currentTokens;

    // Truncate each message proportionally
    return messages.map((msg) => {
        const contentLength = msg.content.length;
        const targetLength = Math.floor(contentLength * ratio);

        if (targetLength >= contentLength) {
            return msg;
        }

        return {
            ...msg,
            content: msg.content.slice(0, targetLength) + '... [truncated]',
        };
    });
}

/**
 * Summarize old messages (placeholder for LLM summarization)
 *
 * TODO: Implement actual LLM-based summarization:
 * - Take first N messages
 * - Generate summary using LLM
 * - Replace messages with summary message
 * - Keep recent messages intact
 */
export async function summarizeMessages(
    messages: ThreadMessage[],
    targetTokens: number
): Promise<ThreadMessage[]> {
    console.warn('[ContextWindowManager] LLM summarization not yet implemented, falling back to drop_oldest');

    // Fallback: Drop oldest messages
    return dropOldestMessages(messages, targetTokens);
}

/**
 * Prune context window based on strategy
 */
export async function pruneContextWindow(
    messages: ThreadMessage[],
    config: ContextWindowConfig
): Promise<ThreadMessage[]> {
    const { maxTokens, compressionStrategy } = config;
    const currentTokens = countMessageTokens(messages);

    console.log('[ContextWindowManager] Pruning context window:', {
        currentTokens,
        maxTokens,
        strategy: compressionStrategy,
    });

    if (currentTokens <= maxTokens) {
        console.log('[ContextWindowManager] No pruning needed');
        return messages;
    }

    switch (compressionStrategy) {
        case 'drop_oldest':
            console.log('[ContextWindowManager] Using drop_oldest strategy');
            return dropOldestMessages(messages, maxTokens);

        case 'summarize':
            console.log('[ContextWindowManager] Using summarize strategy');
            return await summarizeMessages(messages, maxTokens);

        case 'truncate':
            console.log('[ContextWindowManager] Using truncate strategy');
            return truncateMessages(messages, maxTokens);

        default:
            console.warn('[ContextWindowManager] Unknown strategy:', compressionStrategy);
            return dropOldestMessages(messages, maxTokens);
    }
}

/**
 * Get recommended context window config based on conversation length
 */
export function getRecommendedConfig(messageCount: number): ContextWindowConfig {
    // Tiered limits based on conversation size
    if (messageCount < 10) {
        return {
            maxTokens: 4000, // Small conversations
            currentTokens: 0,
            compressionStrategy: 'drop_oldest',
        };
    } else if (messageCount < 50) {
        return {
            maxTokens: 8000, // Medium conversations
            currentTokens: 0,
            compressionStrategy: 'summarize',
        };
    } else {
        return {
            maxTokens: 16000, // Large conversations
            currentTokens: 0,
            compressionStrategy: 'summarize',
        };
    }
}
