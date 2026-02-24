/**
 * @fileoverview useProjectChat Hook
 * @module plugins/chat/hooks/useChat
 *
 * React hook for managing chat state and operations.
 * Wraps ChatOperator functionality for React components.
 *
 * Key features:
 * - Manages thread state (active thread, messages)
 * - Provides send/receive message operations
 * - Handles loading states
 * - Placeholder AI response (actual AI integration in Phase 2)
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import { useState, useCallback, useEffect } from 'react';
import type { Thread, ThreadMessage } from '@/domain/interfaces/thread-service.interface';
import { chatOperator } from '../ChatOperator';
import { threadService } from '@/domain/services/thread-service';

// ============================================================================
// Types
// ============================================================================

/**
 * State returned by useProjectChat hook
 */
export interface ProjectChatState {
  /** Current active thread */
  activeThread: Thread | null;
  /** All threads for the current project */
  threads: Thread[];
  /** Current messages in active thread */
  messages: ThreadMessage[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether AI is responding */
  isResponding: boolean;
}

/**
 * Actions returned by useProjectChat hook
 */
export interface ProjectChatActions {
  /** Send a user message */
  sendMessage: (content: string) => Promise<void>;
  /** Create a new thread */
  createThread: (title?: string) => Promise<Thread | null>;
  /** Switch to a different thread */
  switchThread: (threadId: string) => Promise<void>;
  /** Delete a thread */
  deleteThread: (threadId: string) => Promise<boolean>;
  /** Refresh threads list */
  refreshThreads: () => Promise<void>;
  /** Update thread title */
  updateThreadTitle: (threadId: string, title: string) => Promise<void>;
}

/**
 * Return type of useProjectChat hook
 */
export type UseProjectChatReturn = ProjectChatState & ProjectChatActions;

// ============================================================================
// useProjectChat Hook
// ============================================================================

/**
 * useProjectChat - React hook for chat functionality
 *
 * Provides state and actions for managing chat threads and messages.
 * Uses ChatOperator internally for persistence and event handling.
 *
 * @param projectId - Project ID to scope chat operations
 * @returns Chat state and actions
 *
 * @example
 * ```tsx
 * function ChatPanel({ projectId }) {
 *   const {
 *     activeThread,
 *     messages,
 *     isLoading,
 *     sendMessage,
 *     createThread,
 *   } = useProjectChat(projectId);
 *
 *   const handleSend = async (content: string) => {
 *     await sendMessage(content);
 *   };
 *
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <Message key={msg.id} message={msg} />
 *       ))}
 *       <Input onSubmit={handleSend} disabled={isLoading} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useProjectChat(projectId: string | null): UseProjectChatReturn {
  // State
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  // Derived state
  const messages = activeThread?.messages ?? [];

  // ==========================================================================
  // Effects
  // ==========================================================================

  /**
   * Load threads when projectId changes
   */
  useEffect(() => {
    if (!projectId) {
      setActiveThread(null);
      setThreads([]);
      return;
    }

    const loadThreads = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get all threads for this project
        const projectThreads = await chatOperator.listThreads(projectId);
        setThreads(projectThreads);

        // Set active thread to most recent if available
        if (projectThreads.length > 0) {
          setActiveThread(projectThreads[0]);
          await chatOperator.setActiveThread(projectThreads[0].id);
        } else {
          setActiveThread(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load threads';
        setError(message);
        console.error('[useProjectChat] Error loading threads:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThreads();
  }, [projectId]);

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Send a user message
   */
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!projectId || !content.trim()) return;

    setError(null);
    setIsResponding(true);

    try {
      // If no active thread, create one first
      let thread = activeThread;
      if (!thread) {
        const newThread = await chatOperator.createThread(projectId);
        if (!newThread) {
          throw new Error('Failed to create thread');
        }
        thread = newThread;
        setActiveThread(newThread);
        setThreads(prev => [newThread, ...prev]);
      }

      // Send user message via operator
      const userMessage = await chatOperator.sendMessage(content);
      if (!userMessage) {
        throw new Error('Failed to send message');
      }

      // Update local state with new message
      const updatedThread = chatOperator.getActiveThread();
      if (updatedThread) {
        setActiveThread(updatedThread);
      }

      // Placeholder AI response (actual AI integration in Phase 2)
      await simulateAIResponse(thread.id);

      // Refresh thread state after AI response
      const refreshedThread = await threadService.getThread(thread.id);
      if (refreshedThread) {
        setActiveThread(refreshedThread);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      console.error('[useProjectChat] Error sending message:', err);
    } finally {
      setIsResponding(false);
    }
  }, [projectId, activeThread]);

  /**
   * Create a new thread
   */
  const createThread = useCallback(async (title?: string): Promise<Thread | null> => {
    if (!projectId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const thread = await chatOperator.createThread(projectId, title);
      if (thread) {
        setActiveThread(thread);
        setThreads(prev => [thread, ...prev]);
      }
      return thread;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create thread';
      setError(message);
      console.error('[useProjectChat] Error creating thread:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * Switch to a different thread
   */
  const switchThread = useCallback(async (threadId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await chatOperator.setActiveThread(threadId);
      const thread = chatOperator.getActiveThread();
      if (thread) {
        setActiveThread(thread);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to switch thread';
      setError(message);
      console.error('[useProjectChat] Error switching thread:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a thread
   */
  const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await chatOperator.deleteThread(threadId);
      if (success) {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        
        // If we deleted the active thread, switch to the next one
        if (activeThread?.id === threadId) {
          const remaining = threads.filter(t => t.id !== threadId);
          if (remaining.length > 0) {
            await switchThread(remaining[0].id);
          } else {
            setActiveThread(null);
          }
        }
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete thread';
      setError(message);
      console.error('[useProjectChat] Error deleting thread:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeThread, threads, switchThread]);

  /**
   * Refresh threads list
   */
  const refreshThreads = useCallback(async (): Promise<void> => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const projectThreads = await chatOperator.listThreads(projectId);
      setThreads(projectThreads);
    } catch (err) {
      console.error('[useProjectChat] Error refreshing threads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * Update thread title
   */
  const updateThreadTitle = useCallback(async (threadId: string, title: string): Promise<void> => {
    setError(null);

    try {
      const result = await threadService.updateThreadTitle(threadId, title);
      if (result.success && result.data) {
        // Update in local state
        setThreads(prev => prev.map(t => t.id === threadId ? result.data! : t));
        if (activeThread?.id === threadId) {
          setActiveThread(result.data);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update thread title';
      setError(message);
      console.error('[useProjectChat] Error updating thread title:', err);
    }
  }, [activeThread]);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State
    activeThread,
    threads,
    messages,
    isLoading,
    error,
    isResponding,
    // Actions
    sendMessage,
    createThread,
    switchThread,
    deleteThread,
    refreshThreads,
    updateThreadTitle,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Simulate AI response (placeholder for Phase 2)
 *
 * In Phase 2, this will be replaced with actual AI SDK integration.
 */
async function simulateAIResponse(threadId: string): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Add placeholder AI response
  await threadService.addMessage({
    threadId,
    role: 'assistant',
    content: 'This is a placeholder AI response. AI integration will be added in Phase 2.',
    agentName: 'Assistant',
    agentModel: 'placeholder',
  });
}
