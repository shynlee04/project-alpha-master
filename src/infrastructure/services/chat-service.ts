/**
 * @fileoverview Chat Service - Placeholder for chat functionality
 * @module infrastructure/services/chat-service
 *
 * **ARCH-02-08**: Convert Chat to Plugin (will implement)
 *
 * Per ADR-034 Decision D3:
 * Single chat service instance per project.
 * Shared across all plugins for unified chat experience.
 *
 * @remarks
 * This is a placeholder type.
 * Full implementation will be in ARCH-02-08.
 *
 * For now, ProjectContext will have chatService: null,
 * which plugins should handle gracefully.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-08 (future)
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Placeholder Type
// ============================================================================

/**
 * Chat Service (Placeholder)
 *
 * @remarks
 * Will be implemented in ARCH-02-08.
 * Provides:
 * - Chat history management
 * - Tool execution
 * - Thread persistence
 * - Message sending/receiving
 *
 * For now, this is a placeholder to satisfy TypeScript.
 */
export interface ChatService {
  // Placeholder - methods will be defined in ARCH-02-08
  sendMessage: (message: string) => Promise<void>;
  getMessages: () => any[];
  clearHistory: () => void;
}

// ============================================================================
// Null Instance
// ============================================================================

/**
 * Null chat service instance
 *
 * @remarks
 * Used in ProjectContext before ARCH-02-08 implementation.
 * Plugins should check for null and handle gracefully.
 */
export const NULL_CHAT_SERVICE: ChatService = {
  sendMessage: async () => {
    console.warn('[ChatService] sendMessage called but not implemented yet');
  },
  getMessages: () => [],
  clearHistory: () => {
    console.warn('[ChatService] clearHistory called but not implemented yet');
  },
};
