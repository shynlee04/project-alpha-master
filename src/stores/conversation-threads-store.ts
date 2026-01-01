/**
 * Conversation Threads Store Facade - Legacy Location
 *
 * Re-exports from the new location for backward compatibility.
 * This file maintains zero breaking changes for existing imports.
 *
 * @deprecated Import from @/infrastructure/persistence/stores/conversation/conversation-threads-store instead
 * @story AC-1.9 - Migrate conversation threads store to infrastructure layer
 */

// Re-export everything from the new location
export {
  useThreadsStore,
  useActiveThread,
  useProjectThreads,
  useThreadsHydration,
  useThreadHierarchy,
  useThreadDescendants,
  useCreateChildThread,
  useMoveThread,
  useUpdateThreadFolder,
  usePruneContextWindow,
} from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

// Re-export types
export type {
  ThreadMessage,
  ThreadToolCall,
  ContextWindowConfig,
  ConversationThread,
  ThreadHierarchyNode,
  ThreadsState,
} from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';
