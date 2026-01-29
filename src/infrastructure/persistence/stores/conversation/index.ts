/**
 * PHASE 2 STUB: Conversation Store Barrel
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/conversation/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export { useConversationStore, getConversationStoreState } from './conversation-store';
export { useConversationStoreHydration, useActiveConversation, usePendingApprovals } from './useConversationStore';
export type { 
  PendingToolApproval, 
  ConversationMetadata, 
  ConversationMetadataWithId,
  ConversationMetadataExtended,
  ConversationState, 
  ConversationStoreState 
} from './conversation-types';
export type { ThreadMessage, ConversationThread, ThreadHierarchyNode, ContextWindowConfig } from './types';
export type { ValidationResult } from './conversation-validation-slice';
export type { ConversationEvent, ConversationEventType } from './event-types';
export { MAX_CONVERSATIONS, simpleDebounce, persistToDexie, createDebouncedPersist } from './conversation-helpers';
