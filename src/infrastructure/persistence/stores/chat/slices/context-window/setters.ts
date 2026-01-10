/**
 * @fileoverview Context Window Setters
 * @module infrastructure/persistence/stores/chat/slices/context-window/setters
 * @governance EPIC-40 MM-09
 *
 * Setter actions for context window configuration.
 * Separated from main slice to maintain ≤120 line limit.
 *
 * @story MM-09: Context Window Manager
 * @created 2026-01-10
 */

import type { CombinedUnifiedChatState } from '../../unified-chat-types';
import type { ContextWindowConfig } from '@/domain/entities/chat';
import type { CompressionStrategy } from './internal';

/**
 * Set max tokens for a thread's context window
 */
export function setThreadMaxTokens(
  state: CombinedUnifiedChatState,
  set: (partial: Partial<CombinedUnifiedChatState>) => void,
  threadId: string,
  maxTokens: number
): void {
  const threads = state.threads ?? {};
  const thread = threads[threadId];
  if (!thread) return;

  set({
    threads: {
      ...threads,
      [threadId]: {
        ...thread,
        contextWindow: {
          ...thread.contextWindow,
          maxTokens,
        } as ContextWindowConfig,
      },
    },
  });
}

/**
 * Set compression strategy for a thread
 */
export function setThreadCompressionStrategy(
  state: CombinedUnifiedChatState,
  set: (partial: Partial<CombinedUnifiedChatState>) => void,
  threadId: string,
  strategy: CompressionStrategy
): void {
  const threads = state.threads ?? {};
  const thread = threads[threadId];
  if (!thread) return;

  set({
    threads: {
      ...threads,
      [threadId]: {
        ...thread,
        contextWindow: {
          ...thread.contextWindow,
          compressionStrategy: strategy,
        } as ContextWindowConfig,
      },
    },
  });
}
