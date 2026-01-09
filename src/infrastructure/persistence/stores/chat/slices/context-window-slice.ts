/**
 * @fileoverview Context Window Slice
 * @module infrastructure/persistence/stores/chat/slices/context-window
 * @governance EPIC-40 MM-09
 *
 * Manages context window tracking and compression for chat threads.
 * Prevents token overflow by monitoring usage and applying strategies.
 *
 * @story MM-09: Context Window Manager
 * @created 2026-01-10
 */

import type { StateCreator } from 'zustand';
import type { CombinedUnifiedChatState } from '../unified-chat-types';
import { estimateMessagesTokens, getContextCapacity } from '@/lib/agent/utils/token-estimator';
import {
  CompressionStrategy,
  DEFAULT_MAX_TOKENS,
  DEFAULT_COMPRESSION_THRESHOLD,
  applyCompressionStrategy,
} from './context-window/internal';
import { setThreadMaxTokens, setThreadCompressionStrategy } from './context-window/setters';

/**
 * Context window slice actions
 */
export interface ContextWindowSliceActions {
  /** Get context usage for a thread */
  getContextUsage: (threadId: string) => {
    current: number;
    max: number;
    remaining: number;
    percentage: number;
  } | null;

  /** Update context window for a thread after adding a message */
  updateContextWindow: (threadId: string) => void;

  /** Compress context for a thread using its strategy */
  compressContext: (
    threadId: string,
    strategy?: CompressionStrategy
  ) => { removed: number; remaining: number };

  /** Check if thread context is near limit */
  isContextNearLimit: (threadId: string, threshold?: number) => boolean;

  /** Set max tokens for a thread's context window */
  setThreadMaxTokens: (threadId: string, maxTokens: number) => void;

  /** Set compression strategy for a thread */
  setThreadCompressionStrategy: (
    threadId: string,
    strategy: CompressionStrategy
  ) => void;
}

/**
 * Create context window slice
 *
 * Depends on: threads, messages state from other slices
 */
export const createContextWindowSlice: StateCreator<
  CombinedUnifiedChatState,
  [],
  [],
  ContextWindowSliceActions
> = (set, get) => ({
  // ========== Context Window Methods ==========

  getContextUsage: (threadId: string) => {
    const state = get();
    const thread = state.threads[threadId];
    const messages = state.getMessagesByThread(threadId);

    if (!thread) return null;

    const maxTokens = thread.contextWindow?.maxTokens ?? DEFAULT_MAX_TOKENS;
    const currentTokens = estimateMessagesTokens(messages);
    const { remaining, used, percentage } = getContextCapacity(currentTokens, maxTokens);

    return {
      current: used,
      max: maxTokens,
      remaining,
      percentage,
    };
  },

  updateContextWindow: (threadId: string) => {
    const state = get();
    const thread = state.threads[threadId];
    const messages = state.getMessagesByThread(threadId);

    if (!thread) return;

    const maxTokens = thread.contextWindow?.maxTokens ?? DEFAULT_MAX_TOKENS;
    const currentTokens = estimateMessagesTokens(messages);

    set({
      threads: {
        ...state.threads,
        [threadId]: {
          ...thread,
          contextWindow: {
            maxTokens,
            currentTokens,
            compressionStrategy: thread.contextWindow?.compressionStrategy ?? 'drop_oldest',
          },
        },
      },
    });
  },

  compressContext: (threadId: string, strategy?: CompressionStrategy) => {
    const state = get();
    const thread = state.threads[threadId];
    const messages = state.getMessagesByThread(threadId);

    if (!thread || messages.length === 0) {
      return { removed: 0, remaining: 0 };
    }

    const compressionStrategy = strategy ?? thread.contextWindow?.compressionStrategy ?? 'drop_oldest';
    const maxTokens = thread.contextWindow?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const { messagesToRemove } = applyCompressionStrategy(compressionStrategy, messages, maxTokens);

    for (const messageId of messagesToRemove) {
      get().deleteMessage(messageId);
    }

    get().updateContextWindow(threadId);

    return {
      removed: messagesToRemove.length,
      remaining: messages.length - messagesToRemove.length,
    };
  },

  isContextNearLimit: (threadId: string, threshold?: number) => {
    const usage = get().getContextUsage(threadId);
    if (!usage) return false;

    const checkThreshold = threshold ?? DEFAULT_COMPRESSION_THRESHOLD;
    return usage.percentage >= checkThreshold;
  },

  setThreadMaxTokens: (threadId: string, maxTokens: number) => {
    setThreadMaxTokens(get(), set, threadId, maxTokens);
  },

  setThreadCompressionStrategy: (threadId: string, strategy: CompressionStrategy) => {
    setThreadCompressionStrategy(get(), set, threadId, strategy);
  },
});
