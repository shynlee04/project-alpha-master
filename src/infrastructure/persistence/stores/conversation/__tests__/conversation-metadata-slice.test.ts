import { create } from 'zustand';
import type { CombinedConversationState } from '../types';
import { createConversationMetadataSlice, ConversationMetadataWithId } from '../conversation-metadata-slice';

// Mock Dexie Storage to behave synchronously/in-memory for tests
vi.mock('@/lib/state/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

// Create test store with only the metadata slice
const createTestStore = () => create<CombinedConversationState>()((set, get, api) => ({
  ...createConversationMetadataSlice(set, get, api),
  // Placeholder for other slices (will be implemented in CC-1.2, CC-1.3, etc.)
  threads: {},
  activeThreadId: null,
  messages: {},
}));

describe('Conversation Metadata Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    // Create fresh store for each test
    store = createTestStore();
  });

  it('should create a conversation with valid ID', () => {
    const conversationId = store.getState().createConversation('ide', null, 'agent-1');

    expect(conversationId).toBeDefined();
    expect(conversationId).toMatch(/^conv_\d+_[a-z0-9]+$/);

    const conversation = store.getState().getConversation(conversationId);
    expect(conversation).toBeDefined();
    expect(conversation?.id).toBe(conversationId);
    expect(conversation?.workspaceType).toBe('ide');
    expect(conversation?.agentId).toBe('agent-1');
    expect(conversation?.status).toBe('active');
  });

  it('should create conversation with timestamps', () => {
    const conversationId = store.getState().createConversation('knowledge', 'proj-123', 'agent-2');

    const conversation = store.getState().getConversation(conversationId);
    expect(conversation?.createdAt).toBeDefined();
    expect(conversation?.updatedAt).toBeDefined();
    expect(conversation?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should update conversation metadata', () => {
    const conversationId = store.getState().createConversation('study', null, 'agent-1');

    store.getState().updateConversationMetadata(conversationId, {
      title: 'Test Conversation',
      tags: ['important', 'research'],
      pinned: true,
    });

    const updated = store.getState().getConversation(conversationId);
    expect(updated?.title).toBe('Test Conversation');
    expect(updated?.tags).toEqual(['important', 'research']);
    expect(updated?.pinned).toBe(true);
    expect(updated?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should soft-delete conversation', () => {
    const conversationId = store.getState().createConversation('notes', 'proj-456', 'agent-3');

    store.getState().deleteConversation(conversationId);

    const deleted = store.getState().getConversation(conversationId);
    expect(deleted?.status).toBe('deleted');
  });

  it('should set active conversation', () => {
    const conversationId = store.getState().createConversation('ide', null, 'agent-1');

    store.getState().setActiveConversation(conversationId);

    const state = store.getState();
    expect(state.activeConversationId).toBe(conversationId);
  });

  it('should map active conversation to project', () => {
    const conversationId = store.getState().createConversation('knowledge', 'proj-789', 'agent-2');

    store.getState().setActiveConversation(conversationId);

    const state = store.getState();
    expect(state.activeProjectConversationIds['proj-789']).toBe(conversationId);
  });

  it('should get all conversations excluding deleted', () => {
    const id1 = store.getState().createConversation('ide', null, 'agent-1');
    const id2 = store.getState().createConversation('knowledge', 'proj-1', 'agent-2');
    const id3 = store.getState().createConversation('study', null, 'agent-3');

    // Delete one conversation
    store.getState().deleteConversation(id2);

    const allConversations = store.getState().getAllConversations();

    expect(allConversations).toHaveLength(2);
    expect(allConversations.find(c => c.id === id1)).toBeDefined();
    expect(allConversations.find(c => c.id === id2)).toBeUndefined(); // Deleted
    expect(allConversations.find(c => c.id === id3)).toBeDefined();
  });

  it('should filter conversations by workspace', () => {
    store.getState().createConversation('ide', null, 'agent-1');
    store.getState().createConversation('knowledge', 'proj-1', 'agent-2');
    store.getState().createConversation('knowledge', 'proj-2', 'agent-3');
    store.getState().createConversation('study', null, 'agent-4');

    const knowledgeConversations = store.getState().getConversationsByWorkspace('knowledge');

    expect(knowledgeConversations).toHaveLength(2);
    expect(knowledgeConversations.every(c => c.workspaceType === 'knowledge')).toBe(true);
  });

  it('should filter conversations by project', () => {
    store.getState().createConversation('knowledge', 'proj-1', 'agent-1');
    store.getState().createConversation('knowledge', 'proj-2', 'agent-2');
    store.getState().createConversation('knowledge', 'proj-1', 'agent-3');

    const proj1Conversations = store.getState().getConversationsByProject('proj-1');

    expect(proj1Conversations).toHaveLength(2);
    expect(proj1Conversations.every(c => c.projectId === 'proj-1')).toBe(true);
  });

  it('should maintain conversation metadata structure', () => {
    const conversationId = store.getState().createConversation('ide', 'proj-123', 'agent-1');

    store.getState().updateConversationMetadata(conversationId, {
      title: 'Structure Test',
      tags: ['test'],
    });

    const conversation = store.getState().getConversation(conversationId);

    // Verify all required fields exist
    expect(conversation?.id).toBeDefined();
    expect(conversation?.workspaceType).toBeDefined();
    expect(conversation?.projectId).toBeDefined();
    expect(conversation?.agentId).toBeDefined();
    expect(conversation?.status).toBeDefined();
    expect(conversation?.createdAt).toBeDefined();
    expect(conversation?.updatedAt).toBeDefined();

    // Verify optional fields
    expect(conversation?.title).toBe('Structure Test');
    expect(conversation?.tags).toEqual(['test']);
    expect(conversation?.pinned).toBe(false); // Default value
  });
});
