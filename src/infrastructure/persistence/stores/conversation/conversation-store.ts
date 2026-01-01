/**
 * @fileoverview Conversation Store Re-export
 * @module infrastructure/persistence/stores/conversation/conversation-store
 *
 * Re-exports the conversation store from the canonical location
 * at lib/state/conversation-store.ts for backward compatibility
 * and clean architecture layer access.
 */

export {
    useConversationStore,
    useConversationStoreHydration,
    useActiveConversation,
    usePendingApprovals,
} from '@/lib/state/conversation-store';

export type {
    PendingToolApproval,
    ConversationMetadata,
    ConversationState,
} from '@/lib/state/conversation-store';
