/**
 * @fileoverview Conversation store barrel exports
 * @module infrastructure/persistence/stores/conversation
 */

// Main store
export {
  useConversationStore,
  useConversationStoreHydration,
  useActiveConversation,
  usePendingApprovals,
} from './conversation-store';

// Types
export type {
  PendingToolApproval,
  ConversationMetadata,
  ConversationState,
  ConversationStoreState,
} from './conversation-types';

// Helpers
export {
  MAX_CONVERSATIONS,
  simpleDebounce,
  persistToDexie,
  createDebouncedPersist,
} from './conversation-helpers';
