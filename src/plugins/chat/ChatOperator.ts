/**
 * @fileoverview Chat-Cascade Platform Operator
 * @module plugins/chat/ChatOperator
 *
 * Platform Operator for chat functionality. Always running, manages:
 * - Active thread tracking for the session
 * - Thread lifecycle (create, switch, delete)
 * - Project switch event handling
 *
 * Key features:
 * - Implements IPlatformOperator lifecycle
 * - Uses ThreadService for persistence
 * - Emits domain events for cross-operator communication
 * - Tracks active thread per session
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import type {
  IPlatformOperator,
  OperatorHealthStatus,
} from '@/domain/interfaces/operator.interface';
import type { Thread, ThreadMessage } from '@/domain/interfaces/thread-service.interface';
import { threadService } from '@/domain/services/thread-service';
import { domainEventBus } from '@/infrastructure/events/domain-event-bus';

// ============================================================================
// ChatOperator Implementation
// ============================================================================

/**
 * ChatOperator - Platform Operator for chat functionality
 *
 * Manages chat threads and provides an always-on infrastructure for AI conversations.
 * This is a Platform Operator (always running) that:
 * - Tracks the active thread for the current session
 * - Handles project switch events to load appropriate threads
 * - Provides thread lifecycle management
 *
 * @example
 * ```typescript
 * // Initialize during app startup
 * await chatOperator.init();
 *
 * // Create a new thread for current project
 * const thread = await chatOperator.createThread('proj-123');
 *
 * // Send a message
 * await chatOperator.sendMessage('Hello, AI!');
 *
 * // Cleanup during shutdown
 * await chatOperator.destroy();
 * ```
 */
export class ChatOperator implements IPlatformOperator {
  readonly name = 'Chat-Cascade';
  readonly isOperator = true as const;

  /**
   * Current active thread for this session
   */
  private activeThread: Thread | null = null;

  /**
   * Current project ID
   */
  private currentProjectId: string | null = null;

  /**
   * Event unsubscribe functions for cleanup
   */
  private unsubscribes: Array<() => void> = [];

  /**
   * Initialized state
   */
  private initialized = false;

  // ==========================================================================
  // IPlatformOperator Lifecycle
  // ==========================================================================

  /**
   * Initialize the Chat-Cascade operator
   *
   * Sets up event subscriptions and prepares for operation.
   * Called during app startup.
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('[ChatOperator] Already initialized');
      return;
    }

    // Subscribe to project switch events
    const unsubProjectSwitch = domainEventBus.on('project:switched', async (event) => {
      await this.handleProjectSwitch(event.payload.projectId);
    });
    this.unsubscribes.push(unsubProjectSwitch);

    // Subscribe to project close events
    const unsubProjectClose = domainEventBus.on('project:closed', () => {
      this.activeThread = null;
      this.currentProjectId = null;
    });
    this.unsubscribes.push(unsubProjectClose);

    this.initialized = true;
    console.log('[ChatOperator] Initialized');
  }

  /**
   * Destroy the Chat-Cascade operator
   *
   * Cleans up event subscriptions and releases resources.
   * Called during app shutdown.
   */
  async destroy(): Promise<void> {
    // Unsubscribe from all events
    for (const unsub of this.unsubscribes) {
      unsub();
    }
    this.unsubscribes = [];

    // Clear state
    this.activeThread = null;
    this.currentProjectId = null;
    this.initialized = false;

    console.log('[ChatOperator] Destroyed');
  }

  /**
   * Health check for the Chat-Cascade operator
   *
   * Returns the current operational status.
   */
  async healthCheck(): Promise<OperatorHealthStatus> {
    return {
      healthy: this.initialized,
      message: this.initialized ? 'Chat-Cascade operational' : 'Not initialized',
      details: {
        hasActiveThread: this.activeThread !== null,
        currentProjectId: this.currentProjectId,
        threadId: this.activeThread?.id ?? null,
      },
    };
  }

  // ==========================================================================
  // Thread Management
  // ==========================================================================

  /**
   * Get the current active thread
   */
  getActiveThread(): Thread | null {
    return this.activeThread;
  }

  /**
   * Get the current project ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * Set the active thread
   *
   * @param threadId - Thread ID to set as active
   */
  async setActiveThread(threadId: string): Promise<void> {
    const thread = await threadService.getThread(threadId);
    if (thread) {
      this.activeThread = thread;
    }
  }

  /**
   * Create a new thread for the current project
   *
   * @param projectId - Project ID (optional, uses current if not provided)
   * @param title - Thread title (optional)
   * @returns The created thread or null on error
   */
  async createThread(projectId?: string, title?: string): Promise<Thread | null> {
    const targetProjectId = projectId ?? this.currentProjectId;
    if (!targetProjectId) {
      console.error('[ChatOperator] No project ID available for thread creation');
      return null;
    }

    const result = await threadService.createThread({
      projectId: targetProjectId,
      title,
    });

    if (result.success && result.data) {
      this.activeThread = result.data;
      return result.data;
    }

    console.error('[ChatOperator] Failed to create thread:', result.error);
    return null;
  }

  /**
   * Delete a thread
   *
   * @param threadId - Thread ID to delete
   * @returns True if deleted successfully
   */
  async deleteThread(threadId: string): Promise<boolean> {
    const result = await threadService.deleteThread(threadId);

    if (result.success) {
      // If we deleted the active thread, clear it
      if (this.activeThread?.id === threadId) {
        this.activeThread = null;
      }
      return true;
    }

    console.error('[ChatOperator] Failed to delete thread:', result.error);
    return false;
  }

  /**
   * List all threads for the current project
   *
   * @param projectId - Project ID (optional, uses current if not provided)
   * @returns Array of threads
   */
  async listThreads(projectId?: string): Promise<Thread[]> {
    const targetProjectId = projectId ?? this.currentProjectId;
    if (!targetProjectId) {
      return [];
    }

    return threadService.listThreads(targetProjectId);
  }

  // ==========================================================================
  // Message Operations
  // ==========================================================================

  /**
   * Send a user message to the active thread
   *
   * @param content - Message content
   * @returns The added message or null on error
   */
  async sendMessage(content: string): Promise<ThreadMessage | null> {
    if (!this.activeThread) {
      console.error('[ChatOperator] No active thread for message');
      return null;
    }

    const result = await threadService.addMessage({
      threadId: this.activeThread.id,
      role: 'user',
      content,
    });

    if (result.success && result.data) {
      // Refresh active thread with new message
      const updatedThread = await threadService.getThread(this.activeThread.id);
      if (updatedThread) {
        this.activeThread = updatedThread;
      }
      return result.data;
    }

    console.error('[ChatOperator] Failed to send message:', result.error);
    return null;
  }

  /**
   * Add an assistant message to the active thread
   *
   * @param content - Message content
   * @param agentInfo - Optional agent information
   * @returns The added message or null on error
   */
  async addAssistantMessage(
    content: string,
    agentInfo?: { agentId?: string; agentName?: string; agentModel?: string }
  ): Promise<ThreadMessage | null> {
    if (!this.activeThread) {
      console.error('[ChatOperator] No active thread for message');
      return null;
    }

    const result = await threadService.addMessage({
      threadId: this.activeThread.id,
      role: 'assistant',
      content,
      ...agentInfo,
    });

    if (result.success && result.data) {
      // Refresh active thread with new message
      const updatedThread = await threadService.getThread(this.activeThread.id);
      if (updatedThread) {
        this.activeThread = updatedThread;
      }
      return result.data;
    }

    console.error('[ChatOperator] Failed to add assistant message:', result.error);
    return null;
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  /**
   * Handle project switch event
   *
   * Loads the most recent thread for the new project or creates one.
   *
   * @param projectId - New project ID
   */
  private async handleProjectSwitch(projectId: string): Promise<void> {
    this.currentProjectId = projectId;

    // Try to load the most recent thread for this project
    const recentThread = await threadService.getMostRecentThread(projectId);
    
    if (recentThread) {
      this.activeThread = recentThread;
    } else {
      // No threads exist, leave activeThread null
      // A new thread will be created when user sends first message
      this.activeThread = null;
    }

    console.log(
      `[ChatOperator] Project switched to ${projectId}, active thread: ${this.activeThread?.id ?? 'none'}`
    );
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global Chat-Cascade operator instance
 *
 * Use this singleton for chat operations across the application.
 * Initialize during app startup with chatOperator.init().
 */
export const chatOperator = new ChatOperator();
