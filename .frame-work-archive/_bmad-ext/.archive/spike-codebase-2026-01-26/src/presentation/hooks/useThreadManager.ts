/**
 * @fileoverview Thread Manager Hook
 * @module presentation/hooks/useThreadManager
 *
 * CHAT-005: Thread Workspace Association
 *
 * Bridges the ThreadManager UI component with the unified chat store.
 * Provides thread CRUD operations with proper workspace association.
 *
 * @example
 * ```tsx
 * const {
 *   threads,
 *   activeThreadId,
 *   createThread,
 *   setActiveThread,
 * } = useThreadManager({ workspaceType: 'ide' });
 * ```
 */

import { useMemo, useCallback } from 'react'
import { useUnifiedChatStore } from '@/infrastructure/persistence/stores/chat'
import type { ThreadWithId } from '@/infrastructure/persistence/stores/chat/unified-chat-types'
import type { WorkspaceType } from '@/domain/entities/chat'

export interface UseThreadManagerOptions {
  /** The workspace to filter threads by */
  workspaceType: WorkspaceType
  /** Optional conversation ID to further filter threads */
  conversationId?: string
}

export interface UseThreadManagerReturn {
  /** Threads filtered by workspace and conversation */
  threads: ThreadWithId[]
  /** Currently active thread ID */
  activeThreadId: string | null
  /** Currently active thread */
  activeThread: ThreadWithId | null
  /** Active threads (not archived or deleted) */
  activeThreads: ThreadWithId[]
  /** Archived threads */
  archivedThreads: ThreadWithId[]
  /** Create a new thread */
  createThread: (title?: string) => string
  /** Delete a thread (soft delete, sets status to 'deleted') */
  deleteThread: (threadId: string) => void
  /** Update thread (title, status, etc.) - CHAT-005 */
  updateThread: (threadId: string, updates: Partial<Omit<ThreadWithId, 'id' | 'conversationId' | 'createdAt'>>) => void
  /** CHAT-006: Archive a thread (sets status to 'archived') */
  archiveThread: (threadId: string) => void
  /** CHAT-006: Unarchive a thread (sets status back to 'active') */
  unarchiveThread: (threadId: string) => void
  /** Set the active thread */
  setActiveThread: (threadId: string) => void
  /** Clear the active thread */
  clearActiveThread: () => void
}

/**
 * Hook for thread management with workspace association
 *
 * Filters threads from the unified chat store by workspace and
 * provides CRUD operations that maintain workspace association.
 */
export function useThreadManager({
  workspaceType,
  conversationId,
}: UseThreadManagerOptions): UseThreadManagerReturn {
  // Get store state
  const storeThreads = useUnifiedChatStore((state) => state.threads)
  const activeThreadId = useUnifiedChatStore((state) => state.activeThreadId)
  const activeConversationId = useUnifiedChatStore((state) => state.activeConversationId)

  // Get store methods
  const createThread = useUnifiedChatStore((state) => state.createThread)
  const deleteThread = useUnifiedChatStore((state) => state.deleteThread)
  const updateThread = useUnifiedChatStore((state) => state.updateThread)
  const archiveThread = useUnifiedChatStore((state) => state.archiveThread)
  const unarchiveThread = useUnifiedChatStore((state) => state.unarchiveThread)
  const setActiveThread = useUnifiedChatStore((state) => state.setActiveThread)
  const getThread = useUnifiedChatStore((state) => state.getThread)

  // Filter threads by workspace and optional conversation
  const filteredThreads = useMemo(() => {
    return Object.values(storeThreads).filter((thread: ThreadWithId) => {
      // Filter by workspace type
      if (thread.workspaceType !== workspaceType) return false
      // Filter by status (exclude deleted)
      if (thread.status === 'deleted') return false
      // Filter by conversation if specified
      if (conversationId && thread.conversationId !== conversationId) {
        return false
      }
      return true
    })
  }, [storeThreads, workspaceType, conversationId])

  // Active threads (not archived)
  const activeThreads = useMemo(() => {
    return filteredThreads.filter((t) => t.status === 'active')
  }, [filteredThreads])

  // Archived threads
  const archivedThreads = useMemo(() => {
    return filteredThreads.filter((t) => t.status === 'archived')
  }, [filteredThreads])

  // Currently active thread
  const activeThread = useMemo(() => {
    if (!activeThreadId) return null
    return getThread(activeThreadId) || null
  }, [activeThreadId, getThread])

  /**
   * Create a new thread in the current workspace
   */
  const handleCreateThread = useCallback((title?: string): string => {
    const convId = activeConversationId
    if (!convId) {
      console.warn('[useThreadManager] Cannot create thread: no active conversation')
      throw new Error('Cannot create thread: no active conversation')
    }

    // Create thread via store
    const threadId = createThread(convId)

    // CHAT-005: Update thread title if provided
    if (title) {
      updateThread(threadId, { title })
    }

    return threadId
  }, [activeConversationId, createThread, updateThread])

  /**
   * Delete a thread (soft delete)
   */
  const handleDeleteThread = useCallback((threadId: string) => {
    const thread = getThread(threadId)
    if (!thread) {
      console.warn('[useThreadManager] Thread not found:', threadId)
      return
    }

    // Validate workspace association
    if (thread.workspaceType !== workspaceType) {
      console.warn('[useThreadManager] Cannot delete thread from different workspace')
      return
    }

    deleteThread(threadId)
  }, [getThread, workspaceType, deleteThread])

  /**
   * Set the active thread
   */
  const handleSetActiveThread = useCallback((threadId: string) => {
    const thread = getThread(threadId)
    if (!thread) {
      console.warn('[useThreadManager] Thread not found:', threadId)
      return
    }

    // Validate workspace association
    if (thread.workspaceType !== workspaceType) {
      console.warn('[useThreadManager] Thread belongs to different workspace')
      return
    }

    setActiveThread(threadId)
  }, [getThread, workspaceType, setActiveThread])

  /**
   * Clear the active thread
   */
  const handleClearActiveThread = useCallback(() => {
    setActiveThread(null)
  }, [setActiveThread])

  /**
   * Update a thread (title, status, etc.) - CHAT-005
   */
  const handleUpdateThread = useCallback(
    (threadId: string, updates: Partial<Omit<ThreadWithId, 'id' | 'conversationId' | 'createdAt'>>) => {
      const thread = getThread(threadId)
      if (!thread) {
        console.warn('[useThreadManager] Thread not found:', threadId)
        return
      }

      // Validate workspace association
      if (thread.workspaceType !== workspaceType) {
        console.warn('[useThreadManager] Cannot update thread from different workspace')
        return
      }

      updateThread(threadId, updates)
    },
    [getThread, workspaceType, updateThread]
  )

  /**
   * CHAT-006: Archive a thread
   */
  const handleArchiveThread = useCallback((threadId: string) => {
    const thread = getThread(threadId)
    if (!thread) {
      console.warn('[useThreadManager] Thread not found:', threadId)
      return
    }

    // Validate workspace association
    if (thread.workspaceType !== workspaceType) {
      console.warn('[useThreadManager] Cannot archive thread from different workspace')
      return
    }

    archiveThread(threadId)
  }, [getThread, workspaceType, archiveThread])

  /**
   * CHAT-006: Unarchive a thread
   */
  const handleUnarchiveThread = useCallback((threadId: string) => {
    const thread = getThread(threadId)
    if (!thread) {
      console.warn('[useThreadManager] Thread not found:', threadId)
      return
    }

    // Validate workspace association
    if (thread.workspaceType !== workspaceType) {
      console.warn('[useThreadManager] Cannot unarchive thread from different workspace')
      return
    }

    unarchiveThread(threadId)
  }, [getThread, workspaceType, unarchiveThread])

  return {
    threads: filteredThreads,
    activeThreadId,
    activeThread,
    activeThreads,
    archivedThreads,
    createThread: handleCreateThread,
    deleteThread: handleDeleteThread,
    updateThread: handleUpdateThread,
    archiveThread: handleArchiveThread,
    unarchiveThread: handleUnarchiveThread,
    setActiveThread: handleSetActiveThread,
    clearActiveThread: handleClearActiveThread,
  }
}

export default useThreadManager
