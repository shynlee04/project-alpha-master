/**
 * @fileoverview useAgentChatWithTools Hook Tests
 * @module lib/agent/hooks/__tests__/use-agent-chat-with-tools.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-5 - Implement Approval Flow
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock TanStack AI React
vi.mock('@tanstack/ai-react', () => ({
    useChat: vi.fn(() => ({
        messages: [],
        sendMessage: vi.fn(),
        isLoading: false,
        error: null,
        addToolApprovalResponse: vi.fn(),
    })),
    fetchServerSentEvents: vi.fn((url, opts) => ({
        url,
        ...opts,
    })),
}));

// Mock TanStack AI Client
vi.mock('@tanstack/ai-client', () => ({
    createChatClientOptions: vi.fn((opts) => opts),
    clientTools: vi.fn((...tools) => tools),
}));

// Mock the factory
vi.mock('../../factory', () => ({
    createAgentClientTools: vi.fn(() => ({
        getClientTools: vi.fn(() => []),
        all: [],
    })),
}));

import { useAgentChatWithTools, type PendingApprovalInfo } from '../use-agent-chat-with-tools';
import { useChat } from '@tanstack/ai-react';

describe('useAgentChatWithTools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return pendingApprovals array', () => {
        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.pendingApprovals).toBeDefined();
        expect(Array.isArray(result.current.pendingApprovals)).toBe(true);
    });

    it('should extract pending approvals from messages with approval-requested state', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [
                {
                    role: 'assistant',
                    parts: [
                        {
                            type: 'tool-call',
                            id: 'tool-call-123',
                            name: 'write_file',
                            state: 'approval-requested',
                            approval: {
                                id: 'approval-456',
                                needsApproval: true,
                            },
                            input: {
                                path: 'src/test.ts',
                                content: 'console.log("hello")',
                            },
                        },
                    ],
                },
            ],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.pendingApprovals).toHaveLength(1);
        expect(result.current.pendingApprovals[0].toolName).toBe('write_file');
        expect(result.current.pendingApprovals[0].approvalId).toBe('approval-456');
        expect(result.current.pendingApprovals[0].riskLevel).toBe('medium');
    });

    it('should assign high risk level to execute_command', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [
                {
                    role: 'assistant',
                    parts: [
                        {
                            type: 'tool-call',
                            id: 'tool-call-789',
                            name: 'execute_command',
                            state: 'approval-requested',
                            approval: {
                                id: 'approval-xyz',
                                needsApproval: true,
                            },
                            input: {
                                command: 'rm -rf node_modules',
                            },
                        },
                    ],
                },
            ],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.pendingApprovals[0].riskLevel).toBe('high');
        expect(result.current.pendingApprovals[0].toolName).toBe('execute_command');
    });

    it('should not include non-approval-requested tool calls', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [
                {
                    role: 'assistant',
                    parts: [
                        {
                            type: 'tool-call',
                            id: 'tool-call-completed',
                            name: 'read_file',
                            state: 'completed', // Not approval-requested
                            input: { path: 'test.ts' },
                        },
                    ],
                },
            ],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.pendingApprovals).toHaveLength(0);
    });

    it('should call addToolApprovalResponse on approveToolCall', () => {
        const mockAddToolApprovalResponse = vi.fn();
        vi.mocked(useChat).mockReturnValue({
            messages: [],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: mockAddToolApprovalResponse,
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        act(() => {
            result.current.approveToolCall('tool-123');
        });

        expect(mockAddToolApprovalResponse).toHaveBeenCalledWith({
            id: 'tool-123',
            approved: true,
        });
    });

    it('should call addToolApprovalResponse on rejectToolCall', () => {
        const mockAddToolApprovalResponse = vi.fn();
        vi.mocked(useChat).mockReturnValue({
            messages: [],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: mockAddToolApprovalResponse,
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        act(() => {
            result.current.rejectToolCall('tool-456', 'User declined');
        });

        expect(mockAddToolApprovalResponse).toHaveBeenCalledWith({
            id: 'tool-456',
            approved: false,
        });
    });

    it('should return toolsAvailable false when no facades provided', () => {
        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.toolsAvailable).toBe(false);
    });

    it('should return correct provider and model IDs', () => {
        const { result } = renderHook(() => useAgentChatWithTools({
            providerId: 'openai',
            modelId: 'gpt-4o',
        }));

        expect(result.current.providerId).toBe('openai');
        expect(result.current.modelId).toBe('gpt-4o');
    });

    it('should build description for write_file tool', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [
                {
                    role: 'assistant',
                    parts: [
                        {
                            type: 'tool-call',
                            id: 'tc-1',
                            name: 'write_file',
                            state: 'approval-requested',
                            approval: { id: 'app-1' },
                            input: { path: 'src/index.ts', content: 'export {}' },
                        },
                    ],
                },
            ],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.pendingApprovals[0].description).toBe('Write to file: src/index.ts');
    });

    it('should include proposedContent for write_file tool', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [
                {
                    role: 'assistant',
                    parts: [
                        {
                            type: 'tool-call',
                            id: 'tc-1',
                            name: 'write_file',
                            state: 'approval-requested',
                            approval: { id: 'app-1' },
                            input: { path: 'test.ts', content: 'const x = 1;' },
                        },
                    ],
                },
            ],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            addToolApprovalResponse: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChatWithTools());

        expect(result.current.pendingApprovals[0].proposedContent).toBe('const x = 1;');
    });
});
