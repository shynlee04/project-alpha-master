/**
 * @fileoverview Chat Store Barrel Export
 * @module infrastructure/persistence/stores/chat
 * @governance E1-8 | EPIC-40 MM-01 | ADR-031
 *
 * Centralized exports for all chat-related stores.
 * Includes both chat settings (E1-8) and unified chat store (MM-01).
 *
 * @since 2026-01-10 - Added unified chat store exports
 */

// ============================================================================
// Chat Settings Store (E1-8)
// ============================================================================

export { useChatSettingsStore } from './chat-settings-store';
export type {
  WorkspaceChatSettings,
  WorkspaceType as ChatSettingsWorkspaceType,
} from './chat-settings-store';
export { DEFAULT_CHAT_SETTINGS } from './chat-settings-store';
export {
  useWorkspaceChatSettings,
  useChatSettingsActions,
  getChatSettingsState,
} from './chat-settings-store';

// ============================================================================
// Unified Chat Store (MM-01)
// ============================================================================

export {
  useUnifiedChatStore,
  useActiveChatConversation,
  useActiveChatThread,
  useActiveThreadMessages,
  usePendingToolApprovals,
  useUnifiedChatHasHydrated,
  getUnifiedChatStoreState,
  subscribeToUnifiedChatStore,
} from './unified-chat-store';

export type {
  CombinedUnifiedChatState,
  ChatConversation,
  ChatMessage,
  ChatThread,
  ToolCall,
  ToolApproval,
  ThreadHierarchyNode,
  ContextWindowConfig,
  ConversationState as ChatConversationState,
  WorkspaceType,
  MessageRole,
  ToolCallStatus,
  ToolApprovalStatus,
} from './unified-chat-store';

// Re-export domain entities for convenience
export type {
  ChatConversation as ChatConversationEntity,
  ChatMessage as ChatMessageEntity,
  ChatThread as ChatThreadEntity,
} from '@/domain/entities/chat';
