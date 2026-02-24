/**
 * @fileoverview Conversation store barrel exports
 * @module infrastructure/persistence/stores/conversation
 */

// Main store
export {
  useConversationStore,
} from './conversation-store';

// Re-export hydration hook with consistent naming (matches agents store pattern)
export {
  useHasHydrated as useConversationStoreHydration,
} from './useConversationStore';

// Re-export convenience hooks
export {
  useActiveConversation,
  usePendingApprovals,
} from './useConversationStore';

// Types
export type {
  PendingToolApproval,
  ConversationMetadata,
  ConversationState,
  ConversationStoreState,
} from './conversation-types';

export type {
  ThreadMessage,
  ConversationThread,
  ThreadHierarchyNode,
  ContextWindowConfig,
} from './types';

export type { ValidationResult } from './conversation-validation-slice';
export type { ConversationEvent, ConversationEventType } from './event-types';

// Helpers
export {
  MAX_CONVERSATIONS,
  simpleDebounce,
  persistToDexie,
  createDebouncedPersist,
} from './conversation-helpers';
