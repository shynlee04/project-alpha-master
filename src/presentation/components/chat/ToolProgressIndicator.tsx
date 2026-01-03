/**
 * Tool Progress Indicator Component
 *
 * Ralph Loop Cycle 5: Real-Time Tool Output Streaming
 *
 * Displays real-time streaming output from tool execution.
 * Shows progress indicators, output chunks, and completion status.
 *
 * @component
 */

import { useEffect, useRef, useState } from 'react';
import { Terminal, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { StreamingChunk } from '@/lib/agent/tools/streaming';
import { ProgressiveOutputBuffer } from '@/lib/agent/tools/streaming';

export interface ToolProgressIndicatorProps {
    /** Tool name being executed */
    toolName: string;
    /** Streaming chunks to display */
    chunks: StreamingChunk[];
    /** Is execution in progress? */
    isExecuting: boolean;
    /** Error message if any */
    error?: string | null;
    /** Maximum number of chunks to display */
    maxChunks?: number;
    /** Auto-scroll to bottom? */
    autoScroll?: boolean;
}

/**
 * Tool progress indicator component
 */
export function ToolProgressIndicator({
    toolName,
    chunks,
    isExecuting,
    error,
    maxChunks = 100,
    autoScroll = true,
}: ToolProgressIndicatorProps) {
    const outputRef = useRef<HTMLDivElement>(null);
    const buffer = new ProgressiveOutputBuffer(maxChunks);

    // Add chunks to buffer
    chunks.forEach((chunk) => buffer.add(chunk));

    // Auto-scroll to bottom when new chunks arrive
    useEffect(() => {
        if (autoScroll && outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [chunks, autoScroll]);

    // Get status
    const getStatus = () => {
        if (error) return 'error';
        if (isExecuting) return 'running';
        if (chunks.length > 0) return 'success';
        return 'pending';
    };

    const status = getStatus();

    return (
        <div className="tool-progress-indicator border rounded-lg overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-accent/5">
                <Terminal className="w-4 h-4 text-accent-foreground" />
                <span className="font-medium text-sm flex-1">{toolName}</span>
                <StatusBadge status={status} />
            </div>

            {/* Output */}
            <div
                ref={outputRef}
                className="output-container p-3 font-mono text-xs bg-background max-h-64 overflow-y-auto"
            >
                {chunks.length === 0 && !isExecuting && (
                    <p className="text-foreground/50 italic">Waiting for execution...</p>
                )}

                {chunks.map((chunk, index) => (
                    <ChunkLine key={index} chunk={chunk} />
                ))}

                {isExecuting && (
                    <div className="flex items-center gap-2 text-accent mt-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Executing...</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            {error && (
                <div className="px-3 py-2 border-t bg-destructive/10 text-destructive text-xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: 'pending' | 'running' | 'success' | 'error' }) {
    const variants = {
        pending: {
            icon: null,
            text: 'Pending',
            className: 'bg-foreground/10 text-foreground/70',
        },
        running: {
            icon: Loader2,
            text: 'Running',
            className: 'bg-accent/20 text-accent-foreground',
        },
        success: {
            icon: CheckCircle2,
            text: 'Complete',
            className: 'bg-green-500/20 text-green-600',
        },
        error: {
            icon: AlertCircle,
            text: 'Error',
            className: 'bg-destructive/20 text-destructive',
        },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${variant.className}`}>
            {Icon && <Icon className="w-3 h-3" />}
            <span>{variant.text}</span>
        </div>
    );
}

/**
 * Single chunk line
 */
function ChunkLine({ chunk }: { chunk: StreamingChunk }) {
    const getTypeStyles = () => {
        switch (chunk.type) {
            case 'stderr':
                return 'text-destructive';
            case 'progress':
                return 'text-accent-foreground/70 italic';
            case 'error':
                return 'text-destructive font-medium';
            case 'complete':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-foreground/90';
        }
    };

    return (
        <div className={`chunk-line ${getTypeStyles()}`}>
            <span className="whitespace-pre-wrap break-words">{chunk.content}</span>
        </div>
    );
}

/**
 * Hook for managing tool progress state
 */
export function useToolProgress() {
    const [chunks, setChunks] = useState<StreamingChunk[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const start = () => {
        setIsExecuting(true);
        setError(null);
        setChunks([]);
    };

    const addChunk = (chunk: StreamingChunk) => {
        setChunks((prev) => [...prev, chunk]);
        if (chunk.type === 'error') {
            setError(chunk.content);
        }
        if (chunk.isFinal) {
            setIsExecuting(false);
        }
    };

    const complete = (err?: string) => {
        setIsExecuting(false);
        if (err) setError(err);
    };

    const reset = () => {
        setChunks([]);
        setIsExecuting(false);
        setError(null);
    };

    return {
        chunks,
        isExecuting,
        error,
        start,
        addChunk,
        complete,
        reset,
    };
}
