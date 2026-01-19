/**
 * Tool Output Streaming Utilities
 *
 * Ralph Loop Cycle 5: Real-Time Tool Output Streaming
 *
 * Provides async generator pattern for streaming tool execution results.
 * Enables progressive output display for long-running tools.
 *
 * @module lib/agent/tools/streaming
 */

/**
 * Streaming tool result chunk
 */
export interface StreamingChunk {
    /** Chunk type */
    type: 'stdout' | 'stderr' | 'progress' | 'complete' | 'error';
    /** Chunk content */
    content: string;
    /** Timestamp */
    timestamp: number;
    /** Is this the final chunk? */
    isFinal?: boolean;
}

/**
 * Streaming tool execution options
 */
export interface StreamingOptions {
    /** Callback for each chunk */
    onChunk?: (chunk: StreamingChunk) => void;
    /** Throttle chunk delivery (ms) */
    throttleMs?: number;
    /** Buffer size for chunks */
    bufferSize?: number;
}

/**
 * Async generator for streaming tool output
 *
 * @example
 * ```typescript
 * async function* streamCommand(command: string): AsyncGenerator<StreamingChunk> {
 *   yield { type: 'progress', content: 'Starting...', timestamp: Date.now() };
 *   const result = await executeCommand(command);
 *   yield { type: 'stdout', content: result.stdout, timestamp: Date.now(), isFinal: true };
 * }
 * ```
 */
export type StreamingExecutor = AsyncGenerator<StreamingChunk, void, unknown>;

/**
 * Create a streaming tool wrapper from a regular tool function
 *
 * Transforms a regular Promise-based tool into a streaming executor.
 * Chunks are yielded based on delimiter detection (e.g., newlines).
 */
export function createStreamingTool<T>(
    toolFn: (input: T) => Promise<{ stdout?: string; stderr?: string }>,
    options: StreamingOptions = {}
): (input: T) => StreamingExecutor {
    return async function* (input: T): StreamingExecutor {
        const { onChunk, throttleMs = 100, bufferSize = 1024 } = options;

        try {
            // Emit progress start
            const startChunk: StreamingChunk = {
                type: 'progress',
                content: 'Starting...',
                timestamp: Date.now(),
            };
            yield startChunk;
            onChunk?.(startChunk);

            // Execute the tool
            const result = await toolFn(input);

            // Stream stdout chunk by chunk
            if (result.stdout) {
                const chunks = splitIntoChunks(result.stdout, bufferSize);
                for (const chunk of chunks) {
                    const stdoutChunk: StreamingChunk = {
                        type: 'stdout',
                        content: chunk,
                        timestamp: Date.now(),
                    };
                    yield stdoutChunk;
                    onChunk?.(stdoutChunk);

                    // Throttle delivery
                    if (throttleMs > 0) {
                        await delay(throttleMs);
                    }
                }
            }

            // Stream stderr if present
            if (result.stderr) {
                const chunks = splitIntoChunks(result.stderr, bufferSize);
                for (const chunk of chunks) {
                    const stderrChunk: StreamingChunk = {
                        type: 'stderr',
                        content: chunk,
                        timestamp: Date.now(),
                    };
                    yield stderrChunk;
                    onChunk?.(stderrChunk);

                    if (throttleMs > 0) {
                        await delay(throttleMs);
                    }
                }
            }

            // Emit completion
            const completeChunk: StreamingChunk = {
                type: 'complete',
                content: 'Execution complete',
                timestamp: Date.now(),
                isFinal: true,
            };
            yield completeChunk;
            onChunk?.(completeChunk);
        } catch (error) {
            const errorChunk: StreamingChunk = {
                type: 'error',
                content: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
                isFinal: true,
            };
            yield errorChunk;
            onChunk?.(errorChunk);
        }
    };
}

/**
 * Split text into chunks by delimiter (default: newlines)
 */
function splitIntoChunks(text: string, maxSize: number): string[] {
    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        // Find last newline within maxSize
        let splitIndex = maxSize;
        if (remaining.length > maxSize) {
            const lastNewline = remaining.lastIndexOf('\n', maxSize);
            if (lastNewline > 0) {
                splitIndex = lastNewline + 1;
            }
        }

        chunks.push(remaining.slice(0, splitIndex));
        remaining = remaining.slice(splitIndex);
    }

    return chunks;
}

/**
 * Delay utility for throttling
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Collect all chunks from a streaming executor
 */
export async function collectChunks(
    executor: StreamingExecutor
): Promise<StreamingChunk[]> {
    const chunks: StreamingChunk[] = [];

    for await (const chunk of executor) {
        chunks.push(chunk);
    }

    return chunks;
}

/**
 * Convert streaming chunks to full output string
 */
export function chunksToString(chunks: StreamingChunk[]): string {
    return chunks
        .filter((c) => c.type === 'stdout' || c.type === 'stderr')
        .map((c) => c.content)
        .join('');
}

/**
 * Progressive output buffer for UI
 */
export class ProgressiveOutputBuffer {
    private chunks: StreamingChunk[] = [];
    private maxSize: number;

    constructor(maxSize: number = 1000) {
        this.maxSize = maxSize;
    }

    /**
     * Add a chunk to the buffer
     */
    add(chunk: StreamingChunk): void {
        this.chunks.push(chunk);

        // Keep buffer size under limit
        if (this.chunks.length > this.maxSize) {
            this.chunks = this.chunks.slice(-this.maxSize);
        }
    }

    /**
     * Get current output as string
     */
    toString(): string {
        return chunksToString(this.chunks);
    }

    /**
     * Get all chunks
     */
    getChunks(): StreamingChunk[] {
        return [...this.chunks];
    }

    /**
     * Clear buffer
     */
    clear(): void {
        this.chunks = [];
    }

    /**
     * Get buffer size
     */
    size(): number {
        return this.chunks.length;
    }
}
