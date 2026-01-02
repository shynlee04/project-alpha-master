/**
 * @fileoverview Conversation Store Re-export (Canonical Location)
 * @module infrastructure/persistence/stores/conversation/conversation-store
 *
 * Ralph Loop Migration (2026-01-03):
 * Migrated from lib/state/conversation-store.ts (626 lines god store)
 * to unified useConversationStore (6 slices, all <180 lines each).
 *
 * This file re-exports from the new unified store for backward compatibility
 * during the consumer migration phase.
 *
 * @see useConversationStore.ts for actual implementation
 */

export {
    useConversationStore,
    type ConversationStoreState,
} from './useConversationStore';

// Re-export commonly used hooks for convenience
export type {
    ThreadMessage,
    ConversationThread,
    ThreadHierarchyNode,
    ContextWindowConfig,
} from './types';

export type { ValidationResult } from './conversation-validation-slice';
export type { ConversationEvent, ConversationEventType } from './conversation-events-slice';
