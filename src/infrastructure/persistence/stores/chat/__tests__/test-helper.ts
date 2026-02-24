/**
 * @fileoverview Test Helper for Unified Chat Store
 * @module infrastructure/persistence/stores/chat/__tests__
 * @governance EPIC-40 TC-001
 *
 * Creates a complete test store with all slices for unit testing.
 * Mocks Dexie storage to avoid IndexedDB operations in tests.
 *
 * @story TC-001: Add test coverage for unified chat store
 * @created 2026-01-10
 */

import { create } from 'zustand';
import type { CombinedUnifiedChatState } from '../unified-chat-types';
import { createChatMetadataSlice } from '../slices/chat-metadata-slice';
import { createThreadManagementSlice } from '../slices/thread-management-slice';
import { createMessageCrudSlice } from '../slices/message-crud-slice';
import { createToolExecutionSlice } from '../slices/tool-execution-slice';
import { createContextWindowSlice } from '../slices/context-window-slice';

// Mock crypto.randomUUID for Node.js test environment
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  } as any;
}

/**
 * Creates a complete test store with all unified chat slices
 * Use this instead of manually assembling slices to avoid TypeScript errors
 *
 * @example
 * const store = createTestUnifiedChatStore();
 * const conversationId = store.getState().createConversation('ide', 'project-1', 'agent-1');
 */
export const createTestUnifiedChatStore = () =>
  create<CombinedUnifiedChatState>()((set, get, api) => {
    const store = {
      // ========== Chat Metadata Slice ==========
      ...createChatMetadataSlice(set, get, api),

      // ========== Thread Management Slice ==========
      ...createThreadManagementSlice(set, get, api),

      // ========== Message CRUD Slice ==========
      ...createMessageCrudSlice(set, get, api),

      // ========== Tool Execution Slice ==========
      ...createToolExecutionSlice(set, get, api),

      // ========== Context Window Slice (MM-09) ==========
      ...createContextWindowSlice(set, get, api),

      // ========== Test-only methods ==========
      _hasHydrated: false,

      // ========== Mock persistence methods (no-op in tests) ==========
      persistConversation: async () => {
        // No-op in tests - actual persistence tested separately
      },

      getCurrentConversation: () => {
        const { activeConversationId, conversations, threads, messages } = store;
        if (!activeConversationId) return null;
        const conversation = conversations[activeConversationId];
        if (!conversation) return null;
        const conversationThreads = Object.values(threads).filter(
          (t) => t.conversationId === activeConversationId && t.status !== 'deleted'
        );
        const conversationMessages = Object.values(messages).filter((m) =>
          conversationThreads.some((t) => t.id === m.threadId)
        );
        return {
          metadata: {
            id: conversation.id,
            projectId: conversation.projectId || '',
            workspaceId: conversation.workspaceType,
            workspaceType: conversation.workspaceType,
            title: conversation.title || 'New Chat',
            preview: conversation.preview || '',
            agentId: conversation.agentId,
            messageCount: conversationMessages.length,
            scrollPosition: conversation.scrollPosition || 0,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
          },
          messages: conversationMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            agentId: m.agentId,
            agentName: m.agentName,
            agentModel: m.agentModel,
            timestamp: m.timestamp,
            threadId: m.threadId,
            toolCalls: m.toolCalls?.map((tc) => ({
              id: tc.id,
              name: tc.name,
              status: tc.status,
              input: tc.input,
              output: tc.output,
              duration: tc.duration,
              createdAt: tc.createdAt,
            })),
          })),
        };
      },

      loadConversation: async () => {
        // No-op in tests
      },

      loadConversationByProject: async () => {
        // No-op in tests
      },
    };

    return store;
  });

/**
 * Mock workspace type for testing
 */
export const MOCK_WORKSPACE_TYPE = 'ide' as const;

/**
 * Mock project ID for testing
 */
export const MOCK_PROJECT_ID = 'test-project-123';

/**
 * Mock agent ID for testing
 */
export const MOCK_AGENT_ID = 'test-agent-456';

/**
 * Helper to create a test conversation with default values
 */
export function createTestConversation(store: ReturnType<typeof createTestUnifiedChatStore>) {
  return store.getState().createConversation(MOCK_WORKSPACE_TYPE, MOCK_PROJECT_ID, MOCK_AGENT_ID);
}

/**
 * Helper to create a test thread with default values
 */
export function createTestThread(store: ReturnType<typeof createTestUnifiedChatStore>, conversationId: string) {
  return store.getState().createThread(conversationId);
}

/**
 * Helper to create a test message with default values
 */
export function createTestMessage(store: ReturnType<typeof createTestUnifiedChatStore>, threadId: string, content = 'Test message') {
  return store.getState().addMessage(threadId, {
    role: 'user',
    content,
  });
}
