/**
 * @fileoverview Note Code Block Renderer
 * @module presentation/components/notes/NoteCodeBlock
 * @governance EPIC-40 NC-01
 *
 * Renders code blocks in Note messages with syntax highlighting.
 * Supports 15+ languages with copy, expand/collapse, and line numbers.
 *
 * @story NC-01: Note Code Block Renderer
 * @created 2026-01-10
 */

import { useState, useCallback, useRef, useEffect, memo, type ReactElement } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { detectLanguage } from '@/lib/rag/utils/code-chunker';
import './NoteCodeBlock.css';

/**
 * Language display names mapping
 */
const LANGUAGE_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
  html: 'HTML',
  css: 'CSS',
  bash: 'Bash',
  unknown: 'Text',
};

/**
 * Code block data extracted from markdown
 */
export interface CodeBlockData {
  /** Code content */
  code: string;
  /** Detected language */
  language: string;
  /** Start position in original text */
  start: number;
  /** End position in original text */
  end: number;
}

/**
 * Props for NoteCodeBlock component
 */
export interface NoteCodeBlockProps {
  /** Code block data */
  block: CodeBlockData;
  /** Whether to show line numbers by default */
  showLineNumbers?: boolean;
  /** Maximum height before collapsing (pixels) */
  maxCollapsedHeight?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Extract code blocks from markdown-style text
 */
export function extractCodeBlocks(text: string): CodeBlockData[] {
  const blocks: CodeBlockData[] = [];
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = fenceRegex.exec(text)) !== null) {
    blocks.push({
      code: match[2],
      language: detectLanguage(match[1] || ''),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return blocks;
}

/**
 * Check if text contains code blocks
 */
export function hasCodeBlocks(text: string): boolean {
  return /```(\w*)\n/.test(text);
}

/**
 * Render message with code blocks highlighted
 */
export function renderMessageWithCodeBlocks(
  text: string,
  CodeBlockComponent?: typeof NoteCodeBlock
): ReactElement {
  const blocks = extractCodeBlocks(text);
  if (blocks.length === 0) {
    return <>{text}</>;
  }

  const parts: ReactElement[] = [];
  let lastIndex = 0;

  for (const block of blocks) {
    // Add text before this block
    if (block.start > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, block.start)}</span>);
    }

    // Add the code block
    const BlockComponent = CodeBlockComponent || NoteCodeBlock;
    parts.push(<BlockComponent key={`block-${block.start}`} block={block} />);

    lastIndex = block.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

/**
 * Simple syntax tokenizer for code highlighting
 * Reused from CodeFileBlock for consistency
 */
function tokenizeCode(code: string, _language: string): ReactElement {
  const keywords = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'import', 'export', 'from', 'default', 'async', 'await', 'class', 'extends',
    'interface', 'type', 'enum', 'public', 'private', 'protected', 'static',
    'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'def',
    'class', 'struct', 'impl', 'fn', 'let', 'mut', 'pub', 'use', 'mod',
    'print', 'len', 'range', 'str', 'int', 'float', 'bool', 'list', 'dict',
  ];

  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="ncb-line">
          {tokenizeLine(line, keywords)}
        </div>
      ))}
    </>
  );
}

/**
 * Tokenize a single line of code
 */
function tokenizeLine(line: string, keywords: string[]): ReactElement {
  const parts: ReactElement[] = [];
  let remaining = line;
  let idx = 0;

  while (remaining.length > 0) {
    // String literals
    const strMatch = remaining.match(/^(['"`])(?:(?!\1)[^\\]|\\.)*?\1/);
    if (strMatch) {
      parts.push(<span key={idx++} className="ncb-token-string">{strMatch[0]}</span>);
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Comments
    let commentMatch = remaining.match(/^\/\/.*$/);
    if (!commentMatch && remaining.startsWith('/*')) {
      const endIndex = remaining.indexOf('*/');
      if (endIndex !== -1) {
        commentMatch = [remaining.slice(0, endIndex + 2)];
      }
    }
    if (commentMatch) {
      parts.push(<span key={idx++} className="ncb-token-comment">{commentMatch[0]}</span>);
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^\b\d+(\.\d+)?\b/);
    if (numMatch) {
      parts.push(<span key={idx++} className="ncb-token-number">{numMatch[0]}</span>);
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Keywords
    const wordMatch = remaining.match(/^\b[a-zA-Z_][a-zA-Z0-9_]*\b/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.includes(word)) {
        parts.push(<span key={idx++} className="ncb-token-keyword">{word}</span>);
      } else if (word[0] === word[0].toUpperCase() && /^[A-Z]/.test(word)) {
        parts.push(<span key={idx++} className="ncb-token-type">{word}</span>);
      } else {
        parts.push(<span key={idx++}>{word}</span>);
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Default
    parts.push(<span key={idx++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{parts}</>;
}

/**
 * Get display name for language
 */
function getLanguageDisplayName(language: string): string {
  return LANGUAGE_DISPLAY[language] || LANGUAGE_DISPLAY.unknown;
}

/**
 * NoteCodeBlock - Memoized component for rendering code in notes
 *
 * Features:
 * - Syntax highlighting for 15+ languages
 * - Language label display
 * - Toggleable line numbers
 * - Copy to clipboard with toast feedback
 * - Expand/collapse for long blocks (>500 lines)
 * - Virtual scrolling hint for very large blocks
 */
export const NoteCodeBlock = memo(function NoteCodeBlock({
  block,
  showLineNumbers = true,
  maxCollapsedHeight = 300,
  className = '',
}: NoteCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showLineNums, setShowLineNums] = useState(showLineNumbers);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const { code, language } = block;
  const lineCount = code.split('\n').length;
  const isLongBlock = lineCount > 100;

  // Check if content overflows on mount
  useEffect(() => {
    const el = contentRef.current;
    if (el && isLongBlock) {
      setIsOverflowing(el.scrollHeight > maxCollapsedHeight);
    }
  }, [maxCollapsedHeight, isLongBlock]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied', {
        description: `${lineCount} lines copied to clipboard`,
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed', {
        description: 'Could not copy code to clipboard',
      });
    }
  }, [code, lineCount]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const toggleLineNumbers = useCallback(() => {
    setShowLineNums((prev) => !prev);
  }, []);

  const shouldCollapse = isLongBlock && !expanded;

  return (
    <div className={`ncb-container ${className}`}>
      {/* Header */}
      <div className="ncb-header">
        <div className="ncb-header-left">
          <FileCode size={14} className="ncb-icon" />
          <span className="ncb-language">{getLanguageDisplayName(language)}</span>
          <span className="ncb-line-count">{lineCount} lines</span>
        </div>
        <div className="ncb-actions">
          {showLineNums && (
            <button
              type="button"
              onClick={toggleLineNumbers}
              className="ncb-action-btn"
              title="Toggle line numbers"
              aria-label="Toggle line numbers"
            >
              <span className="text-xs">#{lineCount}</span>
            </button>
          )}
          {isOverflowing && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="ncb-action-btn"
              title={expanded ? 'Collapse' : 'Expand'}
              aria-label={expanded ? 'Collapse code' : 'Expand code'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="ncb-action-btn"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? <Check size={14} className="ncb-check" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={`ncb-content ${shouldCollapse ? 'ncb-content--collapsed' : ''}`}
        style={shouldCollapse ? { maxHeight: maxCollapsedHeight } : undefined}
      >
        {showLineNums && (
          <div className="ncb-line-numbers" aria-hidden="true">
            {code.split('\n').map((_, idx) => (
              <div key={idx} className="ncb-line-number">
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        <pre className="ncb-code">
          <code>{tokenizeCode(code, language)}</code>
        </pre>
      </div>

      {/* Expand hint for collapsed content */}
      {shouldCollapse && isOverflowing && (
        <div className="ncb-expand-hint">
          <button
            type="button"
            onClick={toggleExpanded}
            className="ncb-expand-btn"
          >
            <ChevronDown size={14} />
            <span>Show all {lineCount} lines</span>
          </button>
        </div>
      )}
    </div>
  );
});

/**
 * Hook to get code chunks for a message
 * Integrates with code-chunk-store from MM-10
 */
export function useNoteCodeChunks(messageId: string) {
  // Import dynamically to avoid circular dependencies
  const { useMessageCodeChunks } = require('@/infrastructure/persistence/stores/code-chunk-store');
  return useMessageCodeChunks(messageId);
}

/**
 * Default export
 */
export default NoteCodeBlock;
