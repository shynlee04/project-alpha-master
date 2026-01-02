/**
 * @fileoverview Conversation store barrel exports
 * @module infrastructure/persistence/stores/conversation
 */

// Main store
export {
  useConversationStore,
} from './conversation-store';

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
export type { ConversationEvent, ConversationEventType } from './conversation-events-slice';

// Helpers
export {
  MAX_CONVERSATIONS,
  simpleDebounce,
  persistToDexie,
  createDebouncedPersist,
} from './conversation-helpers';
