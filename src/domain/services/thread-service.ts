/**
 * @fileoverview Thread Service Implementation
 * @module domain/services/thread-service
 *
 * Implements thread/message CRUD operations using Dexie for persistence.
 * Emits domain events for cross-operator communication.
 *
 * Key features:
 * - Uses Dexie helpers for IndexedDB persistence
 * - Emits thread:created, thread:updated, thread:deleted, thread:message:added events
 * - Uses nanoid for ID generation
 * - Project-scoped operations (NO workspace terminology in API)
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import { nanoid } from 'nanoid';
import type {
  IThreadService,
  CreateThreadInput,
  AddMessageInput,
  Thread,
  ThreadMessage,
  ThreadOperationResult,
} from '@/domain/interfaces/thread-service.interface';
import type {
  ConversationThreadRecord,
  ThreadMessageRecord,
} from '@/infrastructure/persistence/dexie-db';
import {
  getConversationThread,
  saveConversationThread,
  getThreadsForProject,
  getMostRecentThread,
  deleteConversationThread,
  updateThreadScrollPosition,
} from '@/infrastructure/persistence/dexie-db';
import { domainEventBus } from '@/infrastructure/events/domain-event-bus';

// ============================================================================
// Thread Service Implementation
// ============================================================================

/**
 * ThreadService - Manages chat threads and messages
 *
 * Provides CRUD operations for conversation threads with:
 * - Dexie persistence (L3 layer)
 * - Domain event emission for cross-operator communication
 * - Project-scoped operations
 *
 * @example
 * ```typescript
 * // Create a thread
 * const result = await threadService.createThread({
 *   projectId: 'proj-123',
 *   title: 'New Chat'
 * });
 *
 * // Add a message
 * await threadService.addMessage({
 *   threadId: result.data.id,
 *   role: 'user',
 *   content: 'Hello!'
 * });
 * ```
 */
export class ThreadService implements IThreadService {
  private readonly source = 'ThreadService';

  /**
   * Create a new conversation thread
   */
  async createThread(input: CreateThreadInput): Promise<ThreadOperationResult<Thread>> {
    try {
      const now = Date.now();
      const thread: ConversationThreadRecord = {
        id: nanoid(),
        projectId: input.projectId,
        workspaceId: 'ide', // Internal only - not exposed in API
        title: input.title || 'New Chat',
        preview: '',
        messages: [],
        agentsUsed: [],
        messageCount: 0,
        scrollPosition: 0,
        createdAt: now,
        updatedAt: now,
      };

      await saveConversationThread(thread);

      // Emit domain event
      domainEventBus.emit(
        'thread:created',
        {
          projectId: thread.projectId,
          threadId: thread.id,
        },
        this.source
      );

      return { success: true, data: thread };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create thread';
      return { success: false, error: message };
    }
  }

  /**
   * Get a thread by ID
   */
  async getThread(threadId: string): Promise<Thread | undefined> {
    try {
      return await getConversationThread(threadId);
    } catch (error) {
      console.error('[ThreadService] Error getting thread:', error);
      return undefined;
    }
  }

  /**
   * Get all threads for a project (sorted by most recent)
   */
  async listThreads(projectId: string): Promise<Thread[]> {
    try {
      return await getThreadsForProject(projectId);
    } catch (error) {
      console.error('[ThreadService] Error listing threads:', error);
      return [];
    }
  }

  /**
   * Get the most recent thread for a project
   */
  async getMostRecentThread(projectId: string): Promise<Thread | undefined> {
    try {
      return await getMostRecentThread(projectId);
    } catch (error) {
      console.error('[ThreadService] Error getting most recent thread:', error);
      return undefined;
    }
  }

  /**
   * Delete a thread and all its messages
   */
  async deleteThread(threadId: string): Promise<ThreadOperationResult<void>> {
    try {
      const thread = await getConversationThread(threadId);
      if (!thread) {
        return { success: false, error: 'Thread not found' };
      }

      await deleteConversationThread(threadId);

      // Emit domain event
      domainEventBus.emit(
        'thread:deleted',
        {
          projectId: thread.projectId,
          threadId: thread.id,
        },
        this.source
      );

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete thread';
      return { success: false, error: message };
    }
  }

  /**
   * Add a message to a thread
   */
  async addMessage(input: AddMessageInput): Promise<ThreadOperationResult<ThreadMessage>> {
    try {
      const thread = await getConversationThread(input.threadId);
      if (!thread) {
        return { success: false, error: 'Thread not found' };
      }

      const message: ThreadMessageRecord = {
        id: nanoid(),
        role: input.role,
        content: input.content,
        agentId: input.agentId,
        agentName: input.agentName,
        agentModel: input.agentModel,
        timestamp: Date.now(),
      };

      // Update thread with new message
      const updatedThread: ConversationThreadRecord = {
        ...thread,
        messages: [...thread.messages, message],
        messageCount: thread.messageCount + 1,
        preview: input.content.slice(0, 100),
        updatedAt: Date.now(),
        // Track agents used
        agentsUsed: input.agentId && !thread.agentsUsed.includes(input.agentId)
          ? [...thread.agentsUsed, input.agentId]
          : thread.agentsUsed,
      };

      await saveConversationThread(updatedThread);

      // Emit domain event
      domainEventBus.emit(
        'thread:message:added',
        {
          projectId: thread.projectId,
          threadId: thread.id,
          messageId: message.id,
        },
        this.source
      );

      return { success: true, data: message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add message';
      return { success: false, error: message };
    }
  }

  /**
   * Update thread title
   */
  async updateThreadTitle(threadId: string, title: string): Promise<ThreadOperationResult<Thread>> {
    try {
      const thread = await getConversationThread(threadId);
      if (!thread) {
        return { success: false, error: 'Thread not found' };
      }

      const updatedThread: ConversationThreadRecord = {
        ...thread,
        title,
        updatedAt: Date.now(),
      };

      await saveConversationThread(updatedThread);

      // Emit domain event
      domainEventBus.emit(
        'thread:updated',
        {
          projectId: thread.projectId,
          threadId: thread.id,
        },
        this.source
      );

      return { success: true, data: updatedThread };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update thread title';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update thread scroll position
   */
  async updateScrollPosition(threadId: string, scrollPosition: number): Promise<ThreadOperationResult<void>> {
    try {
      await updateThreadScrollPosition(threadId, scrollPosition);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update scroll position';
      return { success: false, error: message };
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global thread service instance
 *
 * Use this singleton for thread operations across the application.
 */
export const threadService = new ThreadService();
