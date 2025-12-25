/**
 * DiffPreview - File changes diff view with syntax highlighting
 *
 * @epic Epic-28 Story 28-21
 * @integrates Epic-25 Story 25-5 - AI tool results include diff content
 * @integrates Epic-6 Story 6-X - Coder agent file modifications
 * @integrates Story 28-20 - CodeBlock syntax highlighting patterns
 * @integrates Story 28-22 - ApprovalOverlay embeds DiffPreview
 *
 * @description
 * Premium diff preview component showing file changes proposed by AI agents.
 * Uses unified diff format with additions (green) and deletions (red).
 * Features line numbers, file path header, and pixel aesthetic styling.
 *
 * @roadmap
 * - Epic 27: Integrate jsdiff or myers algorithm for better diffs
 * - Epic 26: Add multi-file diff support
 *
 * @example
 * ```tsx
 * <DiffPreview
 *   filePath="src/App.tsx"
 *   oldCode={originalContent}
 *   newCode={modifiedContent}
 * />
 * ```
 */

import { cn } from '@/lib/utils';
import {
    FileCode,
    Plus,
    Minus,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for DiffPreview component
 */
export interface DiffPreviewProps {
    /** Original file content */
    oldCode: string;
    /** Modified file content */
    newCode: string;
    /** File path for display */
    filePath?: string;
    /** Language for syntax highlighting */
    language?: string;
    /** Whether to show line numbers */
    showLineNumbers?: boolean;
    /** Maximum unchanged lines to show before collapsing */
    collapseThreshold?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Represents a single diff line
 */
interface DiffLine {
    type: 'add' | 'remove' | 'unchanged';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
}

/**
 * Simple line-based diff algorithm (LCS-inspired)
 * For Phase 6, we use a simple approach. Epic 27+ can integrate jsdiff.
 */
function computeDiff(oldText: string, newText: string): DiffLine[] {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const result: DiffLine[] = [];

    let oldIdx = 0;
    let newIdx = 0;
    let oldLineNum = 1;
    let newLineNum = 1;

    // Simple sequential comparison
    while (oldIdx < oldLines.length || newIdx < newLines.length) {
        const oldLine = oldLines[oldIdx];
        const newLine = newLines[newIdx];

        if (oldIdx >= oldLines.length) {
            // Only new lines remaining - additions
            result.push({
                type: 'add',
                content: newLine,
                newLineNumber: newLineNum++,
            });
            newIdx++;
        } else if (newIdx >= newLines.length) {
            // Only old lines remaining - deletions
            result.push({
                type: 'remove',
                content: oldLine,
                oldLineNumber: oldLineNum++,
            });
            oldIdx++;
        } else if (oldLine === newLine) {
            // Lines match - unchanged
            result.push({
                type: 'unchanged',
                content: oldLine,
                oldLineNumber: oldLineNum++,
                newLineNumber: newLineNum++,
            });
            oldIdx++;
            newIdx++;
        } else {
            // Lines differ - look ahead to find best match
            const oldMatch = newLines.slice(newIdx, newIdx + 5).indexOf(oldLine);
            const newMatch = oldLines.slice(oldIdx, oldIdx + 5).indexOf(newLine);

            if (oldMatch !== -1 && (newMatch === -1 || oldMatch <= newMatch)) {
                // Old line found ahead in new - new lines are additions
                for (let i = 0; i < oldMatch; i++) {
                    result.push({
                        type: 'add',
                        content: newLines[newIdx + i],
                        newLineNumber: newLineNum++,
                    });
                }
                newIdx += oldMatch;
            } else if (newMatch !== -1) {
                // New line found ahead in old - old lines are deletions
                for (let i = 0; i < newMatch; i++) {
                    result.push({
                        type: 'remove',
                        content: oldLines[oldIdx + i],
                        oldLineNumber: oldLineNum++,
                    });
                }
                oldIdx += newMatch;
            } else {
                // No match found - treat as remove + add
                result.push({
                    type: 'remove',
                    content: oldLine,
                    oldLineNumber: oldLineNum++,
                });
                result.push({
                    type: 'add',
                    content: newLine,
                    newLineNumber: newLineNum++,
                });
                oldIdx++;
                newIdx++;
            }
        }
    }

    return result;
}

/**
 * Get file extension from path
 */
function getExtension(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
}

/**
 * Language display names
 */
const LANGUAGE_MAP: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TSX',
    js: 'JavaScript',
    jsx: 'JSX',
    css: 'CSS',
    json: 'JSON',
    html: 'HTML',
    md: 'Markdown',
    py: 'Python',
    rs: 'Rust',
    go: 'Go',
};

/**
 * Line type styling
 */
const LINE_STYLES = {
    add: 'bg-green-500/10 border-l-2 border-green-500',
    remove: 'bg-red-500/10 border-l-2 border-red-500',
    unchanged: '',
};

const LINE_PREFIX_STYLES = {
    add: 'text-green-400',
    remove: 'text-red-400',
    unchanged: 'text-muted-foreground/50',
};

export function DiffPreview({
    oldCode,
    newCode,
    filePath,
    language,
    showLineNumbers = true,
    collapseThreshold = 5,
    className,
}: DiffPreviewProps) {
    const { t } = useTranslation();
    const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

    // Compute diff
    const diffLines = useMemo(() => computeDiff(oldCode, newCode), [oldCode, newCode]);

    // Calculate stats
    const stats = useMemo(() => {
        let additions = 0;
        let deletions = 0;
        diffLines.forEach(line => {
            if (line.type === 'add') additions++;
            if (line.type === 'remove') deletions++;
        });
        return { additions, deletions };
    }, [diffLines]);

    // Detect language from file path
    const displayLanguage = useMemo(() => {
        if (language) return language;
        if (filePath) {
            const ext = getExtension(filePath);
            return LANGUAGE_MAP[ext] || ext.toUpperCase();
        }
        return 'Diff';
    }, [language, filePath]);

    // Group lines with collapsible unchanged sections
    const renderableLines = useMemo(() => {
        const result: Array<DiffLine | { type: 'collapsed'; startIdx: number; count: number }> = [];
        let unchangedStart = -1;
        let unchangedCount = 0;

        diffLines.forEach((line, idx) => {
            if (line.type === 'unchanged') {
                if (unchangedStart === -1) unchangedStart = idx;
                unchangedCount++;
            } else {
                // End of unchanged section
                if (unchangedCount > collapseThreshold) {
                    // Add first 2 lines
                    for (let i = unchangedStart; i < unchangedStart + 2; i++) {
                        result.push(diffLines[i]);
                    }
                    // Add collapse indicator
                    result.push({
                        type: 'collapsed',
                        startIdx: unchangedStart + 2,
                        count: unchangedCount - 4,
                    });
                    // Add last 2 lines
                    for (let i = unchangedStart + unchangedCount - 2; i < unchangedStart + unchangedCount; i++) {
                        result.push(diffLines[i]);
                    }
                } else if (unchangedCount > 0) {
                    // Add all unchanged lines
                    for (let i = unchangedStart; i < unchangedStart + unchangedCount; i++) {
                        result.push(diffLines[i]);
                    }
                }
                unchangedStart = -1;
                unchangedCount = 0;
                result.push(line);
            }
        });

        // Handle trailing unchanged lines
        if (unchangedCount > collapseThreshold) {
            for (let i = unchangedStart; i < unchangedStart + 2; i++) {
                if (diffLines[i]) result.push(diffLines[i]);
            }
            result.push({
                type: 'collapsed',
                startIdx: unchangedStart + 2,
                count: unchangedCount - 4,
            });
            for (let i = unchangedStart + unchangedCount - 2; i < unchangedStart + unchangedCount; i++) {
                if (diffLines[i]) result.push(diffLines[i]);
            }
        } else if (unchangedCount > 0) {
            for (let i = unchangedStart; i < unchangedStart + unchangedCount; i++) {
                if (diffLines[i]) result.push(diffLines[i]);
            }
        }

        return result;
    }, [diffLines, collapseThreshold]);

    const toggleCollapse = useCallback((startIdx: number) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(startIdx)) {
                next.delete(startIdx);
            } else {
                next.add(startIdx);
            }
            return next;
        });
    }, []);

    const renderLineItem = (line: DiffLine, key: string) => {
        const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';
        return (
            <div
                key={key}
                className={cn(
                    'flex',
                    LINE_STYLES[line.type]
                )}
            >
                {/* Line numbers */}
                {showLineNumbers && (
                    <div className="flex-shrink-0 w-16 flex text-[10px] text-muted-foreground/40 select-none border-r border-border/50">
                        <span className="w-8 text-right pr-1">
                            {line.oldLineNumber ?? ''}
                        </span>
                        <span className="w-8 text-right pr-1">
                            {line.newLineNumber ?? ''}
                        </span>
                    </div>
                )}

                {/* Prefix (+/-/space) */}
                <span className={cn(
                    'w-4 text-center flex-shrink-0 select-none',
                    LINE_PREFIX_STYLES[line.type]
                )}>
                    {prefix}
                </span>

                {/* Content */}
                <span className={cn(
                    'flex-1 px-2',
                    line.type === 'add' && 'text-green-300',
                    line.type === 'remove' && 'text-red-300',
                    line.type === 'unchanged' && 'text-muted-foreground'
                )}>
                    {line.content || ' '}
                </span>
            </div>
        );
    };

    return (
        <div
            className={cn(
                // Base container - 8-bit pixel aesthetic
                'overflow-hidden',
                'border border-border bg-background/80',
                'rounded-none',
                'shadow-md',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                    {filePath && (
                        <span className="text-xs font-mono text-muted-foreground truncate max-w-[300px]">
                            {filePath}
                        </span>
                    )}
                    <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wide">
                        {displayLanguage}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                        <Plus className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">{stats.additions}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                        <Minus className="w-3 h-3 text-red-500" />
                        <span className="text-red-500">{stats.deletions}</span>
                    </div>
                </div>
            </div>

            {/* Diff content */}
            <div className="overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                    <code className="block">
                        {renderableLines.map((item, idx) => {
                            if ('type' in item && item.type === 'collapsed') {
                                const isExpanded = collapsedSections.has(item.startIdx);
                                return (
                                    <div key={`collapse-${idx}`} className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => toggleCollapse(item.startIdx)}
                                            className="w-full flex items-center justify-center gap-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 transition-colors bg-muted/20"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ChevronRight className="w-3 h-3" />
                                            )}
                                            <span>
                                                {isExpanded
                                                    ? t('chat.diff.collapse', 'Hide lines')
                                                    : t('chat.diff.linesHidden', { count: item.count, defaultValue: `${item.count} lines hidden` })}
                                            </span>
                                        </button>

                                        {isExpanded && diffLines.slice(item.startIdx, item.startIdx + item.count).map((line, subIdx) =>
                                            renderLineItem(line, `expanded-${idx}-${subIdx}`)
                                        )}
                                    </div>
                                );
                            }

                            return renderLineItem(item as DiffLine, `line-${idx}`);
                        })}
                    </code>
                </pre>
            </div>
        </div>
    );
}

export default DiffPreview;
