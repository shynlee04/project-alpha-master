/**
 * StreamingMessage - Token-by-token AI response display component
 * 
 * @epic Epic-28 Story 28-23
 * @integrates Story 28-20 (CodeBlock) - Renders fenced code blocks
 * @integrates Story 28-19 (ToolCallBadge) - Renders tool execution badges
 * @see _bmad-output/sprint-artifacts/28-23-streaming-message-container.md
 */

import { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { CodeBlock } from '../chat/CodeBlock';
// ToolCallBadge integration point - will be wired when tool events are available
// import { ToolCallBadge } from '../chat/ToolCallBadge';

export interface StreamingMessageProps {
    /** The full content to display (will be streamed character by character) */
    content: string;
    /** Typing speed in ms per character (default: 10) */
    typingSpeed?: number;
    /** If true, render all content immediately without streaming effect */
    instant?: boolean;
    /** Callback when streaming is complete */
    onComplete?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Parses content and splits it into text parts and code blocks.
 * This enables rendering code blocks with the CodeBlock component.
 */
function parseContent(content: string): Array<{ type: 'text' | 'code'; value: string; language?: string }> {
    const parts: Array<{ type: 'text' | 'code'; value: string; language?: string }> = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
        }
        // Add code block
        parts.push({
            type: 'code',
            value: match[2].trim(),
            language: match[1] || 'text'
        });
        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push({ type: 'text', value: content.slice(lastIndex) });
    }

    return parts;
}

/**
 * Simple markdown text renderer for non-code content.
 * Handles bold, italic, inline code, and line breaks.
 */
function renderMarkdownText(text: string): React.ReactNode {
    // Split by inline patterns and render
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
        // Parse inline bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

        const rendered = parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={idx} className="px-1 py-0.5 bg-muted font-mono text-xs rounded-none">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            return part;
        });

        return (
            <span key={lineIdx}>
                {rendered}
                {lineIdx < lines.length - 1 && <br />}
            </span>
        );
    });
}

export const StreamingMessage = memo(function StreamingMessage({
    content,
    typingSpeed = 10,
    instant = false,
    onComplete,
    className
}: StreamingMessageProps) {
    const [displayedLength, setDisplayedLength] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Reset when content changes to something shorter (new message)
    useEffect(() => {
        if (content.length < displayedLength) {
            setDisplayedLength(0);
            setIsComplete(false);
        }
    }, [content, displayedLength]);

    // Handle instant mode
    useEffect(() => {
        if (instant && displayedLength !== content.length) {
            setDisplayedLength(content.length);
            setIsComplete(true);
            onComplete?.();
        }
    }, [instant, content.length, displayedLength, onComplete]);

    // Streaming effect - advances one character at a time
    useEffect(() => {
        if (instant) return;
        if (displayedLength >= content.length) {
            if (!isComplete) {
                setIsComplete(true);
                onComplete?.();
            }
            return;
        }

        const timer = setTimeout(() => {
            setDisplayedLength(prev => Math.min(prev + 1, content.length));
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [content, displayedLength, typingSpeed, instant, isComplete, onComplete]);

    // Get the currently visible portion of content
    const visibleContent = content.slice(0, displayedLength);
    const parts = parseContent(visibleContent);

    return (
        <div
            data-testid="streaming-content"
            className={cn(
                "text-sm leading-relaxed break-words",
                // 8-bit pixel aesthetic - no rounded corners, pixel shadow
                "font-mono",
                className
            )}
        >
            {parts.map((part, idx) => {
                if (part.type === 'code') {
                    return (
                        <div key={idx} className="my-3">
                            <CodeBlock
                                code={part.value}
                                language={part.language || 'text'}
                                showLineNumbers
                                className="max-w-full"
                            />
                        </div>
                    );
                }
                return <span key={idx}>{renderMarkdownText(part.value)}</span>;
            })}

            {/* Blinking cursor when still streaming */}
            {!isComplete && displayedLength < content.length && (
                <span
                    className="inline-block w-2 h-4 ml-0.5 align-text-bottom bg-primary animate-pulse"
                    aria-hidden="true"
                />
            )}
        </div>
    );
});

export default StreamingMessage;
