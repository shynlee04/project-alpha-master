/**
 * CodeBlock - AI code block with syntax highlighting and actions
 *
 * @epic Epic-28 Story 28-20
 * @integrates Epic-25 Story 25-5 - TanStack AI streaming content
 * @integrates Epic-6 Story 6-X - AI agent code generation
 * @integrates Story 28-19 - ToolCallBadge for tool context
 * @integrates Story 28-22 - ApprovalOverlay for accept flow
 *
 * @description
 * Premium code block component for displaying AI-generated code in chat.
 * Features syntax highlighting, copy to clipboard, and Accept/Reject actions.
 * Uses 8-bit pixel aesthetic with dark theme styling.
 *
 * @roadmap
 * - Epic 27: Integrate Monaco/Shiki for advanced syntax highlighting
 * - Epic 26: Add multi-agent code suggestions support
 *
 * @example
 * ```tsx
 * <CodeBlock
 *   code="const x = 1;"
 *   language="typescript"
 *   onAccept={(code) => applyToEditor(code)}
 *   onReject={() => dismissBlock()}
 * />
 * ```
 */

import { cn } from '@/lib/utils';
import {
    ClipboardCopy,
    Check,
    X,
    CheckCircle,
    FileCode,
    ChevronDown,
    ChevronUp,
    Eye,
    Save,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Props for CodeBlock component
 */
export interface CodeBlockProps {
    /** Code content to display */
    code: string;
    /** Language identifier for syntax highlighting (e.g., "typescript", "javascript") */
    language?: string;
    /** Show line numbers */
    showLineNumbers?: boolean;
    /** File path for context (optional) */
    filePath?: string;
    /** Callback when copy button is clicked */
    onCopy?: (code: string) => void;
    /** Callback when Accept button is clicked (makes actions visible) */
    onAccept?: (code: string) => void;
    /** Callback when Reject button is clicked (makes actions visible) */
    onReject?: () => void;
    /** Callback when Preview button is clicked (for HTML/SVG) */
    onPreview?: (code: string) => void;
    /** Callback when Save button is clicked */
    onSave?: (code: string, language: string) => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Language display names mapping
 */
const LANGUAGE_LABELS: Record<string, string> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    tsx: 'TSX',
    jsx: 'JSX',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    json: 'JSON',
    bash: 'Bash',
    shell: 'Shell',
    python: 'Python',
    rust: 'Rust',
    go: 'Go',
    sql: 'SQL',
    yaml: 'YAML',
    markdown: 'Markdown',
    md: 'Markdown',
};

/**
 * Get display label for language
 */
function getLanguageLabel(lang?: string): string {
    if (!lang) return 'Code';
    return LANGUAGE_LABELS[lang.toLowerCase()] || lang.toUpperCase();
}

/**
 * Simple tokenizer for basic syntax highlighting
 * For Phase 6, we keep this simple. Epic 27+ can integrate Monaco/Shiki.
 */
function tokenizeLine(line: string, language?: string): JSX.Element {
    // Keywords by language
    const keywords = [
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
        'import', 'export', 'from', 'default', 'async', 'await', 'class', 'extends',
        'interface', 'type', 'enum', 'public', 'private', 'protected', 'static',
        'new', 'this', 'super', 'try', 'catch', 'finally', 'throw',
    ];

    // Simple regex-based tokenization
    const parts: JSX.Element[] = [];
    let remaining = line;
    let index = 0;

    while (remaining.length > 0) {
        // String literals (single, double, backtick)
        const stringMatch = remaining.match(/^(['"`])(?:(?!\1)[^\\]|\\.)*\1/);
        if (stringMatch) {
            parts.push(
                <span key={index++} className="text-green-400">
                    {stringMatch[0]}
                </span>
            );
            remaining = remaining.slice(stringMatch[0].length);
            continue;
        }

        // Comments (// and /* */)
        const commentMatch = remaining.match(/^\/\/.*$/) || remaining.match(/^\/\*[\s\S]*?\*\//);
        if (commentMatch) {
            parts.push(
                <span key={index++} className="text-gray-500 italic">
                    {commentMatch[0]}
                </span>
            );
            remaining = remaining.slice(commentMatch[0].length);
            continue;
        }

        // Numbers
        const numberMatch = remaining.match(/^\b\d+(\.\d+)?\b/);
        if (numberMatch) {
            parts.push(
                <span key={index++} className="text-orange-400">
                    {numberMatch[0]}
                </span>
            );
            remaining = remaining.slice(numberMatch[0].length);
            continue;
        }

        // Keywords
        const wordMatch = remaining.match(/^\b[a-zA-Z_][a-zA-Z0-9_]*\b/);
        if (wordMatch) {
            const word = wordMatch[0];
            if (keywords.includes(word)) {
                parts.push(
                    <span key={index++} className="text-purple-400 font-semibold">
                        {word}
                    </span>
                );
            } else if (word[0] === word[0].toUpperCase() && /^[A-Z]/.test(word)) {
                // PascalCase (likely type/class)
                parts.push(
                    <span key={index++} className="text-yellow-400">
                        {word}
                    </span>
                );
            } else if (remaining.slice(word.length).match(/^\s*\(/)) {
                // Function call
                parts.push(
                    <span key={index++} className="text-blue-400">
                        {word}
                    </span>
                );
            } else {
                parts.push(<span key={index++}>{word}</span>);
            }
            remaining = remaining.slice(word.length);
            continue;
        }

        // Operators and punctuation
        const opMatch = remaining.match(/^[=<>!+\-*/%&|^~?:;,.()\[\]{}]+/);
        if (opMatch) {
            parts.push(
                <span key={index++} className="text-gray-400">
                    {opMatch[0]}
                </span>
            );
            remaining = remaining.slice(opMatch[0].length);
            continue;
        }

        // Whitespace
        const wsMatch = remaining.match(/^\s+/);
        if (wsMatch) {
            parts.push(<span key={index++}>{wsMatch[0]}</span>);
            remaining = remaining.slice(wsMatch[0].length);
            continue;
        }

        // Default: single character
        parts.push(<span key={index++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
    }

    return <>{parts}</>;
}

export function CodeBlock({
    code,
    language,
    showLineNumbers = false,
    filePath,
    onCopy,
    onAccept,
    onReject,
    onPreview,
    onSave,
    className,
}: CodeBlockProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const lines = code.split('\n');
    const isLarge = lines.length > 15;
    const [isCollapsed, setIsCollapsed] = useState(isLarge);
    const showActions = onAccept || onReject;
    const visibleLines = isCollapsed ? lines.slice(0, 10) : lines;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success(t('chat.codeBlock.copied', 'Copied!'));
            onCopy?.(code);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                toast.success(t('chat.codeBlock.copied', 'Copied!'));
                onCopy?.(code);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                toast.error('Failed to copy');
            }
            document.body.removeChild(textArea);
        }
    }, [code, onCopy, t]);

    const handleAccept = useCallback(() => {
        setAccepted(true);
        onAccept?.(code);
    }, [code, onAccept]);

    const handleReject = useCallback(() => {
        setDismissed(true);
        onReject?.();
    }, [onReject]);

    // Don't render if dismissed
    if (dismissed) {
        return null;
    }

    return (
        <div
            className={cn(
                // Base container - 8-bit pixel aesthetic
                'relative overflow-hidden',
                'border border-border bg-background/80',
                'rounded-none',
                'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
                'transition-all duration-200',
                // Accepted state
                accepted && 'border-green-500/50 bg-green-500/5',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wide">
                        {getLanguageLabel(language)}
                    </span>
                    {filePath && (
                        <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[200px]">
                            {filePath}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {/* Preview Button (HTML only) */}
                    {onPreview && (language === 'html' || language === 'svg') && (
                        <button
                            type="button"
                            onClick={() => onPreview(code)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-all hover:bg-primary/20 active:translate-y-[1px]"
                            aria-label={t('chat.codeBlock.preview', 'Preview')}
                            title={t('chat.codeBlock.preview', 'Preview')}
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Save Button */}
                    {onSave && (
                        <button
                            type="button"
                            onClick={() => onSave(code, language || 'text')}
                            className="p-1 text-muted-foreground hover:text-foreground transition-all hover:bg-primary/20 active:translate-y-[1px]"
                            aria-label={t('chat.codeBlock.save', 'Save')}
                            title={t('chat.codeBlock.save', 'Save')}
                        >
                            <Save className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Line count */}
                    <span className="text-[9px] font-mono text-muted-foreground/60 mr-2 ml-1">
                        {t('chat.codeBlock.lines', { count: lines.length, defaultValue: `${lines.length} lines` })}
                    </span>

                    {/* Copy button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                            'p-1 rounded-none transition-all',
                            'hover:bg-primary/20 active:translate-y-[1px]',
                            copied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
                        )}
                        aria-label={t('chat.codeBlock.copy', 'Copy')}
                    >
                        {copied ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                            <ClipboardCopy className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Code content - collapsible for large blocks */}
            <div className={cn(
                'overflow-x-auto transition-all duration-200',
                isCollapsed && isLarge ? 'max-h-[240px]' : 'max-h-[500px]',
                'overflow-y-auto'
            )}>
                <pre className="p-3 text-sm font-mono leading-relaxed">
                    <code className="block">
                        {visibleLines.map((line, idx) => (
                            <div key={idx} className="flex">
                                {showLineNumbers && (
                                    <span className="select-none text-muted-foreground/40 w-8 text-right pr-3 flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                )}
                                <span className="flex-1">{tokenizeLine(line, language)}</span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>

            {/* Expand/Collapse toggle for large blocks */}
            {isLarge && (
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        'w-full flex items-center justify-center gap-1 py-1.5',
                        'bg-muted/30 border-t border-border',
                        'text-[10px] font-mono text-muted-foreground hover:text-foreground',
                        'transition-colors'
                    )}
                >
                    {isCollapsed ? (
                        <>
                            <ChevronDown className="w-3 h-3" />
                            {t('chat.codeBlock.showMore', `Show all ${lines.length} lines`)}
                        </>
                    ) : (
                        <>
                            <ChevronUp className="w-3 h-3" />
                            {t('chat.codeBlock.showLess', 'Collapse')}
                        </>
                    )}
                </button>
            )}

            {/* Action buttons */}
            {showActions && !accepted && (
                <div className="flex items-center justify-end gap-2 px-3 py-2 bg-muted/30 border-t border-border">
                    {onReject && (
                        <button
                            type="button"
                            onClick={handleReject}
                            className={cn(
                                'flex items-center gap-1 px-2 py-1',
                                'text-xs font-mono font-semibold',
                                'bg-red-500/10 text-red-500 border border-red-500/30',
                                'rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]',
                                'hover:bg-red-500/20 active:translate-y-[1px] active:shadow-none',
                                'transition-all duration-150'
                            )}
                            aria-label={t('chat.codeBlock.reject', 'Reject')}
                        >
                            <X className="w-3 h-3" />
                            {t('chat.codeBlock.reject', 'Reject')}
                        </button>
                    )}
                    {onAccept && (
                        <button
                            type="button"
                            onClick={handleAccept}
                            className={cn(
                                'flex items-center gap-1 px-2 py-1',
                                'text-xs font-mono font-semibold',
                                'bg-green-500/10 text-green-500 border border-green-500/30',
                                'rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]',
                                'hover:bg-green-500/20 active:translate-y-[1px] active:shadow-none',
                                'transition-all duration-150'
                            )}
                            aria-label={t('chat.codeBlock.accept', 'Accept')}
                        >
                            <Check className="w-3 h-3" />
                            {t('chat.codeBlock.accept', 'Accept')}
                        </button>
                    )}
                </div>
            )}

            {/* Accepted state indicator */}
            {accepted && (
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 border-t border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-mono font-semibold text-green-500">
                        {t('chat.codeBlock.accepted', 'Accepted')}
                    </span>
                </div>
            )}
        </div>
    );
}

export default CodeBlock;
