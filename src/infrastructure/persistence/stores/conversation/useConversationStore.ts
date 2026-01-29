/**
 * PHASE 2 STUB: Conversation Store Hooks
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/conversation/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

// Re-export store and helper
export { useConversationStore, getConversationStoreState } from './conversation-store';

// Re-export all types from types.ts
export type { ThreadMessage, ConversationThread, ThreadHierarchyNode, ContextWindowConfig } from './types';

// Re-export all types from conversation-types.ts
export type { 
  ConversationMetadataWithId, 
  ConversationMetadataExtended,
  ConversationMetadata,
  ConversationState,
  PendingToolApproval
} from './conversation-types';

import { useConversationStore } from './conversation-store';

export function useHasHydrated(): boolean {
  return useConversationStore((s) => s._hasHydrated);
}

export const useConversationStoreHydration = useHasHydrated;

export function useActiveConversation(): null {
  return null;
}

export function usePendingApprovals(): [] {
  return [];
}
