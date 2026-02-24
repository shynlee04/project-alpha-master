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
  updateThread: (threadId: string, updates: Partial<Omit<ThreadWithId, 'id' | 'conversationId' | 'createdAt'>>) => void;
  /** CHAT-006: Archive a thread (sets status to 'archived') */
  archiveThread: (threadId: string) => void;
  /** CHAT-006: Unarchive a thread (sets status back to 'active') */
  unarchiveThread: (threadId: string) => void;
  setActiveThread: (threadId: string | null) => void;
  getThread: (threadId: string) => ThreadWithId | undefined;
  getThreadsByConversation: (conversationId: string) => ThreadWithId[];
  getThreadsByWorkspace: (workspaceType: ThreadWithId['workspaceType']) => ThreadWithId[];
  getRootThread: (conversationId: string) => ThreadWithId | undefined;
  getChildThreads: (parentThreadId: string) => ThreadWithId[];
  getThreadHierarchy: (threadId: string) => ThreadWithId[];
};

/**
 * Generate cryptographically unique thread ID
 * CA-003 FIX: Uses crypto.randomUUID() with high-entropy fallback
 * Fallback combines timestamp + counter + random for SSR compatibility
 */
let idCounter = 0;
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `thread_${crypto.randomUUID()}`;
  }
  // High-entropy fallback: timestamp + counter + random
  const randomPart = Math.random().toString(36).substring(2, 11);
  const counterPart = (idCounter++).toString(36);
  return `thread_${Date.now()}_${counterPart}_${randomPart}`;
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

    // CHAT-005: Validate workspace association
    if (!conversation?.workspaceType) {
      console.warn('[ThreadManagementSlice] Conversation missing workspaceType:', conversationId);
    }

    const newThread: ThreadWithId = {
      id: threadId,
      conversationId,
      projectId: conversation?.projectId || '',
      workspaceType: conversation?.workspaceType,
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
      workspaceType: conversation?.workspaceType,
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

  // CHAT-005: Update thread (title, status, etc.) with workspace validation
  updateThread: (threadId, updates) => {
    const thread = get().threads[threadId];
    if (!thread) {
      console.warn('[ThreadManagementSlice] Thread not found for update:', threadId);
      return;
    }

    // CHAT-005: Don't allow updates to deleted threads
    if (thread.status === 'deleted') {
      console.warn('[ThreadManagementSlice] Cannot update deleted thread:', threadId);
      return;
    }

    // CHAT-005: Workspace validation - don't allow cross-workspace updates
    if (thread.workspaceType && updates.workspaceType && thread.workspaceType !== updates.workspaceType) {
      console.warn('[ThreadManagementSlice] Cannot change thread workspace:', {
        current: thread.workspaceType,
        attempted: updates.workspaceType,
      });
      return;
    }

    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: {
          ...thread,
          ...updates,
          updatedAt: Date.now(),
        },
      },
    }));
    get().persistConversation();
  },

  // CHAT-006: Archive a thread (sets status to 'archived')
  archiveThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) {
      console.warn('[ThreadManagementSlice] Thread not found for archive:', threadId);
      return;
    }

    // Cannot archive deleted threads
    if (thread.status === 'deleted') {
      console.warn('[ThreadManagementSlice] Cannot archive deleted thread:', threadId);
      return;
    }

    // Already archived
    if (thread.status === 'archived') {
      console.log('[ThreadManagementSlice] Thread already archived:', threadId);
      return;
    }

    console.log('[ThreadManagementSlice] Archiving thread:', threadId);
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: {
          ...thread,
          status: 'archived',
          updatedAt: Date.now(),
        },
      },
    }));
    get().persistConversation();
  },

  // CHAT-006: Unarchive a thread (sets status back to 'active')
  unarchiveThread: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) {
      console.warn('[ThreadManagementSlice] Thread not found for unarchive:', threadId);
      return;
    }

    // Cannot unarchive deleted threads
    if (thread.status === 'deleted') {
      console.warn('[ThreadManagementSlice] Cannot unarchive deleted thread:', threadId);
      return;
    }

    // Not archived
    if (thread.status !== 'archived') {
      console.log('[ThreadManagementSlice] Thread is not archived:', threadId);
      return;
    }

    console.log('[ThreadManagementSlice] Unarchiving thread:', threadId);
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: {
          ...thread,
          status: 'active',
          updatedAt: Date.now(),
        },
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
    // FIX: Hydration guard - prevent access before store is ready
    const state = get();
    if (!state.threads) {
      console.warn('[ThreadManagementSlice] Store not hydrated yet, deferring setActiveThread:', threadId);
      // Defer until hydration completes
      setTimeout(() => get().setActiveThread(threadId), 50);
      return;
    }
    const thread = state.threads[threadId];
    if (!thread) { console.warn('[ThreadManagementSlice] Not found:', threadId); return; }
    console.log('[ThreadManagementSlice] Setting active:', threadId);
    set({ activeThreadId: threadId });
  },

  getThread: (threadId) => get().threads[threadId],

  getThreadsByConversation: (conversationId) =>
    Object.values(get().threads).filter(
      (t) => t.conversationId === conversationId && t.status !== 'deleted'
    ),

  // CHAT-005: Get threads by workspace type (following getConversationsByWorkspace pattern)
  getThreadsByWorkspace: (workspaceType) =>
    Object.values(get().threads).filter(
      (t) => t.workspaceType === workspaceType && t.status !== 'deleted'
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
