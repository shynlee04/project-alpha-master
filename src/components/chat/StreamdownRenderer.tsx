/**
 * @fileoverview StreamdownRenderer - Rich Markdown Rendering for AI Streaming
 * @module components/chat/StreamdownRenderer
 * 
 * Uses Vercel's Streamdown library for AI-optimized streaming markdown rendering.
 * Supports:
 * - Incomplete markdown handling during stream
 * - Mermaid diagrams (flowcharts, sequence, class diagrams)
 * - Code blocks with syntax highlighting
 * - Full markdown formatting (headers, lists, tables, links)
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { memo } from 'react';
import { Streamdown } from 'streamdown';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

/**
 * Props for StreamdownRenderer component
 */
interface StreamdownRendererProps {
    /** Markdown content to render */
    content: string;
    /** Whether content is still streaming */
    isStreaming?: boolean;
    /** Additional CSS class names */
    className?: string;
}

/**
 * Mermaid theme configuration for Via-gent IDE
 * Matches the 8-bit pixel aesthetic with modern colors
 */
const getMermaidConfig = (isDark: boolean) => ({
    theme: isDark ? 'dark' : 'default',
    themeVariables: isDark ? {
        primaryColor: '#3b82f6',      // Blue-500
        primaryTextColor: '#f8fafc',   // Slate-50
        primaryBorderColor: '#60a5fa', // Blue-400
        lineColor: '#94a3b8',          // Slate-400
        secondaryColor: '#8b5cf6',     // Violet-500
        tertiaryColor: '#22d3ee',      // Cyan-400
        background: '#0f172a',         // Slate-900
        mainBkg: '#1e293b',            // Slate-800
        nodeBorder: '#475569',         // Slate-600
        clusterBkg: '#1e293b',
        clusterBorder: '#334155',
        titleColor: '#f8fafc',
        edgeLabelBackground: '#1e293b',
        nodeTextColor: '#f8fafc',
    } : {
        primaryColor: '#2563eb',       // Blue-600
        primaryTextColor: '#1e293b',   // Slate-800
        primaryBorderColor: '#3b82f6', // Blue-500
        lineColor: '#64748b',          // Slate-500
        secondaryColor: '#7c3aed',     // Violet-600
        tertiaryColor: '#0d9488',      // Teal-600
        background: '#ffffff',
        mainBkg: '#f8fafc',
        nodeBorder: '#cbd5e1',         // Slate-300
        clusterBkg: '#f1f5f9',         // Slate-100
        clusterBorder: '#e2e8f0',
        titleColor: '#0f172a',
        edgeLabelBackground: '#f8fafc',
        nodeTextColor: '#1e293b',
    }
});

/**
 * Custom error component for failed Mermaid diagrams
 */
const MermaidError = ({ error, retry }: { error: Error; retry: () => void }) => (
    <div className="my-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm font-mono">
                ⚠️ Diagram Error
            </span>
        </div>
        <p className="text-amber-700 dark:text-amber-300 text-xs font-mono mb-2">
            {error.message}
        </p>
        <button
            onClick={retry}
            className="px-3 py-1 text-xs font-mono bg-amber-100 dark:bg-amber-800 
                       text-amber-700 dark:text-amber-200 rounded hover:bg-amber-200 
                       dark:hover:bg-amber-700 transition-colors"
        >
            ↻ Retry Render
        </button>
    </div>
);

/**
 * StreamdownRenderer - AI-optimized markdown renderer
 * 
 * Uses Vercel's Streamdown for streaming-safe markdown rendering with:
 * - Built-in Mermaid diagram support
 * - Code block syntax highlighting
 * - Handles incomplete markdown during streaming
 * 
 * @example
 * ```tsx
 * <StreamdownRenderer 
 *   content={message.content} 
 *   isStreaming={isLoading}
 * />
 * ```
 */
function StreamdownRendererComponent({
    content,
    isStreaming = false,
    className,
}: StreamdownRendererProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    if (!content) {
        return null;
    }

    return (
        <div
            className={cn(
                'streamdown-container prose prose-sm dark:prose-invert max-w-none',
                'prose-headings:font-mono prose-headings:font-bold',
                'prose-code:font-mono prose-code:text-sm',
                'prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700',
                'prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline',
                'prose-table:border-collapse prose-th:border prose-th:border-slate-600',
                'prose-th:px-3 prose-th:py-2 prose-th:bg-slate-800',
                'prose-td:border prose-td:border-slate-700 prose-td:px-3 prose-td:py-2',
                isStreaming && 'animate-pulse-subtle',
                className
            )}
        >
            <Streamdown
                mermaid={{
                    config: getMermaidConfig(isDark),
                    errorComponent: MermaidError,
                }}
                controls={{
                    mermaid: {
                        fullscreen: true,
                        download: true,
                        copy: true,
                    },
                    code: {
                        copy: true,
                    },
                }}
            >
                {content}
            </Streamdown>
        </div>
    );
}

/**
 * Memoized StreamdownRenderer to prevent unnecessary re-renders
 * Only re-renders when content or theme changes
 */
export const StreamdownRenderer = memo(StreamdownRendererComponent, (prev, next) => {
    return prev.content === next.content &&
        prev.isStreaming === next.isStreaming &&
        prev.className === next.className;
});

StreamdownRenderer.displayName = 'StreamdownRenderer';

export default StreamdownRenderer;
