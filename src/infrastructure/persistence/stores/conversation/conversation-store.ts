/**
 * PHASE 2 STUB: Conversation Store
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/conversation/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import { create } from 'zustand';
import type { ConversationState, ConversationMetadataWithId } from './conversation-types';

export const useConversationStore = create<ConversationState>()(() => ({
  conversations: {},
  activeConversationId: null,
  pendingApprovals: [],
  _hasHydrated: true,
  activeThreadId: null,
  threads: {},
  getConversation: () => null,
  getConversationsByProject: () => [],
  getConversationsByWorkspace: () => [],
  setActiveConversation: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - setActiveConversation skipped');
  },
  createConversation: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - createConversation skipped');
    return '';
  },
  loadConversationByProject: async () => {
    console.log('[ConversationStore STUB] Phase 2 feature - loadConversationByProject skipped');
  },
  deleteConversation: async () => {
    console.log('[ConversationStore STUB] Phase 2 feature - deleteConversation skipped');
  },
  addMessage: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - addMessage skipped');
  },
  updateMessage: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - updateMessage skipped');
  },
  setHasHydrated: () => {},
  reset: () => {},
  // Additional stub methods for compatibility
  getAllConversations: (): ConversationMetadataWithId[] => {
    console.log('[ConversationStore STUB] Phase 2 feature - getAllConversations skipped');
    return [];
  },
  updateConversationMetadata: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - updateConversationMetadata skipped');
  },
  searchConversations: (): ConversationMetadataWithId[] => {
    console.log('[ConversationStore STUB] Phase 2 feature - searchConversations skipped');
    return [];
  },
  searchConversationsByTag: (): ConversationMetadataWithId[] => {
    console.log('[ConversationStore STUB] Phase 2 feature - searchConversationsByTag skipped');
    return [];
  },
  getCurrentConversation: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - getCurrentConversation skipped');
    return null;
  },
  persistConversation: async () => {
    console.log('[ConversationStore STUB] Phase 2 feature - persistConversation skipped');
  },
  setActiveThread: () => {
    console.log('[ConversationStore STUB] Phase 2 feature - setActiveThread skipped');
  },
}));

// Export getConversationStoreState for compatibility
export function getConversationStoreState() {
  return useConversationStore.getState();
}
