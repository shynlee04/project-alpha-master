/**
 * @fileoverview Line Diff Component
 * @module components/diff/LineDiff
 *
 * Displays a single diff line with appropriate styling and inline highlighting.
 * Supports 8-bit gaming style without blur effects.
 *
 * @story S-029 File Comparison and Diff Viewer
 */

import React from 'react';
import { ChangeType, type DiffLine } from '@/lib/diff/diff-generator';

/**
 * Props for LineDiff component
 */
export interface LineDiffProps {
  /** Diff line to display */
  line: DiffLine;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** View mode for styling */
  viewMode?: 'unified' | 'side-by-side';
  /** CSS class name for custom styling */
  className?: string;
}

/**
 * Get CSS classes for change type
 */
function getChangeTypeClasses(type: ChangeType): string {
  const baseClasses = 'font-mono text-sm whitespace-pre';

  switch (type) {
    case ChangeType.ADDED:
      return `${baseClasses} bg-success/20 text-success`;
    case ChangeType.REMOVED:
      return `${baseClasses} bg-destructive/20 text-destructive`;
    case ChangeType.MODIFIED:
      return `${baseClasses} bg-warning/20 text-warning`;
    case ChangeType.UNCHANGED:
    default:
      return `${baseClasses} text-foreground`;
  }
}

/**
 * Get line number display for change type
 */
function getLineNumberDisplay(
  type: ChangeType,
  lineNumber: number | null,
  viewType: 'old' | 'new'
): string {
  if (lineNumber === null) {
    return '';
  }

  if (type === ChangeType.ADDED && viewType === 'old') {
    return '';
  }
  if (type === ChangeType.REMOVED && viewType === 'new') {
    return '';
  }

  return String(lineNumber);
}

/**
 * Render inline diff highlighting for modified lines
 */
function renderInlineHighlight(
  content: string,
  type: ChangeType
): React.ReactNode {
  // For added/removed lines, highlight entire content
  if (type === ChangeType.ADDED || type === ChangeType.REMOVED) {
    return (
      <span className="px-1">
        {content || ' '}
      </span>
    );
  }

  // For modified lines, could add word-level highlighting here
  // For now, just return content
  return <span>{content || ' '}</span>;
}

/**
 * LineDiff component
 *
 * Displays a single line of diff with:
 * - Line numbers (old and new)
 * - Change type highlighting (green/red/yellow)
 * - 8-bit gaming style (flat colors, no blur)
 * - Accessible with proper ARIA labels
 */
export function LineDiff({
  line,
  showLineNumbers = true,
  viewMode = 'unified',
  className = '',
}: LineDiffProps): React.JSX.Element {
  const { oldLineNumber, newLineNumber, type, content } = line;

  const typeClasses = getChangeTypeClasses(type);

  // Unified view shows both line numbers in one column
  if (viewMode === 'unified') {
    return (
      <div
        className={`flex items-stretch border-b border-border ${className}`}
        role="row"
        aria-label={`${type} line ${oldLineNumber || newLineNumber}`}
      >
        {showLineNumbers && (
          <>
            {/* Old line number */}
            <div
              className="w-12 flex-shrink-0 px-2 py-0 text-right text-xs text-muted-foreground select-none border-r border-border bg-muted"
              aria-hidden="true"
            >
              {getLineNumberDisplay(type, oldLineNumber, 'old')}
            </div>

            {/* New line number */}
            <div
              className="w-12 flex-shrink-0 px-2 py-0 text-right text-xs text-muted-foreground select-none border-r border-border bg-muted"
              aria-hidden="true"
            >
              {getLineNumberDisplay(type, newLineNumber, 'new')}
            </div>
          </>
        )}

        {/* Line content */}
        <div className="flex-1 px-3 py-0 overflow-x-auto">
          <pre className={typeClasses}>
            {renderInlineHighlight(content, type)}
          </pre>
        </div>
      </div>
    );
  }

  // Side-by-side view shows separate columns for old and new
  return (
    <div
      className={`flex items-stretch border-b border-border ${className}`}
      role="row"
      aria-label={`${type} line ${oldLineNumber || newLineNumber}`}
    >
      {showLineNumbers && (
        <>
          {/* Old line number */}
          <div
            className="w-12 flex-shrink-0 px-2 py-0 text-right text-xs text-muted-foreground select-none border-r border-border bg-muted"
            aria-hidden="true"
          >
            {getLineNumberDisplay(type, oldLineNumber, 'old')}
          </div>

          {/* New line number */}
          <div
            className="w-12 flex-shrink-0 px-2 py-0 text-right text-xs text-muted-foreground select-none border-r border-border bg-muted"
            aria-hidden="true"
          >
            {getLineNumberDisplay(type, newLineNumber, 'new')}
          </div>
        </>
      )}

      {/* Line content */}
      <div className="flex-1 px-3 py-0 overflow-x-auto">
        <pre className={typeClasses}>
          {renderInlineHighlight(content, type)}
        </pre>
      </div>
    </div>
  );
}
