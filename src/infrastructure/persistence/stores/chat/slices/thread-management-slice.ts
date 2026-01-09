/**
 * @fileoverview Thread Management Slice
 * @module infrastructure/persistence/stores/chat/slices
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Thread hierarchy and lifecycle management for unified chat store.
 * Supports cascade flow with parent-child relationships.
 *
 * @story MM-01: Create Unified Chat Store
 * @created 2026-01-10
 */

import { StateCreator } from 'zustand';
import type { CombinedUnifiedChatState, ThreadWithId } from '../unified-chat-types';

// Slice state (subset of CombinedUnifiedChatState)
type ThreadManagementSliceState = Pick<CombinedUnifiedChatState,
  'threads' | 'activeThreadId'
>;

// Slice methods
type ThreadManagementSliceMethods = {
  createThread: (conversationId: string, parentThreadId?: string) => string;
  deleteThread: (threadId: string) => void;
  setActiveThread: (threadId: string | null) => void;
  getThread: (threadId: string) => ThreadWithId | undefined;
  getThreadsByConversation: (conversationId: string) => ThreadWithId[];
  getRootThread: (conversationId: string) => ThreadWithId | undefined;
  getChildThreads: (parentThreadId: string) => ThreadWithId[];
  getThreadHierarchy: (threadId: string) => ThreadWithId[];
};

/**
 * Generate cryptographically unique thread ID
 * CA-003 FIX: Uses crypto.randomUUID() instead of Math.random()
 * Falls back to timestamp + random for SSR compatibility
 */
const generateId = () => {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return `thread_${uuid}`;
};

export const createThreadManagementSlice: StateCreator<
  CombinedUnifiedChatState,
  [],
  [],
  ThreadManagementSliceState & ThreadManagementSliceMethods
> = (set, get) => ({
  threads: {},
  activeThreadId: null,

  createThread: (conversationId, parentThreadId) => {
    const now = Date.now();
    const threadId = generateId();
    const isRoot = !parentThreadId;
    const conversation = get().conversations[conversationId];

    const newThread: ThreadWithId = {
      id: threadId,
      conversationId,
      projectId: conversation?.projectId || '',
      workspaceId: conversation?.workspaceType,
      title: isRoot ? 'Main Thread' : 'New Thread',
      preview: '',
      parentThreadId: parentThreadId || null,
      childThreadIds: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      isRoot,
    };

    console.log('[ThreadManagementSlice] Creating:', threadId, {
      conversationId,
      parentThreadId,
    });

    set((state) => ({
      threads: { ...state.threads, [threadId]: newThread },
      activeThreadId: threadId,
    }));

    // Update parent's child list if not root
    if (parentThreadId) {
      const parent = get().threads[parentThreadId];
      if (parent) {
        set((state) => ({
          threads: {
            ...state.threads,
            [parentThreadId]: {
              ...parent,
              childThreadIds: [...(parent.childThreadIds || []), threadId],
              updatedAt: now,
            },
          },
        }));
      }
    }

    get().persistConversation();
    return threadId;
  },

  deleteThread: (threadId) => {
    console.log('[ThreadManagementSlice] Soft-deleting:', threadId);
    const thread = get().threads[threadId];
    if (!thread) return;

    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: { ...thread, status: 'deleted', updatedAt: Date.now() },
      },
    }));
    get().persistConversation();
  },

  setActiveThread: (threadId) => {
    if (!threadId) {
      console.log('[ThreadManagementSlice] Clearing active thread');
      set({ activeThreadId: null });
      return;
    }
    const thread = get().threads[threadId];
    if (!thread) { console.warn('[ThreadManagementSlice] Not found:', threadId); return; }
    console.log('[ThreadManagementSlice] Setting active:', threadId);
    set({ activeThreadId: threadId });
  },

  getThread: (threadId) => get().threads[threadId],

  getThreadsByConversation: (conversationId) =>
    Object.values(get().threads).filter(
      (t) => t.conversationId === conversationId && t.status !== 'deleted'
    ),

  getRootThread: (conversationId) =>
    Object.values(get().threads).find(
      (t) => t.conversationId === conversationId && t.isRoot && t.status !== 'deleted'
    ),

  getChildThreads: (parentThreadId) =>
    Object.values(get().threads).filter(
      (t) => t.parentThreadId === parentThreadId && t.status !== 'deleted'
    ),

  getThreadHierarchy: (threadId) => {
    // Returns flattened list of thread and all descendants
    const thread = get().threads[threadId];
    if (!thread || thread.status === 'deleted') return [];

    const result: ThreadWithId[] = [thread];
    const children = thread.childThreadIds || [];

    for (const childId of children) {
      result.push(...get().getThreadHierarchy(childId));
    }

    return result;
  },
});
