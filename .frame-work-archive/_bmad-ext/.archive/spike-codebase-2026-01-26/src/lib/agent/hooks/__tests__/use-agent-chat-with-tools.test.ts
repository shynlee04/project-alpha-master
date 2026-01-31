/**
 * @fileoverview useAgentChatWithTools Hook Tests
 * @module lib/agent/hooks/__tests__/use-agent-chat-with-tools.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-5 - Implement Approval Flow
 * 
 * @vitest-environment jsdom
 */

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

    /**
     * Story 40-08: Mode Switching Tests
     * Tests for self-switching agent behavior
     */
    describe('Mode Switching (Story 40-08)', () => {
        // Mock ModeClassifier and related functions
        beforeEach(() => {
            vi.mock('../../mode-classifier', () => ({
                classifyMode: vi.fn(() => ({
                    mode: 'coding',
                    confidence: 0.85,
                    reasoning: ['Code keywords detected'],
                    signals: [],
                    timestamp: Date.now(),
                })),
            }));

            vi.mock('../../system-prompt', () => ({
                getAgentModeForClassifier: vi.fn((mode) => ({
                    id: mode,
                    name: mode.charAt(0).toUpperCase() + mode.slice(1) + ' Mode',
                    icon: mode === 'coding' ? '💻' : '📝',
                    prompt: `${mode} system prompt`,
                })),
                toComposerFormat: vi.fn((config) => ({
                    id: config.id,
                    name: config.name,
                    icon: config.icon,
                    cognitivePhase: 'Executing',
                    persona: `You are ${config.name}`,
                    communicationStyle: 'Direct',
                    rules: config.prompt,
                })),
            }));

            vi.mock('../../prompt-composer', () => ({
                SystemPromptComposer: {
                    getInstance: vi.fn(() => ({
                        compose: vi.fn(() => ['layer1', 'layer2', 'layer3', 'layer4', 'layer5']),
                        updateConfig: vi.fn(),
                        setEventBus: vi.fn(),
                    })),
                },
            }));

            vi.mock('@/infrastructure/persistence/stores/chat', () => ({
                useUnifiedChatStore: vi.fn(() => ({
                    addPendingApproval: vi.fn(),
                    approveToolCall: vi.fn(),
                    denyToolCall: vi.fn(),
                    activeThreadId: null,
                    getPendingApprovals: vi.fn(() => []),
                })),
            }));
        });

        /**
         * AC-1: Hook Calls ModeClassifier on Each Message
         */
        it('should call classifyMode when sendMessage is invoked', async () => {
            const { classifyMode } = await import('../../mode-classifier');
            const mockClassifyMode = vi.mocked(classifyMode);

            const { result } = renderHook(() =>
                useAgentChatWithTools({
                    apiKey: 'test-key',
                    workspaceType: 'ide',
                })
            );

            act(() => {
                result.current.sendMessage('implement a new component');
            });

            expect(mockClassifyMode).toHaveBeenCalledTimes(1);
            expect(mockClassifyMode).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: 'implement a new component',
                    workspaceType: 'ide',
                })
            );
        });

        it('should include workspaceType in classification context', async () => {
            const { classifyMode } = await import('../../mode-classifier');
            const mockClassifyMode = vi.mocked(classifyMode);

            const { result } = renderHook(() =>
                useAgentChatWithTools({
                    apiKey: 'test-key',
                    workspaceType: 'notes',
                })
            );

            act(() => {
                result.current.sendMessage('create a new note');
            });

            expect(mockClassifyMode).toHaveBeenCalledWith(
                expect.objectContaining({
                    workspaceType: 'notes',
                })
            );
        });

        /**
         * AC-2: System Prompt Updates Dynamically
         */
        it('should call getAgentModeForClassifier and toComposerFormat', async () => {
            const { classifyMode } = await import('../../mode-classifier');
            const { getAgentModeForClassifier, toComposerFormat } = await import('../../system-prompt');
            const { SystemPromptComposer } = await import('../../prompt-composer');

            const mockClassifyMode = vi.mocked(classifyMode);
            const mockGetAgentModeForClassifier = vi.mocked(getAgentModeForClassifier);
            const mockToComposerFormat = vi.mocked(toComposerFormat);
            const mockGetInstance = vi.mocked(SystemPromptComposer.getInstance);
            const mockComposer = { updateConfig: vi.fn(), compose: vi.fn(), setEventBus: vi.fn() };
            mockGetInstance.mockReturnValue(mockComposer as any);

            mockClassifyMode.mockReturnValue({
                mode: 'coding',
                confidence: 0.9,
                reasoning: ['Code keywords'],
                signals: [],
                timestamp: Date.now(),
            });

            mockGetAgentModeForClassifier.mockReturnValue({
                id: 'coding',
                name: 'Coding Mode',
                icon: '💻',
                prompt: 'Coding prompt',
            });

            const { result } = renderHook(() =>
                useAgentChatWithTools({
                    apiKey: 'test-key',
                    workspaceType: 'ide',
                })
            );

            act(() => {
                result.current.sendMessage('fix this bug');
            });

            expect(mockGetAgentModeForClassifier).toHaveBeenCalledWith('coding');
            expect(mockToComposerFormat).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'coding' })
            );
            expect(mockComposer.updateConfig).toHaveBeenCalledWith(
                expect.objectContaining({
                    agentMode: expect.objectContaining({ id: 'coding' }),
                })
            );
        });

        /**
         * AC-3: Mode Switching Logged for Observability
         */
        it('should log mode classification result', async () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const { result } = renderHook(() =>
                useAgentChatWithTools({
                    apiKey: 'test-key',
                    workspaceType: 'ide',
                })
            );

            act(() => {
                result.current.sendMessage('write code');
            });

            const hasClassificationLog = consoleLogSpy.mock.calls.some((call) =>
                call[0]?.includes?.('[useAgentChat] Mode classification:')
            );

            expect(hasClassificationLog).toBe(true);

            consoleLogSpy.mockRestore();
        });

        it('should log mode switch action', async () => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const { result } = renderHook(() =>
                useAgentChatWithTools({
                    apiKey: 'test-key',
                    workspaceType: 'ide',
                })
            );

            act(() => {
                result.current.sendMessage('test message');
            });

            const hasSwitchLog = consoleLogSpy.mock.calls.some((call) =>
                call[0]?.includes?.('[useAgentChat] Mode switched to:')
            );

            expect(hasSwitchLog).toBe(true);

            consoleLogSpy.mockRestore();
        });

        /**
         * AC-4: Smooth Transitions Between Modes
         */
        it('should use default workspace type when not provided', async () => {
            const { classifyMode } = await import('../../mode-classifier');
            const mockClassifyMode = vi.mocked(classifyMode);

            const { result } = renderHook(() =>
                useAgentChatWithTools({
                    apiKey: 'test-key',
                })
            );

            act(() => {
                result.current.sendMessage('test');
            });

            expect(mockClassifyMode).toHaveBeenCalledWith(
                expect.objectContaining({
                    workspaceType: 'ide', // default
                })
            );
        });
    });
});
