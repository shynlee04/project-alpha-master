/**
 * @fileoverview Chat State Sync Hook
 * @module lib/events/use-chat-state-sync
 * @story E1-7 - Chat State Sharing Between Workspaces
 *
 * Hook to enable real-time chat state synchronization across workspaces.
 * When a conversation is updated in one workspace, other open workspaces
 * receive the update and can sync their local state.
 *
 * @example
 * ```tsx
 * function AgentChatPanel() {
 *   const { emitStateUpdate, lastStateUpdate } = useChatStateSync({
 *     workspaceId: 'ide',
 *     projectId,
 *     conversationId: activeConversationId,
 *     onStateUpdate: (update) => {
 *       // Handle state update from another workspace
 *       refreshConversation();
 *     },
 *   });
 *
 *   // Emit when user sends a message
 *   const handleSendMessage = () => {
 *     await sendMessage(content);
 *     emitStateUpdate('message_added', { messageId, messageContent: content });
 *   };
 * }
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import type { WorkspaceId, ChatStateUpdateEvent } from './cross-workspace-event-bus';
import { crossWorkspaceEventBus } from './cross-workspace-event-bus';

/**
 * Options for the chat state sync hook
 */
export interface UseChatStateSyncOptions {
  /** Current workspace ID */
  workspaceId: WorkspaceId;
  /** Current project ID (if applicable) */
  projectId: string | null;
  /** Current conversation ID */
  conversationId: string | null;
  /** Optional callback when state update received from another workspace */
  onStateUpdate?: (update: ChatStateUpdateEvent) => void | Promise<void>;
}

/**
 * Result of the chat state sync hook
 */
export interface UseChatStateSyncResult {
  /** Emit a state update to other workspaces */
  emitStateUpdate: (
    updateType: ChatStateUpdateEvent['updateType'],
    data: ChatStateUpdateEvent['data']
  ) => void;
  /** Last state update received (for debouncing/skipping duplicates) */
  lastStateUpdate: ChatStateUpdateEvent | null;
}

/**
 * Chat state synchronization hook
 *
 * Enables real-time chat state synchronization across workspaces.
 * When a conversation is updated in one workspace, other workspaces
 * listening to the same conversation receive the update.
 *
 * Features:
 * - Subscribe to chat state updates from other workspaces
 * - Emit state updates when local changes occur
 * - Automatic cleanup on unmount
 * - Duplicate detection (ignores updates from same workspace/conversation)
 *
 * @param options - Hook options
 * @returns Methods for chat state synchronization
 */
export function useChatStateSync({
  workspaceId,
  projectId,
  conversationId,
  onStateUpdate,
}: UseChatStateSyncOptions): UseChatStateSyncResult {
  const lastStateUpdateRef = useRef<ChatStateUpdateEvent | null>(null);

  /**
   * Handle state update from another workspace
   */
  const handleStateUpdate = useCallback((event: ChatStateUpdateEvent) => {
    // Skip updates from the same workspace (already local)
    if (event.workspaceId === workspaceId) {
      return;
    }

    // Skip updates for different conversations
    if (conversationId && event.conversationId !== conversationId) {
      return;
    }

    // Skip updates for different projects
    if (projectId !== event.projectId) {
      return;
    }

    console.log('[useChatStateSync] Received state update:', {
      from: event.workspaceId,
      updateType: event.updateType,
      conversationId: event.conversationId,
    });

    // Store for duplicate detection
    lastStateUpdateRef.current = event;

    // Call user callback
    onStateUpdate?.(event);
  }, [workspaceId, projectId, conversationId, onStateUpdate]);

  /**
   * Subscribe to chat state updates on mount
   */
  useEffect(() => {
    crossWorkspaceEventBus.onChatStateUpdate(handleStateUpdate);

    return () => {
      crossWorkspaceEventBus.offChatStateUpdate(handleStateUpdate);
    };
  }, [handleStateUpdate]);

  /**
   * Emit a state update to other workspaces
   */
  const emitStateUpdate = useCallback((
    updateType: ChatStateUpdateEvent['updateType'],
    data: ChatStateUpdateEvent['data']
  ) => {
    if (!conversationId) {
      console.warn('[useChatStateSync] Cannot emit update: no active conversation');
      return;
    }

    crossWorkspaceEventBus.emitChatStateUpdate({
      workspaceId,
      projectId,
      conversationId,
      updateType,
      data,
    });
  }, [workspaceId, projectId, conversationId]);

  return {
    emitStateUpdate,
    get lastStateUpdate() {
      return lastStateUpdateRef.current;
    },
  };
}

/**
 * Hook to emit state updates (write-only variant)
 *
 * Use this when you only need to emit updates without listening.
 */
export function useChatStateEmitter({
  workspaceId,
  projectId,
  conversationId,
}: Pick<UseChatStateSyncOptions, 'workspaceId' | 'projectId' | 'conversationId'>): {
  emitStateUpdate: UseChatStateSyncResult['emitStateUpdate'];
} {
  const emitStateUpdate = useCallback((
    updateType: ChatStateUpdateEvent['updateType'],
    data: ChatStateUpdateEvent['data']
  ) => {
    if (!conversationId) {
      console.warn('[useChatStateEmitter] Cannot emit update: no active conversation');
      return;
    }

    crossWorkspaceEventBus.emitChatStateUpdate({
      workspaceId,
      projectId,
      conversationId,
      updateType,
      data,
    });
  }, [workspaceId, projectId, conversationId]);

  return { emitStateUpdate };
}
