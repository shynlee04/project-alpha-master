/**
 * @fileoverview useChatPlugin Hook
 * @module plugins/chat/useChatPlugin
 *
 * **ARCH-02-08**: Chat Plugin Hook
 *
 * Hook for accessing ProjectContext in Chat plugin.
 * Provides direct access to project context for tool operations.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-08
 * @team Team A
 * @created 2026-01-21
 */

import { useContext } from 'react';
import { ProjectContext } from '@/infrastructure/context/project-context';

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Chat plugin context
 *
 * @remarks
 * Provides access to ProjectContext for Chat plugin.
 * Includes project metadata, storage gateway, and tool execution services.
 *
 * For POC, this is a thin wrapper around ProjectContext.
 * In full implementation, this would provide chat-specific services:
 * - Tool execution facades
 * - Thread management helpers
 * - Conversation state accessors
 */
export interface ChatPluginContext {
  /** Project ID for thread persistence */
  projectId?: string;

  /** Project name for system prompt */
  projectName?: string;

  /** Storage type for feature detection */
  storageType?: 'fsa' | 'indexeddb';

  /** Device type for responsive behavior */
  deviceType?: 'desktop' | 'mobile';

  /** Whether chat service is available */
  hasChatService?: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useChatPlugin Hook
 *
 * @returns Chat plugin context with project information
 *
 * @remarks
 * Hook for accessing ProjectContext in Chat plugin.
 * Provides direct access to gateway and tool operations.
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { projectId, projectName, hasChatService } = useChatPlugin();
 *
 *   if (!hasChatService) {
 *     return <div>Chat not available</div>;
 *   }
 *
 *   return <AgentChatPanel projectId={projectId} projectName={projectName} />;
 * }
 * ```
 */
export function useChatPlugin(): ChatPluginContext {
  const context = useContext(ProjectContext);

  // Extract chat-specific context from ProjectContext
  // For POC, we provide minimal context
  // In full implementation, this would include:
  // - Tool execution service
  // - Thread management functions
  // - Conversation state hooks

  if (!context) {
    return {
      projectId: undefined,
      projectName: undefined,
      storageType: undefined,
      deviceType: undefined,
      hasChatService: false,
    };
  }

  return {
    projectId: context.project?.id,
    projectName: context.project?.name,
    storageType: context.project?.storageType,
    deviceType: context.project?.deviceType === 'tablet' ? 'desktop' : context.project?.deviceType,
    hasChatService: !!context.chatService,
  };
}
