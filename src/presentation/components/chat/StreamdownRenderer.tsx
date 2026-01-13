/**
 * @fileoverview StreamdownRenderer - Rich Markdown Rendering for AI Streaming
 * @module components/chat/StreamdownRenderer
 * 
 * Rich markdown renderer supporting:
 * - Full markdown formatting (headers, lists, tables, links)
 * - Code blocks with syntax highlighting
 * - Mermaid diagrams (flowcharts, sequence, class diagrams)
 * - Streaming-safe rendering
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { memo, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CodeBlock } from './CodeBlock';
import { CollapsibleSection } from './CollapsibleSection';

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
    /** Callback for artifact preview */
    onPreviewArtifact?: (code: string) => void;
    /** Callback for artifact save */
    onSaveArtifact?: (code: string, language: string) => void;
}

/**
 * CHAT-007: Mermaid diagram renderer with collapsible support
 *
 * Diagrams taller than 250px are collapsed by default.
 * Users can expand/collapse via header toggle.
 */
function MermaidDiagram({ code }: { code: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        let mounted = true;

        async function renderMermaid() {
            try {
                // Dynamically import mermaid
                const mermaid = await import('mermaid');

                mermaid.default.initialize({
                    startOnLoad: false,
                    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
                    securityLevel: 'loose',
                    fontFamily: 'ui-monospace, monospace',
                });

                const id = `mermaid-${Date.now()}`;
                const { svg: renderedSvg } = await mermaid.default.render(id, code);

                if (mounted) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to render diagram');
                }
            }
        }

        if (code.trim()) {
            renderMermaid();
        }

        return () => {
            mounted = false;
        };
    }, [code, resolvedTheme]);

    if (error) {
        return (
            <div className={cn(
                'my-4 p-4 rounded-sm border-2',
                'border-warning bg-warning/20 text-warning',
                'font-mono text-xs'
            )}>
                <div className="font-bold mb-2">⚠️ Diagram Error</div>
                <pre className="whitespace-pre-wrap">{error}</pre>
                <pre className="mt-2 p-2 bg-muted rounded text-muted-foreground text-[10px]">
                    {code}
                </pre>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className={cn(
                'my-4 p-4 rounded-sm border-2 border-border bg-secondary',
                'flex items-center justify-center text-muted-foreground font-mono text-sm'
            )}>
                Loading diagram...
            </div>
        );
    }

    // CHAT-007: Wrap diagram in collapsible section
    const diagramContent = (
        <div
            ref={containerRef}
            className={cn(
                'overflow-auto',
                '[&_svg]:max-w-full [&_svg]:h-auto'
            )}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );

    return (
        <CollapsibleSection
            title="Diagram"
            collapseThreshold={250}
            variant="default"
            className="my-4"
        >
            <div className="p-4 bg-secondary">
                {diagramContent}
            </div>
        </CollapsibleSection>
    );
}

/**
 * StreamdownRenderer - AI-optimized markdown renderer
 * 
 * Uses react-markdown with custom renderers for:
 * - Code blocks with syntax highlighting
 * - Mermaid diagrams
 * - Tables, lists, and other markdown elements
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
    onPreviewArtifact,
    onSaveArtifact,
}: StreamdownRendererProps) {
    if (!content) {
        return null;
    }

    return (
        <div
            className={cn(
                'streamdown-container prose prose-sm dark:prose-invert max-w-none',
                'prose-headings:font-mono prose-headings:font-bold',
                'prose-code:font-mono prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:rounded',
                'prose-pre:bg-transparent prose-pre:p-0',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-table:border-collapse',
                'prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-secondary prose-th:font-mono',
                'prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2',
                'prose-li:marker:text-muted-foreground',
                'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary prose-blockquote:px-4 prose-blockquote:py-2',
                isStreaming && 'animate-pulse-subtle',
                className
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom code block renderer
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const code = String(children).replace(/\n$/, '');

                        // Check if it's a mermaid diagram
                        if (language === 'mermaid') {
                            return <MermaidDiagram code={code} />;
                        }

                        // Inline code vs code block
                        const isInline = !className;

                        if (isInline) {
                            return (
                                <code className="font-mono text-sm bg-secondary px-1 rounded-sm" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <CodeBlock
                                code={code}
                                language={language || 'text'}
                                showLineNumbers
                                onPreview={onPreviewArtifact}
                                onSave={onSaveArtifact}
                            />
                        );
                    },
                    // Pre element - just pass through children (code block handles rendering)
                    pre({ children }) {
                        return <>{children}</>;
                    },
                    // Enhanced table styling
                    table({ children }) {
                        return (
                            <div className="overflow-x-auto my-4">
                                <table className="min-w-full border-2 border-border">
                                    {children}
                                </table>
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div >
    );
}

/**
 * Memoized StreamdownRenderer to prevent unnecessary re-renders
 */
export const StreamdownRenderer = memo(StreamdownRendererComponent, (prev, next) => {
    return prev.content === next.content &&
        prev.isStreaming === next.isStreaming &&
        prev.className === next.className &&
        prev.onPreviewArtifact === next.onPreviewArtifact &&
        prev.onSaveArtifact === next.onSaveArtifact;
});

StreamdownRenderer.displayName = 'StreamdownRenderer';

export default StreamdownRenderer;
