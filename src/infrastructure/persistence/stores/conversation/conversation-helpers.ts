/**
 * @fileoverview Conversation store helper functions and utilities
 * @module infrastructure/persistence/stores/conversation/conversation-helpers
 */

import { toast } from 'sonner';
import type { ConversationState } from './conversation-types';
import { saveThread, getThread } from '@/lib/workspace/threads-store';
import type { ConversationThread } from './conversation-threads-store';
import type { ConversationThreadRecord } from '../../dexie-db';

/** Maximum number of conversations to prevent unbounded growth */
export const MAX_CONVERSATIONS = 50;

/**
 * Simple debounce utility
 * Creates a debounced function that delays invoking func until after wait milliseconds
 */
export function simpleDebounce<T extends (arg: ConversationState) => Promise<void>>(
  func: T,
  wait: number
): T & { flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let flushResolve: (() => void) | null = null;

  const debounced = (async (arg: ConversationState) => {
    if (flushResolve) {
      // A flush is pending, resolve it
      flushResolve();
      flushResolve = null;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        timeoutId = null;
        try {
          await func(arg);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  }) as T;

  (debounced as T & { flush: () => void; cancel: () => void }).flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  (debounced as T & { flush: () => void; cancel: () => void }).cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as T & { flush: () => void; cancel: () => void };
}

/**
 * Persist conversation state to Dexie threads table
 * This ensures consistency with the Threads view
 */
export async function persistToDexie(conversation: ConversationState): Promise<void> {
  try {
    const thread: ConversationThreadRecord = {
      id: conversation.metadata.id,
      projectId: conversation.metadata.projectId || 'default',
      title: conversation.metadata.title,
      preview: conversation.metadata.preview || '',
      messages: conversation.messages,
      agentsUsed: conversation.metadata.agentId ? [conversation.metadata.agentId] : [],
      messageCount: conversation.messages.length,
      createdAt: conversation.metadata.createdAt,
      updatedAt: conversation.metadata.updatedAt,
    };

    const uiThread: ConversationThread = {
      id: thread.id,
      projectId: thread.projectId,
      title: thread.title,
      preview: thread.preview,
      messages: thread.messages as any[], // Casting for now, types match close enough
      agentsUsed: thread.agentsUsed,
      messageCount: thread.messageCount,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    };

    await saveThread(uiThread);
  } catch (error: any) {
    console.error('[ConversationStore] Failed to persist thread:', error);
    if (error.name === 'QuotaExceededError') {
      toast.error('Storage full. Please clear old conversations.', {
        duration: 5000,
        action: {
          label: 'Clear Data',
          onClick: () => console.log('Trigger clear data')
        }
      });
    }
  }
}

/**
 * Create a debounced persist to Dexie function
 * Performance optimization for frequent updates during chat
 */
export function createDebouncedPersist(waitMs: number = 500) {
  return simpleDebounce(
    async (conversation: ConversationState) => {
      await persistToDexie(conversation);
    },
    waitMs
  );
}
