/**
 * @fileoverview Tool Call Parser Tests
 * @module lib/agent/tools/__tests__/tool-parser.test
 * 
 * Tests for tool call chunk buffering and parsing.
 * 
 * @epic 2 - AI Chat That Just Works
 * @story 2-3 - Streaming Chat with Tool Approval UI
 * @task T2 - Implement Tool Call Buffer Parser
 */

import {
    ToolCallBuffer,
    parseToolCallChunks,
    createToolCallBuffer,
    type ToolCallChunk,
    type BufferedToolCall,
} from '../tool-parser';

describe('ToolCallBuffer', () => {
    let buffer: ToolCallBuffer;

    beforeEach(() => {
        buffer = createToolCallBuffer();
    });

    describe('addChunk', () => {
        it('should accumulate JSON fragments for a tool call', () => {
            const chunk1: ToolCallChunk = {
                type: 'tool_call',
                toolCallId: 'tc_1',
                name: 'write_file',
                argumentsDelta: '{"path": "/test/fi',
            };
            const chunk2: ToolCallChunk = {
                type: 'tool_call',
                toolCallId: 'tc_1',
                argumentsDelta: 'le.txt", "content": "hello"}',
            };

            buffer.addChunk(chunk1);
            buffer.addChunk(chunk2);

            const result = buffer.getCompleteToolCalls();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('write_file');
            expect(result[0].args).toEqual({
                path: '/test/file.txt',
                content: 'hello',
            });
        });

        it('should handle multiple tool calls in parallel', () => {
            buffer.addChunk({
                type: 'tool_call',
                toolCallId: 'tc_1',
                name: 'read_file',
                argumentsDelta: '{"path": "/a.txt"}',
            });
            buffer.addChunk({
                type: 'tool_call',
                toolCallId: 'tc_2',
                name: 'list_files',
                argumentsDelta: '{"path": "/src"}',
            });

            const result = buffer.getCompleteToolCalls();
            expect(result).toHaveLength(2);
            expect(result.map(tc => tc.name)).toContain('read_file');
            expect(result.map(tc => tc.name)).toContain('list_files');
        });

        it('should return pending status for incomplete JSON', () => {
            buffer.addChunk({
                type: 'tool_call',
                toolCallId: 'tc_1',
                name: 'write_file',
                argumentsDelta: '{"path": "/incomplete',
            });

            expect(buffer.hasPendingToolCalls()).toBe(true);
            expect(buffer.getCompleteToolCalls()).toHaveLength(0);
        });
    });

    describe('parseToolCallChunks', () => {
        it('should parse a complete tool call from single chunk', () => {
            const chunk: ToolCallChunk = {
                type: 'tool_call',
                toolCallId: 'tc_123',
                name: 'read_file',
                argumentsDelta: '{"path": "/src/index.ts"}',
            };

            const result = parseToolCallChunks([chunk]);
            expect(result.complete).toHaveLength(1);
            expect(result.complete[0]).toEqual({
                toolCallId: 'tc_123',
                name: 'read_file',
                args: { path: '/src/index.ts' },
                isComplete: true,
            });
            expect(result.pending).toHaveLength(0);
        });

        it('should return pending for incomplete chunks', () => {
            const chunks: ToolCallChunk[] = [
                {
                    type: 'tool_call',
                    toolCallId: 'tc_1',
                    name: 'write_file',
                    argumentsDelta: '{"path": "test.txt", ',
                },
            ];

            const result = parseToolCallChunks(chunks);
            expect(result.complete).toHaveLength(0);
            expect(result.pending).toHaveLength(1);
            expect(result.pending[0].toolCallId).toBe('tc_1');
            expect(result.pending[0].bufferProgress).toBeGreaterThan(0);
        });

        it('should handle malformed JSON gracefully', () => {
            const chunk: ToolCallChunk = {
                type: 'tool_call',
                toolCallId: 'tc_bad',
                name: 'read_file',
                argumentsDelta: '{invalid json}',
            };

            const result = parseToolCallChunks([chunk]);
            expect(result.complete).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].toolCallId).toBe('tc_bad');
        });
    });

    describe('buffer timeout', () => {
        it('should timeout after 30 seconds (fail-safe)', async () => {
            vi.useFakeTimers();

            buffer = createToolCallBuffer({ timeoutMs: 30000 });
            buffer.addChunk({
                type: 'tool_call',
                toolCallId: 'tc_timeout',
                name: 'write_file',
                argumentsDelta: '{"incomplete',
            });

            expect(buffer.hasPendingToolCalls()).toBe(true);

            // Advance time by 31 seconds
            vi.advanceTimersByTime(31000);

            expect(buffer.hasTimedOut('tc_timeout')).toBe(true);

            vi.useRealTimers();
        });
    });

    describe('clear', () => {
        it('should clear all buffered tool calls', () => {
            buffer.addChunk({
                type: 'tool_call',
                toolCallId: 'tc_1',
                name: 'read_file',
                argumentsDelta: '{"path": "/test.txt"}',
            });

            expect(buffer.getCompleteToolCalls()).toHaveLength(1);

            buffer.clear();

            expect(buffer.getCompleteToolCalls()).toHaveLength(0);
            expect(buffer.hasPendingToolCalls()).toBe(false);
        });
    });

    describe('getBufferStats', () => {
        it('should return buffer statistics for UI display', () => {
            buffer.addChunk({
                type: 'tool_call',
                toolCallId: 'tc_1',
                name: 'write_file',
                argumentsDelta: '{"path": "/a.txt", "content": "partial',
            });

            const stats = buffer.getBufferStats();
            expect(stats.pendingCount).toBe(1);
            expect(stats.partialBuffers.tc_1).toBeDefined();
            expect(stats.partialBuffers.tc_1.bytesReceived).toBeGreaterThan(0);
        });
    });
});
