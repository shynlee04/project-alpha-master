import { ThreadWithId } from '../thread-management-slice';
import { createTestConversationStore } from './test-helper';

vi.mock('@/lib/state/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

const createTestStore = createTestConversationStore;

describe('Thread Management Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should create root thread', () => {
    const threadId = store.getState().createThread('conv-1');

    const thread = store.getState().getThread(threadId);
    expect(thread).toBeDefined();
    expect(thread?.id).toBe(threadId);
    expect(thread?.conversationId).toBe('conv-1');
    expect(thread?.isRoot).toBe(true);
    expect(thread?.parentThreadId).toBeNull();
  });

  it('should create child thread', () => {
    const parentId = store.getState().createThread('conv-1');
    const childId = store.getState().createThread('conv-1', parentId);

    const child = store.getState().getThread(childId);
    expect(child?.isRoot).toBe(false);
    expect(child?.parentThreadId).toBe(parentId);

    const parent = store.getState().getThread(parentId);
    expect(parent?.childThreadIds).toContain(childId);
  });

  it('should delete thread', () => {
    const threadId = store.getState().createThread('conv-1');
    store.getState().deleteThread(threadId);

    const deleted = store.getState().getThread(threadId);
    expect(deleted).toBeUndefined();
  });

  it('should cascade delete to children', () => {
    const rootId = store.getState().createThread('conv-1');
    const child1Id = store.getState().createThread('conv-1', rootId);
    const child2Id = store.getState().createThread('conv-1', rootId);
    const grandchildId = store.getState().createThread('conv-1', child1Id);

    store.getState().deleteThread(rootId);

    expect(store.getState().getThread(rootId)).toBeUndefined();
    expect(store.getState().getThread(child1Id)).toBeUndefined();
    expect(store.getState().getThread(child2Id)).toBeUndefined();
    expect(store.getState().getThread(grandchildId)).toBeUndefined();
  });

  it('should set active thread', () => {
    const threadId = store.getState().createThread('conv-1');
    store.getState().setActiveThread(threadId);

    expect(store.getState().activeThreadId).toBe(threadId);
  });

  it('should set active thread to null', () => {
    const threadId = store.getState().createThread('conv-1');
    store.getState().setActiveThread(threadId);
    store.getState().setActiveThread(null);

    expect(store.getState().activeThreadId).toBeNull();
  });

  it('should get thread by ID', () => {
    const threadId = store.getState().createThread('conv-1');
    const thread = store.getState().getThread(threadId);

    expect(thread).toBeDefined();
    expect(thread?.id).toBe(threadId);
  });

  it('should get threads by conversation', () => {
    store.getState().createThread('conv-1');
    store.getState().createThread('conv-1');
    store.getState().createThread('conv-2');

    const conv1Threads = store.getState().getThreadsByConversation('conv-1');
    expect(conv1Threads).toHaveLength(2);
    expect(conv1Threads.every(t => t.conversationId === 'conv-1')).toBe(true);
  });

  it('should get root thread', () => {
    const rootId = store.getState().createThread('conv-1');
    store.getState().createThread('conv-1', rootId);

    const root = store.getState().getRootThread('conv-1');
    expect(root).toBeDefined();
    expect(root?.id).toBe(rootId);
    expect(root?.isRoot).toBe(true);
  });

  it('should get child threads', () => {
    const parentId = store.getState().createThread('conv-1');
    const child1Id = store.getState().createThread('conv-1', parentId);
    const child2Id = store.getState().createThread('conv-1', parentId);

    const children = store.getState().getChildThreads(parentId);
    expect(children).toHaveLength(2);
    expect(children.map(t => t.id).sort()).toEqual([child1Id, child2Id].sort());
  });

  it('should get thread hierarchy (depth 1)', () => {
    const rootId = store.getState().createThread('conv-1');
    const child1Id = store.getState().createThread('conv-1', rootId);
    const child2Id = store.getState().createThread('conv-1', rootId);

    const hierarchy = store.getState().getThreadHierarchy(rootId);
    expect(hierarchy).toHaveLength(3);
    expect(hierarchy[0].id).toBe(rootId);
    expect(hierarchy.slice(1).map(t => t.id).sort()).toEqual([child1Id, child2Id].sort());
  });

  it('should get thread hierarchy (depth 2)', () => {
    const rootId = store.getState().createThread('conv-1');
    const child1Id = store.getState().createThread('conv-1', rootId);
    const child2Id = store.getState().createThread('conv-1', rootId);
    const grandchild1Id = store.getState().createThread('conv-1', child1Id);
    const grandchild2Id = store.getState().createThread('conv-1', child1Id);

    const hierarchy = store.getState().getThreadHierarchy(rootId);
    const ids = hierarchy.map(t => t.id);

    expect(ids).toContain(rootId);
    expect(ids).toContain(child1Id);
    expect(ids).toContain(child2Id);
    expect(ids).toContain(grandchild1Id);
    expect(ids).toContain(grandchild2Id);
  });

  it('should maintain thread metadata structure', () => {
    const threadId = store.getState().createThread('conv-1');

    const thread = store.getState().getThread(threadId);

    expect(thread?.id).toBeDefined();
    expect(thread?.conversationId).toBeDefined();
    expect(thread?.parentThreadId).toBeDefined();
    expect(thread?.isRoot).toBeDefined();
    expect(thread?.childThreadIds).toBeDefined();
    expect(thread?.status).toBeDefined();
    expect(thread?.projectId).toBeDefined();
    expect(thread?.title).toBeDefined();
    expect(thread?.preview).toBeDefined();
    expect(thread?.messages).toBeDefined();
    expect(thread?.agentsUsed).toBeDefined();
    expect(thread?.messageCount).toBeDefined();
    expect(thread?.createdAt).toBeDefined();
    expect(thread?.updatedAt).toBeDefined();
  });

  it('should validate thread timestamps', () => {
    const threadId = store.getState().createThread('conv-1');
    const thread = store.getState().getThread(threadId) as ThreadWithId;

    expect(thread.createdAt).toBeGreaterThan(0);
    expect(thread.updatedAt).toBeGreaterThan(0);
    expect(thread.updatedAt).toBe(thread.createdAt);
  });
});
