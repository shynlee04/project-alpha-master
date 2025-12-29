import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConversationStore } from './conversation-store';

// Mock Dexie Storage to behave synchronously/in-memory for tests
vi.mock('./dexie-storage', () => ({
    createDexieStorage: () => ({
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    })
}));

describe('Conversation Store', () => {
    beforeEach(() => {
        // Reset store before each test
        useConversationStore.getState().reset();
    });

    it('should initialize with empty state', () => {
        const { activeConversationId, conversations, pendingToolApprovals } = useConversationStore.getState();
        expect(activeConversationId).toBeNull();
        expect(Object.keys(conversations)).toHaveLength(0);
        expect(pendingToolApprovals).toHaveLength(0);
    });

    it('should create a new conversation', () => {
        const conversationId = useConversationStore.getState().createConversation('project-1', 'agent-1');

        expect(conversationId).toMatch(/^conv_\d+_\w+$/);

        const { conversations, activeConversationId } = useConversationStore.getState();
        expect(activeConversationId).toBe(conversationId);
        expect(conversations[conversationId]).toBeDefined();
        expect(conversations[conversationId].metadata.projectId).toBe('project-1');
        expect(conversations[conversationId].metadata.agentId).toBe('agent-1');
    });

    it('should add message to conversation', () => {
        const conversationId = useConversationStore.getState().createConversation();

        const message = {
            id: 'msg-1',
            role: 'user' as const,
            content: 'Hello, AI!',
            timestamp: Date.now(),
        };

        useConversationStore.getState().addMessage(conversationId, message);

        const conversation = useConversationStore.getState().getConversation(conversationId);
        expect(conversation?.messages).toHaveLength(1);
        expect(conversation?.messages[0].content).toBe('Hello, AI!');
        expect(conversation?.metadata.messageCount).toBe(1);
    });

    it('should update conversation title from first user message', () => {
        const conversationId = useConversationStore.getState().createConversation();

        const message = {
            id: 'msg-1',
            role: 'user' as const,
            content: 'How do I implement a React hook?',
            timestamp: Date.now(),
        };

        useConversationStore.getState().addMessage(conversationId, message);

        const conversation = useConversationStore.getState().getConversation(conversationId);
        expect(conversation?.metadata.title).toBe('How do I implement a React hook?');
    });

    it('should update message in conversation', () => {
        const conversationId = useConversationStore.getState().createConversation();

        const message = {
            id: 'msg-1',
            role: 'assistant' as const,
            content: 'Initial response',
            timestamp: Date.now(),
        };

        useConversationStore.getState().addMessage(conversationId, message);
        useConversationStore.getState().updateMessage(conversationId, 'msg-1', { content: 'Updated response' });

        const conversation = useConversationStore.getState().getConversation(conversationId);
        expect(conversation?.messages[0].content).toBe('Updated response');
    });

    it('should update scroll position', () => {
        const conversationId = useConversationStore.getState().createConversation();

        useConversationStore.getState().updateScrollPosition(conversationId, 500);

        const { scrollPositions } = useConversationStore.getState();
        expect(scrollPositions[conversationId]).toBe(500);
    });

    it('should add and resolve pending tool approval', () => {
        const conversationId = useConversationStore.getState().createConversation();

        const approvalId = useConversationStore.getState().addPendingToolApproval({
            conversationId,
            messageId: 'msg-1',
            toolName: 'read_file',
            toolInput: { path: '/test.ts' },
            status: 'pending',
        });

        expect(approvalId).toMatch(/^tool_\d+_\w+$/);

        let { pendingToolApprovals } = useConversationStore.getState();
        expect(pendingToolApprovals).toHaveLength(1);
        expect(pendingToolApprovals[0].status).toBe('pending');

        // Resolve the approval
        useConversationStore.getState().resolveToolApproval(approvalId, 'approved');

        ({ pendingToolApprovals } = useConversationStore.getState());
        expect(pendingToolApprovals[0].status).toBe('approved');
    });

    it('should delete conversation', async () => {
        const conversationId = useConversationStore.getState().createConversation();
        useConversationStore.getState().updateScrollPosition(conversationId, 100);

        await useConversationStore.getState().deleteConversation(conversationId);

        const { conversations, scrollPositions, activeConversationId } = useConversationStore.getState();
        expect(conversations[conversationId]).toBeUndefined();
        expect(scrollPositions[conversationId]).toBeUndefined();
        expect(activeConversationId).toBeNull();
    });

    it('should switch active conversation when deleting active', async () => {
        const conv1 = useConversationStore.getState().createConversation();
        const conv2 = useConversationStore.getState().createConversation();

        // conv2 is now active (last created)
        expect(useConversationStore.getState().activeConversationId).toBe(conv2);

        // Add a message to conv1 to ensure it has a newer updatedAt than conv2
        // This makes the sort order deterministic
        useConversationStore.getState().addMessage(conv1, {
            id: 'msg-1',
            role: 'user',
            content: 'Update timestamp',
            timestamp: Date.now(),
        });

        // Delete conv2
        await useConversationStore.getState().deleteConversation(conv2);

        // Should switch to conv1 (it has the newer updatedAt)
        expect(useConversationStore.getState().activeConversationId).toBe(conv1);
    });

    it('should set active conversation', () => {
        const conv1 = useConversationStore.getState().createConversation();
        const conv2 = useConversationStore.getState().createConversation();

        useConversationStore.getState().setActiveConversation(conv1);
        expect(useConversationStore.getState().activeConversationId).toBe(conv1);
    });

    it('should reset to empty state', () => {
        // Create some state
        const conv = useConversationStore.getState().createConversation();
        useConversationStore.getState().addMessage(conv, {
            id: 'msg-1',
            role: 'user',
            content: 'Test',
            timestamp: Date.now(),
        });
        useConversationStore.getState().addPendingToolApproval({
            conversationId: conv,
            messageId: 'msg-1',
            toolName: 'test',
            toolInput: {},
            status: 'pending',
        });

        // Reset
        useConversationStore.getState().reset();

        const state = useConversationStore.getState();
        expect(state.activeConversationId).toBeNull();
        expect(Object.keys(state.conversations)).toHaveLength(0);
        expect(Object.keys(state.scrollPositions)).toHaveLength(0);
        expect(state.pendingToolApprovals).toHaveLength(0);
    });
});
