/**
 * @fileoverview Context Window Internal Utilities
 * @module infrastructure/persistence/stores/chat/slices/context-window/internal
 * @governance EPIC-40 MM-09
 *
 * Internal utilities for context window compression.
 * Separated from slice to maintain ≤120 line limit.
 *
 * @story MM-09: Context Window Manager
 * @created 2026-01-10
 */

import type { MessageWithId } from '../../unified-chat-types';
import { estimateMessagesTokens, estimateSingleMessageTokens } from '@/lib/agent/utils/token-estimator';

/**
 * Compression strategy type
 */
export type CompressionStrategy = 'drop_oldest' | 'summarize' | 'truncate';

/**
 * Default max tokens for context window (model-dependent)
 */
export const DEFAULT_MAX_TOKENS = 128000;

/**
 * Threshold percentage to trigger compression warning
 * @story 40-03: Changed from 80 to 65 for earlier compression trigger
 */
export const DEFAULT_COMPRESSION_THRESHOLD = 65;

/**
 * Identify messages to remove for compression
 *
 * @param messages - All messages in thread
 * @param targetTokens - Target token count after compression
 * @returns List of message IDs to remove
 */
export function identifyMessagesToRemove(
  messages: MessageWithId[],
  targetTokens: number
): string[] {
  // Keep system messages, drop oldest non-system messages first
  const nonSystemMessages = messages.filter(m => m.role !== 'system');
  const systemMessages = messages.filter(m => m.role === 'system');

  const systemTokensResult = estimateMessagesTokens(systemMessages);
  let accumulatedTokens = systemTokensResult.totalTokens;
  const messagesToRemove: string[] = [];

  for (const msg of nonSystemMessages) {
    const msgTokens = estimateSingleMessageTokens(msg);
    if (accumulatedTokens + msgTokens > targetTokens) {
      messagesToRemove.push(msg.id);
    } else {
      accumulatedTokens += msgTokens;
    }
  }

  return messagesToRemove;
}

/**
 * Apply compression strategy to messages
 *
 * @param strategy - Compression strategy to use
 * @param threadId - Thread ID for fallback recursion
 * @param messages - All messages in thread
 * @param maxTokens - Max tokens allowed
 * @param compressFn - Recursive compress function for fallback
 * @returns List of message IDs to remove
 */
export function applyCompressionStrategy(
  strategy: CompressionStrategy,
  messages: MessageWithId[],
  maxTokens: number
): { strategy: CompressionStrategy; targetTokens: number; messagesToRemove: string[] } {
  const targetTokens = Math.floor(maxTokens * 0.7); // Compress to 70% of max

  switch (strategy) {
    case 'drop_oldest':
      return {
        strategy,
        targetTokens,
        messagesToRemove: identifyMessagesToRemove(messages, targetTokens),
      };

    case 'truncate':
      // For now, fall back to drop_oldest (truncate requires more complex logic)
      return applyCompressionStrategy('drop_oldest', messages, maxTokens);

    case 'summarize':
      // Future: Integrate with summarization service
      // For now, fall back to drop_oldest
      return applyCompressionStrategy('drop_oldest', messages, maxTokens);

    default:
      return { strategy: 'drop_oldest', targetTokens, messagesToRemove: [] };
  }
}
