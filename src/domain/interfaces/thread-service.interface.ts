/**
 * @fileoverview Thread Service Interface
 * @module domain/interfaces/thread-service.interface
 *
 * Defines the interface for thread/message CRUD operations.
 * ThreadService manages chat threads and messages for the Chat-Cascade operator.
 *
 * Key features:
 * - Project-scoped thread operations (NO workspaceId in API)
 * - CRUD for threads and messages
 * - Domain event emission for cross-operator communication
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import type {
  ConversationThreadRecord,
  ThreadMessageRecord,
} from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Types
// ============================================================================

/**
 * Result type for thread operations
 */
export interface ThreadOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Input for creating a new thread
 */
export interface CreateThreadInput {
  projectId: string;
  title?: string;
}

/**
 * Input for adding a message to a thread
 */
export interface AddMessageInput {
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string;
  agentName?: string;
  agentModel?: string;
}

/**
 * Thread with hydrated data
 */
export type Thread = ConversationThreadRecord;

/**
 * Message within a thread
 */
export type ThreadMessage = ThreadMessageRecord;

// ============================================================================
// Thread Service Interface
// ============================================================================

/**
 * IThreadService - Interface for thread/message operations
 *
 * Provides CRUD operations for chat threads and messages.
 * Emits domain events for cross-operator communication.
 *
 * @example
 * ```typescript
 * const threadService = new ThreadService();
 *
 * // Create a new thread
 * const result = await threadService.createThread({
 *   projectId: 'proj-123',
 *   title: 'New Chat'
 * });
 *
 * if (result.success && result.data) {
 *   // Add a message
 *   await threadService.addMessage({
 *     threadId: result.data.id,
 *     role: 'user',
 *     content: 'Hello, AI!'
 *   });
 * }
 * ```
 */
export interface IThreadService {
  /**
   * Create a new conversation thread
   *
   * @param input - Thread creation input
   * @returns Promise with the created thread or error
   */
  createThread(input: CreateThreadInput): Promise<ThreadOperationResult<Thread>>;

  /**
   * Get a thread by ID
   *
   * @param threadId - Thread ID
   * @returns Promise with the thread or undefined
   */
  getThread(threadId: string): Promise<Thread | undefined>;

  /**
   * Get all threads for a project
   *
   * @param projectId - Project ID
   * @returns Promise with array of threads (sorted by most recent)
   */
  listThreads(projectId: string): Promise<Thread[]>;

  /**
   * Get the most recent thread for a project
   *
   * @param projectId - Project ID
   * @returns Promise with the most recent thread or undefined
   */
  getMostRecentThread(projectId: string): Promise<Thread | undefined>;

  /**
   * Delete a thread and all its messages
   *
   * @param threadId - Thread ID
   * @returns Promise with operation result
   */
  deleteThread(threadId: string): Promise<ThreadOperationResult<void>>;

  /**
   * Add a message to a thread
   *
   * @param input - Message input
   * @returns Promise with the added message or error
   */
  addMessage(input: AddMessageInput): Promise<ThreadOperationResult<ThreadMessage>>;

  /**
   * Update thread title
   *
   * @param threadId - Thread ID
   * @param title - New title
   * @returns Promise with operation result
   */
  updateThreadTitle(threadId: string, title: string): Promise<ThreadOperationResult<Thread>>;

  /**
   * Update thread scroll position
   *
   * @param threadId - Thread ID
   * @param scrollPosition - New scroll position
   * @returns Promise with operation result
   */
  updateScrollPosition(threadId: string, scrollPosition: number): Promise<ThreadOperationResult<void>>;
}
