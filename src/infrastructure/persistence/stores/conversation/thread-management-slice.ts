import { StateCreator } from 'zustand';
import type { ConversationThread } from './types';
import type { CombinedConversationState } from './types';

export interface ThreadWithId extends ConversationThread {
  id: string;
  conversationId: string;
  parentThreadId: string | null;
  isRoot: boolean;
  childThreadIds: string[];
  status: 'active' | 'archived' | 'deleted';
}

type ThreadSliceState = Pick<CombinedConversationState, 'threads' | 'activeThreadId'>;
type ThreadSliceMethods = {
  createThread: (conversationId: string, parentThreadId?: string) => string;
  deleteThread: (threadId: string) => void;
  setActiveThread: (threadId: string | null) => void;
  getThread: (threadId: string) => ThreadWithId | undefined;
  getThreadsByConversation: (conversationId: string) => ThreadWithId[];
  getRootThread: (conversationId: string) => ThreadWithId | undefined;
  getChildThreads: (parentThreadId: string) => ThreadWithId[];
  getThreadHierarchy: (threadId: string) => ThreadWithId[];
};

const generateId = () => `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createThreadManagementSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  ThreadSliceState & ThreadSliceMethods
> = (set, get) => ({
  threads: {},
  activeThreadId: null,

  createThread: (conversationId, parentThreadId) => {
    const now = Date.now();
    const id = generateId();
    const isRoot = !parentThreadId;
    const newThread: ThreadWithId = {
      id, conversationId, parentThreadId: parentThreadId || null, isRoot,
      childThreadIds: [], status: 'active', projectId: conversationId,
      title: isRoot ? 'Root Thread' : 'Child Thread', preview: '',
      messages: [], agentsUsed: [], messageCount: 0, createdAt: now, updatedAt: now,
    };
    console.log('[ThreadSlice] Creating:', id, isRoot ? '(root)' : '(child)');
    set((state) => {
      const updated = { ...state.threads, [id]: newThread };
      if (parentThreadId && state.threads[parentThreadId]) {
        const parent = state.threads[parentThreadId] as any;
        updated[parentThreadId] = { ...parent, childThreadIds: [...parent.childThreadIds, id], updatedAt: now };
      }
      return { threads: updated };
    });
    get().emitThreadCreated(id, newThread);

    // P0-4: Auto-persist conversation to IndexedDB (debounced 500ms)
    get().persistConversation();

    return id;
  },

  deleteThread: (id) => {
    const thread = get().threads[id] as any;
    if (!thread) { console.warn('[ThreadSlice] Not found:', id); return; }
    console.log('[ThreadSlice] Deleting:', id);
    const toDelete = new Set<string>([id]);
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const t = get().threads[current] as any;
      if (t?.childThreadIds) queue.push(...t.childThreadIds.filter((c: string) => !toDelete.has(c)));
      toDelete.add(current);
    }
    set((state) => {
      const updated = { ...state.threads };
      toDelete.forEach((delId) => { const t = updated[delId] as any; if (t) updated[delId] = { ...t, status: 'deleted' }; });
      if (thread.parentThreadId && state.threads[thread.parentThreadId]) {
        const parent = state.threads[thread.parentThreadId] as any;
        updated[thread.parentThreadId] = { ...parent, childThreadIds: parent.childThreadIds.filter((c: string) => c !== id), updatedAt: Date.now() };
      }
      return { threads: updated };
    });
    toDelete.forEach((delId) => get().emitThreadDeleted(delId));

    // P0-4: Auto-persist conversation to IndexedDB (debounced 500ms)
    get().persistConversation();
  },

  setActiveThread: (id) => {
    if (id && !get().threads[id]) { console.warn('[ThreadSlice] Not found:', id); return; }
    console.log('[ThreadSlice] Setting active:', id);
    set({ activeThreadId: id });
  },

  getThread: (id) => { const t = get().threads[id] as any; return t?.status !== 'deleted' ? t : undefined; },

  getThreadsByConversation: (conversationId) =>
    Object.values(get().threads).filter((t: any) => t.conversationId === conversationId && t.status !== 'deleted') as ThreadWithId[],

  getRootThread: (conversationId) => get().getThreadsByConversation(conversationId).find((t) => t.isRoot),

  getChildThreads: (parentThreadId) => {
    const parent = get().threads[parentThreadId] as any;
    return parent ? parent.childThreadIds.map((id: string) => get().threads[id] as any).filter((t: any) => t && t.status !== 'deleted') : [];
  },

  getThreadHierarchy: (threadId) => {
    const result: ThreadWithId[] = [];
    const visited = new Set<string>();
    const stack = [threadId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const thread = get().threads[current] as any;
      if (!thread || thread.status === 'deleted') continue;
      result.push(thread);
      const children = thread.childThreadIds || [];
      for (let i = children.length - 1; i >= 0; i--) if (!visited.has(children[i])) stack.push(children[i]);
    }
    return result;
  },
});
