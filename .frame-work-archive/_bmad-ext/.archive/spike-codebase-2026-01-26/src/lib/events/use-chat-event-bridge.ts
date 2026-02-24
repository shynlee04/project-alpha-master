/**
 * @fileoverview Chat Event Bridge Hook
 * @module lib/events/use-chat-event-bridge
 * @story E1-5 - Wire Up Cross-Workspace Event Bus
 *
 * Custom hook to bridge chat components with the cross-workspace event bus.
 * Handles event emission when messages are sent and listens for workspace changes.
 *
 * @example
 * ```tsx
 * function AgentChatPanel({ workspaceType, projectId, agentId }) {
 *   const { emitMessageSent } = useChatEventBridge({
 *     workspaceId: workspaceType,
 *     projectId,
 *     agentId,
 *     conversationId,
 *     onWorkspaceChange: (event) => {
 *       console.log('Workspace changed:', event);
 *       // Save conversation before switching
 *       // Update UI for new workspace
 *     }
 *   });
 *
 *   const handleSendMessage = (content: string) => {
 *     sendMessage(content);
 *     emitMessageSent(content);
 *   };
 * }
 * ```
 */

import { useEffect, useCallback, useRef } from 'react';
import { crossWorkspaceEventBus } from './cross-workspace-event-bus';
import type { WorkspaceId, WorkspaceChangeEvent } from './cross-workspace-event-bus';

/**
 * Options for the chat event bridge hook
 */
export interface UseChatEventBridgeOptions {
  /** Current workspace ID */
  workspaceId: WorkspaceId;
  /** Current project ID (if applicable) */
  projectId: string | null;
  /** Current agent ID (if applicable) */
  agentId: string | null;
  /** Current conversation ID (if applicable) */
  conversationId: string | null;
  /** Optional callback when workspace changes */
  onWorkspaceChange?: (event: WorkspaceChangeEvent) => void;
}

/**
 * Result of the chat event bridge hook
 */
export interface UseChatEventBridgeResult {
  /** Emit a chat message sent event */
  emitMessageSent: (messageContent: string) => void;
}

/**
 * Chat event bridge hook
 *
 * Connects chat components to the cross-workspace event bus.
 * Emits events when messages are sent and subscribes to workspace changes.
 *
 * Features:
 * - Automatic cleanup on unmount (prevents memory leaks)
 * - Message preview truncation (max 100 chars for logging)
 * - Stable function references (useCallback)
 *
 * @param options - Hook options
 * @returns Methods for emitting chat events
 */
export function useChatEventBridge({
  workspaceId,
  projectId,
  agentId,
  conversationId,
  onWorkspaceChange,
}: UseChatEventBridgeOptions): UseChatEventBridgeResult {
  // Store listener ref to avoid re-subscribing
  const workspaceChangeListenerRef = useRef<((event: WorkspaceChangeEvent) => void) | null>(null);

  // Set up workspace change listener
  useEffect(() => {
    const listener = (event: WorkspaceChangeEvent) => {
      console.log('[useChatEventBridge] Workspace changed:', event);
      onWorkspaceChange?.(event);
    };

    // Subscribe to workspace changes
    crossWorkspaceEventBus.onWorkspaceChanged(listener);
    workspaceChangeListenerRef.current = listener;

    // Cleanup on unmount
    return () => {
      if (workspaceChangeListenerRef.current) {
        crossWorkspaceEventBus.offWorkspaceChanged(workspaceChangeListenerRef.current);
        workspaceChangeListenerRef.current = null;
      }
    };
  }, [onWorkspaceChange]);

  // Emit chat message sent event
  const emitMessageSent = useCallback((messageContent: string) => {
    // Truncate message preview for logging (max 100 chars)
    const messagePreview = messageContent.length > 100
      ? messageContent.slice(0, 97) + '...'
      : messageContent;

    crossWorkspaceEventBus.emitChatMessageSent({
      workspaceId,
      projectId,
      agentId,
      conversationId,
      messagePreview,
      messageLength: messageContent.length,
    });
  }, [workspaceId, projectId, agentId, conversationId]);

  return {
    emitMessageSent,
  };
}
