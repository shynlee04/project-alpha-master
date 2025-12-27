/**
 * @fileoverview useAgentChat Hook Tests
 * @module lib/agent/hooks/__tests__/use-agent-chat.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - TanStack AI Integration Setup
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
        clear: vi.fn(),
    })),
    fetchServerSentEvents: vi.fn((url, opts) => ({
        url,
        ...opts,
    })),
}));

import { useAgentChat } from '../use-agent-chat';
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

describe('useAgentChat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use default provider and model', () => {
        renderHook(() => useAgentChat());

        expect(fetchServerSentEvents).toHaveBeenCalledWith(
            '/api/chat',
            expect.objectContaining({
                body: {
                    providerId: 'openrouter',
                    modelId: 'meta-llama/llama-3.1-8b-instruct:free',
                },
            })
        );
    });

    it('should use custom provider and model', () => {
        renderHook(() => useAgentChat({
            providerId: 'openai',
            modelId: 'gpt-4o',
        }));

        expect(fetchServerSentEvents).toHaveBeenCalledWith(
            '/api/chat',
            expect.objectContaining({
                body: {
                    providerId: 'openai',
                    modelId: 'gpt-4o',
                },
            })
        );
    });

    it('should return messages', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there!' },
            ],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            clear: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChat());

        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[0].role).toBe('user');
    });

    it('should add system message if provided', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [],
            sendMessage: vi.fn(),
            isLoading: false,
            error: null,
            clear: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChat({
            systemMessage: 'You are a helpful assistant',
        }));

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('system');
        expect(result.current.messages[0].content).toBe('You are a helpful assistant');
    });

    it('should expose isLoading state', () => {
        vi.mocked(useChat).mockReturnValue({
            messages: [],
            sendMessage: vi.fn(),
            isLoading: true,
            error: null,
            clear: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChat());

        expect(result.current.isLoading).toBe(true);
    });

    it('should expose error state', () => {
        const error = new Error('Test error');
        vi.mocked(useChat).mockReturnValue({
            messages: [],
            sendMessage: vi.fn(),
            isLoading: false,
            error,
            clear: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChat());

        expect(result.current.error).toBe(error);
    });

    it('should call sendMessage with user role', () => {
        const mockSendMessage = vi.fn();
        vi.mocked(useChat).mockReturnValue({
            messages: [],
            sendMessage: mockSendMessage,
            isLoading: false,
            error: null,
            clear: vi.fn(),
        } as any);

        const { result } = renderHook(() => useAgentChat());

        act(() => {
            result.current.sendMessage('Test message');
        });

        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
});
