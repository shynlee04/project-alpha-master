import type { ConversationThreadRecord } from '../dexie-db';
import { db, getConversationThread, saveConversationThread } from '../dexie-db';
import { useConversationStore } from './conversation/conversation-store';

/**
 * ConversationAutoRestore - Manages automatic conversation restoration on project load.
 * Provides seamless user experience by restoring the most recent conversation.
 */
export class ConversationAutoRestore {
  /**
   * Get the most recently updated thread for a project.
   */
  async getMostRecentThread(projectId: string): Promise<ConversationThreadRecord | null> {
    const threads = await db.threads
      .where('projectId')
      .equals(projectId)
      .sortBy('updatedAt');

    if (threads.length === 0) {
      return null;
    }

    // Return the most recent (last in sorted array)
    return threads[threads.length - 1];
  }

  /**
   * Get all threads for a project sorted by updatedAt descending (most recent first).
   */
  async getThreadsSortedByUpdate(projectId: string): Promise<ConversationThreadRecord[]> {
    const threads = await db.threads
      .where('projectId')
      .equals(projectId)
      .sortBy('updatedAt');

    // Reverse to get most recent first (create new array)
    return [...threads].reverse();
  }

  /**
   * Restore conversation state on project load.
   * Creates a new conversation if none exists, otherwise loads the most recent.
   */
  async restoreOnProjectLoad(projectId: string): Promise<void> {
    try {
      // Check if any conversations exist for this project
      const conversationStore = useConversationStore.getState();
      const existingConversations = conversationStore.getConversationsByProject(projectId);

      if (existingConversations.length === 0) {
        // No conversations exist, create a new one
        conversationStore.createConversation('ide', projectId, 'default');
        return;
      }

      // Load the most recent conversation for this project (Story 51-3)
      await conversationStore.loadConversationByProject(projectId);
    } catch (error) {
      console.error('[ConversationAutoRestore] Failed to restore conversation:', error);
      // Graceful degradation - create new conversation on error
      const conversationStore = useConversationStore.getState();
      conversationStore.createConversation('ide', projectId, 'default');
    }
  }

  /**
   * Create a scroll animation function for smooth position restoration.
   * Returns a cleanup function to cancel animation if needed.
   */
  createScrollAnimation(
    element: HTMLElement,
    targetPosition: number
  ): () => void {
    const startPosition = element.scrollTop;
    const startTime = performance.now();
    const duration = 300; // ms
    let cancelled = false;

    const animate = (currentTime: number): void => {
      if (cancelled) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      element.scrollTop = startPosition + (targetPosition - startPosition) * ease;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
      cancelled = true;
    };
  }

  /**
   * Restore scroll position with animation.
   */
  async restoreScrollPosition(
    _threadId: string,
    scrollPosition: number
  ): Promise<void> {
    // In a real implementation, this would find the chat container
    // and apply the animation
    const element = document.getElementById('chat-messages-container');
    if (element) {
      this.createScrollAnimation(element, scrollPosition);
    }
  }

  /**
   * Save scroll position for current conversation.
   */
  async saveScrollPosition(
    threadId: string,
    scrollPosition: number
  ): Promise<void> {
    try {
      const thread = await getConversationThread(threadId);
      if (thread) {
        // Update thread with scroll position
        await saveConversationThread({
          ...thread,
          scrollPosition,
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error('[ConversationAutoRestore] Failed to save scroll position:', error);
    }
  }

  /**
   * Get scroll position for a conversation.
   */
  async getScrollPosition(threadId: string): Promise<number> {
    try {
      const thread = await getConversationThread(threadId);
      return thread?.scrollPosition ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if restoration is needed (has saved state).
   */
  async hasSavedState(projectId: string): Promise<boolean> {
    const count = await db.threads
      .where('projectId')
      .equals(projectId)
      .count();

    return count > 0;
  }
}

// Export singleton instance
export const conversationAutoRestore = new ConversationAutoRestore();
