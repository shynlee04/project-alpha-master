/**
 * @fileoverview Conversation Persistence Hook
 * @module lib/events/use-conversation-persistence
 * @story E1-6 - Conversation Persistence Across Workspaces
 *
 * Hook to ensure conversations are saved before workspace switches
 * and properly restored when returning to a workspace.
 *
 * @example
 * ```tsx
 * function NotesPage() {
 *   const { saveConversation, restoreConversation, isSaving } = useConversationPersistence({
 *     workspaceId: 'notes',
 *     projectId,
 *     onBeforeWorkspaceSwitch: () => console.log('Saving before switch...'),
 *   });
 *
 *   useEffect(() => {
 *     restoreConversation();
 *   }, [projectId]);
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import type { WorkspaceId } from './cross-workspace-event-bus';
import { getConversationStoreState } from '@/infrastructure/persistence/stores/conversation/useConversationStore';

/**
 * Options for the conversation persistence hook
 */
export interface UseConversationPersistenceOptions {
  /** Current workspace ID */
  workspaceId: WorkspaceId;
  /** Current project ID (if applicable) */
  projectId: string | null;
  /** Optional callback triggered before workspace switch */
  onBeforeWorkspaceSwitch?: () => void | Promise<void>;
  /** Optional callback triggered after workspace switch */
  onAfterWorkspaceSwitch?: (previousWorkspace: WorkspaceId) => void | Promise<void>;
}

/**
 * Result of the conversation persistence hook
 */
export interface UseConversationPersistenceResult {
  /** Save current conversation to IndexedDB */
  saveConversation: () => Promise<void>;
  /** Restore conversation for current workspace */
  restoreConversation: () => void;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Save and restore scroll position for a conversation */
  setScrollPosition: (conversationId: string, scrollPosition: number) => void;
  /** Get scroll position for a conversation */
  getScrollPosition: (conversationId: string) => number;
}

/**
 * In-memory cache for scroll positions (fallback if not persisted)
 */
const scrollPositionCache = new Map<string, number>();

/**
 * Get the cache key for scroll position
 */
function getScrollPositionCacheKey(workspaceId: WorkspaceId, projectId: string | null, conversationId: string): string {
  return `${workspaceId}:${projectId || 'no-project'}:${conversationId}`;
}

/**
 * Conversation persistence hook
 *
 * Ensures conversations are saved before workspace switches and restored
 * when returning. Manages scroll position tracking for conversations.
 *
 * Features:
 * - Explicit save before workspace switch (bypasses debounce)
 * - Conversation restoration when entering workspace
 * - Scroll position tracking and restoration
 * - Safe IndexedDB operations with error handling
 *
 * @param options - Hook options
 * @returns Methods for conversation persistence
 */
export function useConversationPersistence({
  workspaceId,
  projectId,
}: UseConversationPersistenceOptions): UseConversationPersistenceResult {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save current conversation to IndexedDB
   * This bypasses the debounce and ensures immediate persistence
   */
  const saveConversation = useCallback(async () => {
    setIsSaving(true);
    try {
      const store = getConversationStoreState();
      const currentConversation = store.getCurrentConversation();

      if (!currentConversation) {
        console.log('[useConversationPersistence] No active conversation to save');
        return;
      }

      console.log('[useConversationPersistence] Saving conversation:', {
        workspaceId,
        projectId,
        conversationId: currentConversation.metadata.id,
        messageCount: currentConversation.messages.length,
      });

      // Call persistConversation directly (bypasses debounce)
      await store.persistConversation();

      console.log('[useConversationPersistence] Conversation saved successfully');
    } catch (error) {
      console.error('[useConversationPersistence] Failed to save conversation:', error);
      // Don't throw - let the workspace switch proceed anyway
    } finally {
      setIsSaving(false);
    }
  }, [workspaceId, projectId]);

  /**
   * Restore conversation when entering a workspace
   * Sets the active conversation based on workspace/project
   */
  const restoreConversation = useCallback(() => {
    try {
      const store = getConversationStoreState();

      // Find conversations for this workspace
      const workspaceConversations = store.getConversationsByWorkspace(workspaceId);

      // Filter by project if we have one
      const projectConversations = projectId
        ? workspaceConversations.filter((c) => c.projectId === projectId)
        : workspaceConversations.filter((c) => !c.projectId);

      if (projectConversations.length === 0) {
        console.log('[useConversationPersistence] No previous conversations found');
        return;
      }

      // Get the most recent conversation (sorted by updatedAt)
      const mostRecent = projectConversations.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

      console.log('[useConversationPersistence] Restoring conversation:', {
        workspaceId,
        projectId,
        conversationId: mostRecent.id,
        title: mostRecent.title,
      });

      // Set as active conversation
      store.setActiveConversation(mostRecent.id);

      // Restore scroll position if available
      const cacheKey = getScrollPositionCacheKey(workspaceId, projectId, mostRecent.id);
      const scrollPosition = scrollPositionCache.get(cacheKey);
      if (scrollPosition) {
        console.log('[useConversationPersistence] Restored scroll position:', scrollPosition);
        // Scroll position will be applied by the chat panel component
      }
    } catch (error) {
      console.error('[useConversationPersistence] Failed to restore conversation:', error);
    }
  }, [workspaceId, projectId]);

  /**
   * Save scroll position for a conversation
   */
  const setScrollPosition = useCallback((conversationId: string, scrollPosition: number) => {
    const cacheKey = getScrollPositionCacheKey(workspaceId, projectId, conversationId);
    scrollPositionCache.set(cacheKey, scrollPosition);

    // Also update in the store if conversation exists
    try {
      const store = getConversationStoreState();
      const conversation = store.getConversation(conversationId);
      if (conversation) {
        store.updateConversationMetadata(conversationId, { scrollPosition });
      }
    } catch (error) {
      console.warn('[useConversationPersistence] Failed to save scroll position:', error);
    }
  }, [workspaceId, projectId]);

  /**
   * Get scroll position for a conversation
   */
  const getScrollPosition = useCallback((conversationId: string): number => {
    const cacheKey = getScrollPositionCacheKey(workspaceId, projectId, conversationId);
    const cached = scrollPositionCache.get(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    // Fall back to store value
    try {
      const store = getConversationStoreState();
      const conversation = store.getConversation(conversationId);
      // @ts-ignore - scrollPosition may not be in metadata yet
      return conversation?.scrollPosition || 0;
    } catch {
      return 0;
    }
  }, [workspaceId, projectId]);

  return {
    saveConversation,
    restoreConversation,
    isSaving,
    setScrollPosition,
    getScrollPosition,
  };
}

/**
 * Hook to listen for workspace changes and auto-save conversations
 *
 * @param _saveFn - Function to call for saving (reserved for future use)
 */
export function useWorkspaceAutoSave(_saveFn: () => Promise<void>): void {
  // This hook can be used to automatically save when workspace changes are detected
  // It's separated from the main hook for flexibility
  // Implementation pending - currently handled by onWorkspaceChange callback
}
