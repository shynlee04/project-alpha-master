import { create } from 'zustand';
import type { CombinedConversationState } from '../types';
import { createConversationUtilsSlice } from '../conversation-utils-slice';
import { createConversationMetadataSlice } from '../conversation-metadata-slice';
import { createThreadManagementSlice } from '../thread-management-slice';
import { createMessageCrudSlice } from '../message-crud-slice';
import { createConversationEventsSlice } from '../conversation-events-slice';

vi.mock('@/lib/state/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

const createTestStore = () => create<CombinedConversationState>()((set, get, api) => ({
  ...createConversationMetadataSlice(set, get, api),
  ...createThreadManagementSlice(set, get, api),
  ...createMessageCrudSlice(set, get, api),
  ...createConversationUtilsSlice(set, get, api),
  ...createConversationEventsSlice(set, get, api),
}));

describe('Conversation Utils Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should filter conversations by predicate', () => {
    const id1 = store.getState().createConversation('ide', null, 'agent-1');
    const id2 = store.getState().createConversation('knowledge', null, 'agent-2');
    const id3 = store.getState().createConversation('ide', null, 'agent-3');

    store.getState().updateConversationMetadata(id1, { title: 'Important' });
    store.getState().updateConversationMetadata(id2, { title: 'Work' });
    store.getState().updateConversationMetadata(id3, { title: 'Personal' });

    const ideConversations = store.getState().filterConversations((c) => c.workspaceType === 'ide');

    expect(ideConversations).toHaveLength(2);
    expect(ideConversations.every(c => c.workspaceType === 'ide')).toBe(true);
  });

  it('should sort conversations by date', () => {
    const id1 = store.getState().createConversation('ide', null, 'agent-1');
    const id2 = store.getState().createConversation('knowledge', null, 'agent-2');

    store.getState().updateConversationMetadata(id1, { title: 'First' });
    store.getState().updateConversationMetadata(id2, { title: 'Second' });

    const sorted = store.getState().sortConversations((a, b) =>
      a.title!.localeCompare(b.title!)
    );

    expect(sorted[0].title).toBe('First');
    expect(sorted[1].title).toBe('Second');
  });

  it('should search conversations by title', () => {
    const id1 = store.getState().createConversation('ide', null, 'agent-1');
    const id2 = store.getState().createConversation('knowledge', null, 'agent-2');
    const id3 = store.getState().createConversation('study', null, 'agent-3');

    store.getState().updateConversationMetadata(id1, { title: 'Project Alpha' });
    store.getState().updateConversationMetadata(id2, { title: 'Meeting Notes' });
    store.getState().updateConversationMetadata(id3, { title: 'Alpha Testing' });

    const results = store.getState().searchConversations('alpha');

    expect(results).toHaveLength(2);
    expect(results.every(r => r.title?.toLowerCase().includes('alpha'))).toBe(true);
  });

  it('should search conversations by tag', () => {
    const id1 = store.getState().createConversation('ide', null, 'agent-1');
    const id2 = store.getState().createConversation('knowledge', null, 'agent-2');
    const id3 = store.getState().createConversation('study', null, 'agent-3');

    store.getState().updateConversationMetadata(id1, { tags: ['important', 'work'] });
    store.getState().updateConversationMetadata(id2, { tags: ['important'] });
    store.getState().updateConversationMetadata(id3, { tags: ['personal'] });

    const results = store.getState().searchConversationsByTag(['important', 'personal']);

    expect(results).toHaveLength(3);
  });

  it('should search conversations case-insensitive', () => {
    const id1 = store.getState().createConversation('ide', null, 'agent-1');
    store.getState().updateConversationMetadata(id1, { title: 'Project ALPHA' });

    const results = store.getState().searchConversations('alpha');

    expect(results).toHaveLength(1);
  });

  it('should get conversation stats', () => {
    const convId = store.getState().createConversation('ide', null, 'agent-1');
    const threadId = store.getState().createThread(convId);
    const threadId2 = store.getState().createThread(convId);

    store.getState().addMessage(threadId, { role: 'user', content: 'Hello world!' });
    store.getState().addMessage(threadId, { role: 'assistant', content: 'Hi there!' });
    store.getState().addMessage(threadId2, { role: 'user', content: 'Another thread' });

    const stats = store.getState().getConversationStats(convId);

    expect(stats.threadCount).toBe(2);
    expect(stats.messageCount).toBe(3);
    expect(stats.totalTokens).toBeGreaterThan(0);
  });

  it('should get recent conversations with default limit', () => {
    for (let i = 0; i < 15; i++) {
      const id = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().updateConversationMetadata(id, { title: `Conv ${i}` });
    }

    const recent = store.getState().getRecentConversations();

    expect(recent).toHaveLength(10);
  });

  it('should get recent conversations with custom limit', () => {
    for (let i = 0; i < 10; i++) {
      store.getState().createConversation('ide', null, 'agent-1');
    }

    const recent = store.getState().getRecentConversations(5);

    expect(recent).toHaveLength(5);
  });

  it('should return empty array for no matches', () => {
    const results = store.getState().searchConversations('nonexistent');
    expect(results).toHaveLength(0);
  });

  it('should handle empty store gracefully', () => {
    const stats = store.getState().getConversationStats('nonexistent');
    expect(stats.messageCount).toBe(0);
    expect(stats.threadCount).toBe(0);
    expect(stats.totalTokens).toBe(0);
    expect(stats.durationMs).toBe(0);
  });
});
