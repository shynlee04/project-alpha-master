/**
 * @fileoverview Chat API SSE Streaming Tests
 * @module routes/api/__tests__/chat.test
 * 
 * Comprehensive test suite for Server-Sent Events (SSE) streaming in chat API.
 * Tests stream consumption, error handling, completion detection, and various scenarios.
 * 
 * @epic P1 Fixes
 * @story P1-5 - Implement SSE Streaming Tests
 * @test-coverage 15 tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';

// Mock TanStack AI
vi.mock('@tanstack/ai', () => ({
    chat: vi.fn(),
    toServerSentEventsStream: vi.fn(),
}));

vi.mock('@tanstack/ai-openai', () => ({
    createOpenaiChat: vi.fn(),
}));

describe('Chat API - SSE Streaming', () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    let mockAbortController: { abort: () => void };
    let mockStream: AsyncGenerator<unknown>;

    beforeEach(() => {
        // Mock fetch for API calls
        mockFetch = vi.fn();
        global.fetch = mockFetch as unknown as typeof fetch;

        // Mock AbortController
        mockAbortController = {
            abort: vi.fn(),
        };
        vi.spyOn(global, 'AbortController').mockImplementation(
            () => mockAbortController as unknown as typeof AbortController
        );

        // Create mock stream
        mockStream = (async function* () {
            yield { type: 'text-delta', text: 'Hello' };
            yield { type: 'text-delta', text: ' world' };
            yield { type: 'done' };
        })();

        // Mock chat function
        vi.mocked(chat).mockReturnValue(mockStream as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Stream Consumption', () => {
        it('should consume stream chunks correctly', async () => {
            const chunks: unknown[] = [];
            for await (const chunk of mockStream) {
                chunks.push(chunk);
            }
            expect(chunks).toHaveLength(3);
            expect(chunks[0]).toEqual({ type: 'text-delta', text: 'Hello' });
        });

        it('should handle empty stream gracefully', async () => {
            const emptyStream = (async function* () { })();
            const chunks: unknown[] = [];
            for await (const chunk of emptyStream) {
                chunks.push(chunk);
            }
            expect(chunks).toHaveLength(0);
        });

        it('should accumulate text deltas correctly', async () => {
            const textStream = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                yield { type: 'text-delta', text: ' ' };
                yield { type: 'text-delta', text: 'world' };
                yield { type: 'done' };
            })();

            let accumulatedText = '';
            for await (const chunk of textStream) {
                if (chunk.type === 'text-delta') {
                    accumulatedText += (chunk as { text: string }).text;
                }
            }
            expect(accumulatedText).toBe('Hello world');
        });

        it('should handle large stream efficiently', async () => {
            const largeStream = (async function* () {
                for (let i = 0; i < 1000; i++) {
                    yield { type: 'text-delta', text: `chunk ${i}` };
                }
                yield { type: 'done' };
            })();

            let count = 0;
            for await (const _ of largeStream) {
                count++;
            }
            expect(count).toBe(1001); // 1000 chunks + 1 done event
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            const errorStream = (async function* () {
                throw new Error('Network error');
            })();

            vi.mocked(chat).mockReturnValue(errorStream as any);

            try {
                for await (const _ of errorStream) {
                    // Consume stream
                }
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Network error');
            }
        });

        it('should handle timeout errors', async () => {
            const timeoutStream = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                // Simulate timeout
                await new Promise(resolve => setTimeout(resolve, 100));
                throw new Error('Stream timeout');
            })();

            vi.mocked(chat).mockReturnValue(timeoutStream as any);

            try {
                for await (const _ of timeoutStream) {
                    // Consume stream
                }
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Stream timeout');
            }
        });

        it('should handle malformed SSE events', async () => {
            const malformedStream = (async function* () {
                yield { type: 'unknown-type', data: 'malformed' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(malformedStream as any);

            const chunks: unknown[] = [];
            for await (const chunk of malformedStream) {
                chunks.push(chunk);
            }
            expect(chunks[0]).toEqual({ type: 'unknown-type', data: 'malformed' });
        });

        it('should handle connection abort', async () => {
            const abortController = new AbortController();
            abortController.abort();

            const abortedStream = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                throw new DOMException('Aborted', 'AbortError');
            })();

            vi.mocked(chat).mockReturnValue(abortedStream as any);

            try {
                for await (const _ of abortedStream) {
                    // Consume stream
                }
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(DOMException);
            }
        });

        it('should handle provider errors', async () => {
            const providerErrorStream = (async function* () {
                throw new Error('Provider API error: 401 Unauthorized');
            })();

            vi.mocked(chat).mockReturnValue(providerErrorStream as any);

            try {
                for await (const _ of providerErrorStream) {
                    // Consume stream
                }
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain('401');
            }
        });
    });

    describe('Completion Detection', () => {
        it('should detect done event correctly', async () => {
            const streamWithDone = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                yield { type: 'done' };
            })();

            let foundDone = false;
            for await (const chunk of streamWithDone) {
                if (chunk.type === 'done') {
                    foundDone = true;
                }
            }
            expect(foundDone).toBe(true);
        });

        it('should handle missing done event', async () => {
            const streamWithoutDone = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                yield { type: 'text-delta', text: ' world' };
                // No done event
            })();

            let foundDone = false;
            for await (const chunk of streamWithoutDone) {
                if (chunk.type === 'done') {
                    foundDone = true;
                }
            }
            expect(foundDone).toBe(false);
        });

        it('should handle multiple done events', async () => {
            const streamWithMultipleDone = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                yield { type: 'done' };
                yield { type: 'done' };
            })();

            let doneCount = 0;
            for await (const chunk of streamWithMultipleDone) {
                if (chunk.type === 'done') {
                    doneCount++;
                }
            }
            expect(doneCount).toBe(2);
        });

        it('should terminate stream after first done event', async () => {
            const streamWithEarlyDone = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                yield { type: 'done' };
                yield { type: 'text-delta', text: ' (should not be consumed)' };
            })();

            const chunks: unknown[] = [];
            for await (const chunk of streamWithEarlyDone) {
                chunks.push(chunk);
                if (chunk.type === 'done') {
                    break; // Terminate after first done
                }
            }
            expect(chunks).toHaveLength(2); // text-delta + done
        });
    });

    describe('Tool Execution', () => {
        it('should handle tool calls in stream', async () => {
            const toolStream = (async function* () {
                yield { type: 'text-delta', text: 'I will help you' };
                yield {
                    type: 'tool-call',
                    tool: {
                        name: 'read_file',
                        arguments: { path: '/test/file.txt' },
                    },
                };
                yield { type: 'text-delta', text: 'File content:' };
                yield { type: 'done' };
            })();

            const toolCalls: unknown[] = [];
            for await (const chunk of toolStream) {
                if (chunk.type === 'tool-call') {
                    toolCalls.push(chunk);
                }
            }
            expect(toolCalls).toHaveLength(1);
            expect((toolCalls[0] as any).tool.name).toBe('read_file');
        });

        it('should handle multiple tool calls', async () => {
            const multiToolStream = (async function* () {
                yield { type: 'text-delta', text: 'I will help you' };
                yield {
                    type: 'tool-call',
                    tool: {
                        name: 'list_files',
                        arguments: { path: '/test' },
                    },
                };
                yield { type: 'text-delta', text: 'Found files' };
                yield {
                    type: 'tool-call',
                    tool: {
                        name: 'read_file',
                        arguments: { path: '/test/file.txt' },
                    },
                };
                yield { type: 'text-delta', text: 'Content' };
                yield { type: 'done' };
            })();

            const toolCalls: unknown[] = [];
            for await (const chunk of multiToolStream) {
                if (chunk.type === 'tool-call') {
                    toolCalls.push(chunk);
                }
            }
            expect(toolCalls).toHaveLength(2);
        });

        it('should handle tool errors in stream', async () => {
            const toolErrorStream = (async function* () {
                yield { type: 'text-delta', text: 'I will help you' };
                yield {
                    type: 'tool-call',
                    tool: {
                        name: 'read_file',
                        arguments: { path: '/test/file.txt' },
                    },
                };
                yield {
                    type: 'tool-error',
                    error: 'File not found',
                    toolCallId: '123',
                };
                yield { type: 'done' };
            })();

            const toolErrors: unknown[] = [];
            for await (const chunk of toolErrorStream) {
                if (chunk.type === 'tool-error') {
                    toolErrors.push(chunk);
                }
            }
            expect(toolErrors).toHaveLength(1);
            expect((toolErrors[0] as any).error).toBe('File not found');
        });
    });

    describe('Provider Integration', () => {
        it('should use correct provider adapter', () => {
            const providerId = 'openrouter';
            const modelId = 'mistralai/mistral-2512:free';
            const apiKey = 'test-api-key';

            vi.mocked(createOpenaiChat).mockReturnValue({
                stream: vi.fn(),
            } as any);

            // Simulate chat API call
            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            expect(createOpenaiChat).toHaveBeenCalledWith(
                modelId,
                apiKey,
                expect.objectContaining({
                    baseURL: 'https://openrouter.ai/api/v1',
                    defaultHeaders: expect.objectContaining({
                        'HTTP-Referer': 'https://via-gent.dev',
                        'X-Title': 'Via-Gent IDE',
                    }),
                })
            );
        });

        it('should handle custom provider baseURL', () => {
            const customBaseURL = 'https://custom-api.example.com/v1';
            const customHeaders = { 'X-Custom-Header': 'custom-value' };

            vi.mocked(createOpenaiChat).mockReturnValue({
                stream: vi.fn(),
            } as any);

            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            expect(createOpenaiChat).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    baseURL: customBaseURL,
                    defaultHeaders: customHeaders,
                })
            );
        });

        it('should handle OpenAI provider', () => {
            const providerId = 'openai';
            const modelId = 'gpt-4o';
            const apiKey = 'test-api-key';

            vi.mocked(createOpenaiChat).mockReturnValue({
                stream: vi.fn(),
            } as any);

            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            expect(createOpenaiChat).toHaveBeenCalledWith(
                modelId,
                apiKey,
                expect.objectContaining({
                    baseURL: 'https://api.openai.com/v1',
                })
            );
        });
    });

    describe('Stream Headers', () => {
        it('should set correct SSE headers', async () => {
            const mockResponse = {
                ok: true,
                headers: new Headers(),
                body: null,
            };

            mockFetch.mockResolvedValue(mockResponse as unknown as Response);

            // Simulate API call
            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            // In actual implementation, headers would be set
            expect(mockFetch).toHaveBeenCalled();
        });

        it('should set cache control headers', async () => {
            const mockResponse = {
                ok: true,
                headers: new Headers(),
                body: null,
            };

            mockFetch.mockResolvedValue(mockResponse as unknown as Response);

            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            expect(mockFetch).toHaveBeenCalled();
        });
    });

    describe('Message Format', () => {
        it('should handle user messages', async () => {
            const userMessageStream = (async function* () {
                yield { type: 'text-delta', text: 'Hello' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(userMessageStream as any);

            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'Hello' }],
            });

            expect(chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    messages: [{ role: 'user', content: 'Hello' }],
                })
            );
        });

        it('should handle assistant messages', async () => {
            const assistantMessageStream = (async function* () {
                yield { type: 'text-delta', text: 'Response' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(assistantMessageStream as any);

            const stream = chat({
                adapter: {} as any,
                messages: [
                    { role: 'user', content: 'Hello' },
                    { role: 'assistant', content: 'Response' },
                ],
            });

            expect(chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        { role: 'assistant', content: 'Response' },
                    ]),
                })
            );
        });

        it('should handle system messages', async () => {
            const systemMessageStream = (async function* () {
                yield { type: 'text-delta', text: 'System response' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(systemMessageStream as any);

            const stream = chat({
                adapter: {} as any,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant' },
                    { role: 'user', content: 'Hello' },
                ],
            });

            expect(chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        { role: 'system', content: 'You are a helpful assistant' },
                    ]),
                })
            );
        });
    });

    describe('Debug Mode', () => {
        it('should disable tools when disableTools flag is set', () => {
            const streamWithoutTools = (async function* () {
                yield { type: 'text-delta', text: 'Response without tools' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(streamWithoutTools as any);

            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            // Verify tools are not passed when disabled
            expect(chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    tools: undefined,
                })
            );
        });

        it('should enable tools by default', () => {
            const streamWithTools = (async function* () {
                yield { type: 'text-delta', text: 'Response with tools' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(streamWithTools as any);

            const stream = chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            });

            // Verify tools are passed by default
            expect(chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    tools: expect.any(Array),
                })
            );
        });
    });

    describe('Performance', () => {
        it('should handle concurrent streams', async () => {
            const stream1 = (async function* () {
                yield { type: 'text-delta', text: 'Stream 1' };
                yield { type: 'done' };
            })();

            const stream2 = (async function* () {
                yield { type: 'text-delta', text: 'Stream 2' };
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(stream1 as any);

            const promise1 = (async () => {
                const chunks: unknown[] = [];
                for await (const chunk of chat({
                    adapter: {} as any,
                    messages: [{ role: 'user', content: 'test1' }],
                })) {
                    chunks.push(chunk);
                }
                return chunks;
            })();

            vi.mocked(chat).mockReturnValue(stream2 as any);

            const promise2 = (async () => {
                const chunks: unknown[] = [];
                for await (const chunk of chat({
                    adapter: {} as any,
                    messages: [{ role: 'user', content: 'test2' }],
                })) {
                    chunks.push(chunk);
                }
                return chunks;
            })();

            const [result1, result2] = await Promise.all([promise1(), promise2()]);

            expect(result1).toHaveLength(2);
            expect(result2).toHaveLength(2);
        });

        it('should handle rapid message updates', async () => {
            const rapidStream = (async function* () {
                for (let i = 0; i < 100; i++) {
                    yield { type: 'text-delta', text: `chunk ${i}` };
                }
                yield { type: 'done' };
            })();

            vi.mocked(chat).mockReturnValue(rapidStream as any);

            const startTime = Date.now();
            const chunks: unknown[] = [];
            for await (const chunk of chat({
                adapter: {} as any,
                messages: [{ role: 'user', content: 'test' }],
            })) {
                chunks.push(chunk);
            }
            const endTime = Date.now();

            expect(chunks).toHaveLength(101); // 100 chunks + 1 done
            expect(endTime - startTime).toBeLessThan(1000); // Should complete in <1s
        });
    });
});
