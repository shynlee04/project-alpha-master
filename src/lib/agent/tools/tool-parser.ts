/**
 * @fileoverview Tool Call Buffer Parser
 * @module lib/agent/tools/tool-parser
 * 
 * Parses and buffers streaming tool call JSON chunks from LLM responses.
 * Implements the ToolCallManager pattern from TanStack AI for handling
 * incremental tool call arguments that arrive in fragments.
 * 
 * @epic 2 - AI Chat That Just Works
 * @story 2-3 - Streaming Chat with Tool Approval UI
 * @task T2 - Implement Tool Call Buffer Parser
 * @blocker E2-B2 - Create tool call buffer parser
 */

// import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a streaming tool call chunk from the LLM
 * Based on TanStack AI StreamChunk type for tool_call
 */
export interface ToolCallChunk {
    type: 'tool_call';
    /** Unique ID for this tool call */
    toolCallId: string;
    /** Tool name (only in first chunk) */
    name?: string;
    /** Partial JSON arguments string */
    argumentsDelta?: string;
    /** Whether this is the final chunk for this tool call */
    isComplete?: boolean;
}

/**
 * Represents a fully parsed tool call with complete arguments
 */
export interface BufferedToolCall {
    toolCallId: string;
    name: string;
    args: Record<string, unknown>;
    isComplete: boolean;
}

/**
 * Information about a pending (incomplete) tool call
 */
export interface PendingToolCallInfo {
    toolCallId: string;
    name: string;
    bufferProgress: number; // bytes received
    startTime: number;
}

/**
 * Result of parsing tool call chunks
 */
export interface ParseResult {
    /** Successfully parsed complete tool calls */
    complete: BufferedToolCall[];
    /** Tool calls still receiving data */
    pending: PendingToolCallInfo[];
    /** Tool calls that failed to parse */
    errors: Array<{ toolCallId: string; error: string }>;
}

/**
 * Statistics for buffer display in UI
 */
export interface BufferStats {
    pendingCount: number;
    completedCount: number;
    partialBuffers: Record<string, {
        name: string;
        bytesReceived: number;
        startTime: number;
    }>;
}

/**
 * Options for creating a tool call buffer
 */
export interface ToolCallBufferOptions {
    /** Timeout in milliseconds for incomplete tool calls (default: 30000) */
    timeoutMs?: number;
}

// ============================================================================
// Internal State
// ============================================================================

interface InternalBufferEntry {
    name: string;
    argumentsBuffer: string;
    startTime: number;
    isComplete: boolean;
}

// ============================================================================
// ToolCallBuffer Class
// ============================================================================

/**
 * Buffer for accumulating streaming tool call chunks
 * 
 * Usage:
 * ```typescript
 * const buffer = createToolCallBuffer();
 * 
 * for await (const chunk of stream) {
 *   if (chunk.type === 'tool_call') {
 *     buffer.addChunk(chunk);
 *   }
 * }
 * 
 * const complete = buffer.getCompleteToolCalls();
 * for (const toolCall of complete) {
 *   // Handle complete tool call
 * }
 * ```
 */
export interface ToolCallBuffer {
    /** Add a tool call chunk to the buffer */
    addChunk(chunk: ToolCallChunk): void;

    /** Get all complete tool calls (valid JSON parsed) */
    getCompleteToolCalls(): BufferedToolCall[];

    /** Check if there are pending incomplete tool calls */
    hasPendingToolCalls(): boolean;

    /** Check if a specific tool call has timed out */
    hasTimedOut(toolCallId: string): boolean;

    /** Clear all buffered data */
    clear(): void;

    /** Get buffer statistics for UI display */
    getBufferStats(): BufferStats;
}

/**
 * Creates a new tool call buffer instance
 */
export function createToolCallBuffer(options: ToolCallBufferOptions = {}): ToolCallBuffer {
    const { timeoutMs = 30000 } = options;

    // Internal state
    const buffers = new Map<string, InternalBufferEntry>();
    const completedCalls: BufferedToolCall[] = [];

    /**
     * Attempt to parse JSON from accumulated buffer
     * Returns null if JSON is incomplete
     */
    function tryParseJSON(json: string): Record<string, unknown> | null {
        try {
            const parsed = JSON.parse(json);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed as Record<string, unknown>;
            }
            return null;
        } catch {
            // JSON is incomplete or malformed
            return null;
        }
    }

    /**
     * Check if JSON looks potentially complete (balanced braces)
     * This is a quick check before trying full parse
     */
    function looksComplete(json: string): boolean {
        const trimmed = json.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
            return false;
        }

        let depth = 0;
        let inString = false;
        let escape = false;

        for (const char of trimmed) {
            if (escape) {
                escape = false;
                continue;
            }

            if (char === '\\' && inString) {
                escape = true;
                continue;
            }

            if (char === '"') {
                inString = !inString;
                continue;
            }

            if (!inString) {
                if (char === '{' || char === '[') depth++;
                if (char === '}' || char === ']') depth--;
            }
        }

        return depth === 0 && trimmed.length > 2;
    }

    return {
        addChunk(chunk: ToolCallChunk): void {
            const { toolCallId, name, argumentsDelta, isComplete } = chunk;

            // Get or create buffer entry
            let entry = buffers.get(toolCallId);
            if (!entry) {
                entry = {
                    name: name || 'unknown',
                    argumentsBuffer: '',
                    startTime: Date.now(),
                    isComplete: false,
                };
                buffers.set(toolCallId, entry);
            }

            // Update name if provided
            if (name) {
                entry.name = name;
            }

            // Append arguments delta
            if (argumentsDelta) {
                entry.argumentsBuffer += argumentsDelta;
            }

            // Mark as complete if flag set or if JSON looks complete
            if (isComplete || looksComplete(entry.argumentsBuffer)) {
                const args = tryParseJSON(entry.argumentsBuffer);
                if (args) {
                    entry.isComplete = true;
                    completedCalls.push({
                        toolCallId,
                        name: entry.name,
                        args,
                        isComplete: true,
                    });
                    buffers.delete(toolCallId);
                }
            }
        },

        getCompleteToolCalls(): BufferedToolCall[] {
            // Also check pending buffers that might be complete now
            for (const [toolCallId, entry] of buffers.entries()) {
                if (!entry.isComplete && looksComplete(entry.argumentsBuffer)) {
                    const args = tryParseJSON(entry.argumentsBuffer);
                    if (args) {
                        entry.isComplete = true;
                        completedCalls.push({
                            toolCallId,
                            name: entry.name,
                            args,
                            isComplete: true,
                        });
                        buffers.delete(toolCallId);
                    }
                }
            }

            return [...completedCalls];
        },

        hasPendingToolCalls(): boolean {
            return buffers.size > 0;
        },

        hasTimedOut(toolCallId: string): boolean {
            const entry = buffers.get(toolCallId);
            if (!entry) return false;

            return Date.now() - entry.startTime > timeoutMs;
        },

        clear(): void {
            buffers.clear();
            completedCalls.length = 0;
        },

        getBufferStats(): BufferStats {
            const partialBuffers: BufferStats['partialBuffers'] = {};

            for (const [toolCallId, entry] of buffers.entries()) {
                partialBuffers[toolCallId] = {
                    name: entry.name,
                    bytesReceived: entry.argumentsBuffer.length,
                    startTime: entry.startTime,
                };
            }

            return {
                pendingCount: buffers.size,
                completedCount: completedCalls.length,
                partialBuffers,
            };
        },
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse an array of tool call chunks and return categorized results
 * 
 * This is a stateless utility that processes chunks in a single pass.
 * For streaming scenarios, use createToolCallBuffer() instead.
 * 
 * @param chunks - Array of tool call chunks to parse
 * @returns ParseResult with complete, pending, and error categories
 */
export function parseToolCallChunks(chunks: ToolCallChunk[]): ParseResult {
    const buffer = createToolCallBuffer();
    const errors: ParseResult['errors'] = [];

    // Group chunks by tool call ID
    const chunksByToolCall = new Map<string, ToolCallChunk[]>();
    for (const chunk of chunks) {
        const existing = chunksByToolCall.get(chunk.toolCallId) || [];
        existing.push(chunk);
        chunksByToolCall.set(chunk.toolCallId, existing);
    }

    // Process each tool call's chunks
    for (const [toolCallId, callChunks] of chunksByToolCall.entries()) {
        for (const chunk of callChunks) {
            buffer.addChunk(chunk);
        }
    }

    // Check for malformed JSON in pending buffers
    const complete = buffer.getCompleteToolCalls();
    const stats = buffer.getBufferStats();

    // Create pending info
    const pending: PendingToolCallInfo[] = [];
    for (const [toolCallId, info] of Object.entries(stats.partialBuffers)) {
        // Try to determine if it's truly pending or malformed
        const chunks = chunksByToolCall.get(toolCallId) || [];
        const totalDelta = chunks.map(c => c.argumentsDelta || '').join('');

        // Check if it looks like malformed JSON (has matched braces but won't parse)
        if (totalDelta.includes('}') && totalDelta.includes('{')) {
            // Looks like it should be complete but isn't
            try {
                JSON.parse(totalDelta);
                // If we get here, it parsed - shouldn't happen, but handle it
            } catch {
                // Malformed JSON
                errors.push({
                    toolCallId,
                    error: `Malformed JSON: ${totalDelta.substring(0, 50)}...`,
                });
                continue;
            }
        }

        pending.push({
            toolCallId,
            name: info.name,
            bufferProgress: info.bytesReceived,
            startTime: info.startTime,
        });
    }

    return {
        complete,
        pending,
        errors,
    };
}

// ============================================================================
// Exports
// ============================================================================

export type {
    ToolCallBuffer as ToolCallBufferType,
};
